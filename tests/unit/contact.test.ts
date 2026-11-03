/**
 * The Worker's routing and the contact handler's branching.
 * Run: npm test
 * A stubbed fetch stands in for Resend, so nothing is ever sent. Each test uses
 * its own client IP, because the rate limit lives in module memory.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../../src/worker.ts';

const ASSETS = { fetch: async () => new Response('ASSET_SENTINEL', { status: 200 }) };
const ENV = { RESEND_API_KEY: 'test', CONTACT_FROM: 'a@b.com', CONTACT_TO: 'c@d.com', ASSETS };
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello.' };

let sent = 0;
let resendStatus = 200;
let resendDown = false;
let lastBody: any;
globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
  if (resendDown) throw new TypeError('fetch failed');
  sent++;
  lastBody = JSON.parse(String(init?.body));
  return new Response('{}', { status: resendStatus });
}) as typeof fetch;

const post = (
  body: unknown,
  ip: string,
  headers: Record<string, string> = {},
  path = '/api/contact',
) =>
  new Request(`https://x${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip, ...headers },
    body: JSON.stringify(body),
  });
const formPost = (fields: Record<string, string>, ip: string) =>
  new Request('https://x/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': ip },
    body: new URLSearchParams(fields),
  });
const send = (req: Request, env: object = ENV) => worker.fetch(req, env as any);
const run = async (req: Request, env: object = ENV) => {
  const res = await send(req, env);
  return { status: res.status, body: (await res.json()) as any };
};

test('a method other than POST gets 405', async () => {
  assert.equal((await run(new Request('https://x/api/contact'))).status, 405);
});

test('a filled honeypot answers 200 and sends nothing', async () => {
  const before = sent;
  const trap = await run(post({ ...valid, company: 'AcmeBot' }, '2.2.2.2'));
  assert.equal(trap.status, 200);
  assert.equal(trap.body.ok, true);
  assert.equal(sent, before, 'honeypot must not send mail');
});

test('a missing or invalid field gets 400', async () => {
  for (const body of [
    { ...valid, name: '' },
    { ...valid, name: 'a'.repeat(101) },
    { ...valid, email: 'nope' },
    { ...valid, email: 'a,b@c.de' },
    { ...valid, email: 'a<b>@c.de' },
    { ...valid, message: '' },
    { ...valid, message: 'x'.repeat(5001) },
  ]) {
    assert.equal((await run(post(body, '3.3.3.3'))).status, 400, JSON.stringify(body));
  }
});

test('a missing configuration gets 503 without naming the binding', async () => {
  const res = await run(post(valid, '4.4.4.4'), { ASSETS });
  assert.equal(res.status, 503);
  assert.ok(!/RESEND_API_KEY/.test(JSON.stringify(res.body)), 'must not leak env state');
});

test('a valid message is sent exactly once', async () => {
  const before = sent;
  const res = await run(post(valid, '5.5.5.5'));
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(sent, before + 1);
});

test('the sixth message from one IP in ten minutes gets 429 with retry-after', async () => {
  for (let i = 0; i < 5; i++) await send(post(valid, '6.6.6.6'));
  const limited = await send(post(valid, '6.6.6.6'));
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '600');
  assert.equal((await run(post(valid, '7.7.7.7'))).status, 200, 'another IP is unaffected');
});

test('invalid submissions do not count toward the rate limit', async () => {
  for (let i = 0; i < 5; i++) await send(post({ ...valid, name: '' }, '10.0.0.7'));
  assert.equal((await run(post(valid, '10.0.0.7'))).status, 200);
});

test('every API answer carries the request ID, taken from cf-ray when present', async () => {
  const res = await send(post(valid, '11.0.0.1', { 'cf-ray': 'abc123-FRA' }));
  assert.equal(res.headers.get('x-request-id'), 'abc123-FRA');
  const other = await send(new Request('https://x/api/nope'));
  assert.match(other.headers.get('x-request-id') ?? '', /^[0-9a-f-]{36}$/);
});

test('the health check says whether the form can send, and sends nothing', async () => {
  const before = sent;
  const ready = await run(new Request('https://x/api/health'));
  assert.deepEqual([ready.status, ready.body], [200, { ok: true }]);
  const notReady = await run(new Request('https://x/api/health'), { ASSETS });
  assert.deepEqual([notReady.status, notReady.body], [503, { ok: false }]);
  assert.equal((await send(new Request('https://x/api/health', { method: 'POST' }))).status, 405);
  assert.equal(sent, before);
});

test('no log line carries what the visitor typed', async (t) => {
  const lines: string[] = [];
  for (const level of ['log', 'warn', 'error'] as const) {
    t.mock.method(console, level, (line: string) => lines.push(line));
  }
  await send(post({ ...valid, name: 'Secret Name' }, '11.0.0.2'));
  assert.ok(lines.length > 0);
  for (const line of lines) {
    assert.doesNotMatch(line, /Secret Name|ada@example\.com|Hello\.|11\.0\.0\.2/);
  }
});

test('a page request reaches the asset store', async () => {
  const page = await send(new Request('https://x/'));
  assert.equal(await page.text(), 'ASSET_SENTINEL');
});

test('an unknown /api/ path gets a JSON 404', async () => {
  const res = await run(post(valid, '8.8.8.8', {}, '/api/nope'));
  assert.equal(res.status, 404);
  assert.equal(res.body.ok, false);
  assert.equal(typeof res.body.error, 'string');
});

test('a form post redirects to the matching notice on /contact/', async () => {
  const cases: [Request, string][] = [
    [formPost(valid, '9.9.9.9'), 'contact-sent'],
    [formPost({ ...valid, email: 'nope' }, '9.9.9.10'), 'contact-failed'],
  ];
  for (let i = 0; i < 5; i++) await send(post(valid, '9.9.9.11'));
  cases.push([formPost(valid, '9.9.9.11'), 'contact-busy']);
  for (const [req, notice] of cases) {
    const res = await send(req);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), `https://x/contact/#${notice}`);
  }
});

test('a cross-site post gets 403 and sends nothing', async () => {
  const before = sent;
  assert.equal(
    (await run(post(valid, '10.0.0.1', { origin: 'https://evil.example' }))).status,
    403,
  );
  assert.equal(
    (await run(post(valid, '10.0.0.1', { 'sec-fetch-site': 'cross-site' }))).status,
    403,
  );
  assert.equal(sent, before);
  assert.equal((await run(post(valid, '10.0.0.2', { origin: 'https://x' }))).status, 200);
  assert.equal(
    (await run(post(valid, '10.0.0.3', { 'sec-fetch-site': 'same-origin' }))).status,
    200,
  );
});

test('a body over 20000 bytes gets 413', async () => {
  assert.equal((await run(post(valid, '10.0.0.4', { 'content-length': '20001' }))).status, 413);
});

test('a name with a line break reaches Resend as one line', async () => {
  assert.equal((await run(post({ ...valid, name: 'A\r\nBcc: x@y.z' }, '10.0.0.5'))).status, 200);
  assert.ok(!/[\r\n]/.test(lastBody.subject), 'subject must be a single line');
});

test('a Resend failure gets 502, or the busy notice for a form post', async (t) => {
  resendStatus = 500;
  t.after(() => {
    resendStatus = 200;
  });
  assert.equal((await run(post(valid, '10.0.0.9'))).status, 502);
  const res = await send(formPost(valid, '10.0.0.10'));
  assert.equal(res.headers.get('location'), 'https://x/contact/#contact-busy');
});

test('Resend out of reach gets 502', async (t) => {
  resendDown = true;
  t.after(() => {
    resendDown = false;
  });
  const res = await run(post(valid, '10.0.0.11'));
  assert.equal(res.status, 502);
  assert.equal(res.body.ok, false);
});

test('the contact form flag off pauses the form and the health check', async () => {
  const off = { ...ENV, FLAG_CONTACT_FORM: 'off' };
  const before = sent;
  const res = await run(post(valid, '12.0.0.1'), off);
  assert.equal(res.status, 503);
  assert.equal(sent, before, 'a paused form sends nothing');
  assert.equal((await send(new Request('https://x/api/health'), off)).status, 503);
});

test('each API request writes one data point, unless metrics are off', async () => {
  const points: any[] = [];
  const METRICS = { writeDataPoint: (p: unknown) => points.push(p) };
  await send(post(valid, '12.0.0.2'), { ...ENV, METRICS });
  await send(new Request('https://x/api/scan-me'), { ...ENV, METRICS });
  assert.deepEqual(
    points.map((p) => [p.indexes[0], p.blobs[2]]),
    [
      ['/api/contact', 'sent'],
      ['/api/*', 'other'],
    ],
  );
  await send(new Request('https://x/api/health'), { ...ENV, METRICS, FLAG_METRICS: 'off' });
  assert.equal(points.length, 2);
});
