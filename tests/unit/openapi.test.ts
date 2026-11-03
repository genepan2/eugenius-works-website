/**
 * Checks that docs/openapi.json describes what the Worker does.
 * Run: npm test
 * Drives the Worker with a stubbed fetch, like contact.test.ts, and compares
 * every status, body, header and field rule it sees with the spec.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import worker from '../../src/worker.ts';

type Schema = {
  type?: string;
  const?: unknown;
  required?: string[];
  properties?: Record<string, Schema>;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  $ref?: string;
};

const spec = JSON.parse(readFileSync(new URL('../../docs/openapi.json', import.meta.url), 'utf8'));
const pathItem = spec.paths['/api/contact'];
const op = pathItem.post;
const resolve = (s: Schema): Schema =>
  s.$ref ? spec.components.schemas[s.$ref.split('/').pop()!] : s;
const message = resolve(op.requestBody.content['application/json'].schema);
const fields = message.properties!;

/** The part of JSON Schema the spec uses. Returns why the value does not fit, or ''. */
function mismatch(schema: Schema, value: unknown): string {
  const s = resolve(schema);
  if (s.const !== undefined && value !== s.const) {
    return `expected ${JSON.stringify(s.const)}, got ${JSON.stringify(value)}`;
  }
  if (s.type === 'boolean' && typeof value !== 'boolean')
    return `expected a boolean, got ${typeof value}`;
  if (s.type === 'string' && typeof value !== 'string')
    return `expected a string, got ${typeof value}`;
  if (s.type === 'object') {
    if (typeof value !== 'object' || value === null) return 'expected an object';
    const record = value as Record<string, unknown>;
    for (const key of s.required ?? []) if (!(key in record)) return `missing "${key}"`;
    for (const [key, sub] of Object.entries(s.properties ?? {})) {
      const why = key in record ? mismatch(sub, record[key]) : '';
      if (why) return `${key}: ${why}`;
    }
  }
  return '';
}

let resendStatus = 200;
globalThis.fetch = (async () => new Response('{}', { status: resendStatus })) as typeof fetch;

const ASSETS = { fetch: async () => new Response('') };
const ENV = { RESEND_API_KEY: 'test', CONTACT_FROM: 'a@b.com', CONTACT_TO: 'c@d.com', ASSETS };
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello.' };

// Every call gets its own address, so the rate limit trips only where a check asks for it.
let calls = 0;
const nextIp = () => `10.1.${Math.floor(++calls / 250)}.${calls % 250}`;

const seen = new Set<string>();

async function call(
  body: unknown,
  {
    headers = {},
    env = ENV as object,
    ip = nextIp(),
    raw,
  }: {
    headers?: Record<string, string>;
    env?: object;
    ip?: string;
    raw?: string;
  } = {},
): Promise<number> {
  const request = new Request('https://x/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip, ...headers },
    body: raw ?? JSON.stringify(body),
  });
  const res = await worker.fetch(request, env as any);
  const status = String(res.status);
  const documented = op.responses[status];
  assert.ok(documented, `status ${status} is not in docs/openapi.json`);
  seen.add(status);
  const why = mismatch(documented.content['application/json'].schema, await res.json());
  assert.equal(why, '', `the ${status} body does not match the spec: ${why}`);
  for (const [name, header] of Object.entries(documented.headers ?? {}) as [
    string,
    { schema: Schema },
  ][]) {
    assert.match(
      res.headers.get(name) ?? '',
      new RegExp(header.schema.pattern!),
      `${status}: ${name} header`,
    );
  }
  return res.status;
}

async function formPost(body: Record<string, string>, env: object = ENV): Promise<string> {
  const request = new Request('https://x/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'CF-Connecting-IP': nextIp() },
    body: new URLSearchParams(body),
  });
  const res = await worker.fetch(request, env as any);
  assert.equal(res.status, 303);
  seen.add('303');
  const location = res.headers.get('location') ?? '';
  assert.match(location, new RegExp(op.responses['303'].headers.Location.schema.pattern));
  return location;
}

test('the spec lists the form post as a request body', () => {
  assert.ok(op.requestBody.content['application/x-www-form-urlencoded']);
});

test('each documented outcome is produced, with a body that fits the spec', async () => {
  assert.equal(await call(valid), 200);
  assert.equal(await call({ ...valid, company: 'AcmeBot' }), 200);
  assert.equal(await call(valid, { headers: { origin: 'https://evil.example' } }), 403);
  assert.equal(await call(valid, { headers: { 'sec-fetch-site': 'cross-site' } }), 403);
  assert.equal(await call(valid, { headers: { 'content-length': '20001' } }), 413);
  assert.equal(await call(null, { raw: '{not json' }), 400);
  assert.equal(await call(valid, { env: { ASSETS } }), 503);
  const ip = nextIp();
  for (let i = 0; i < 5; i++) assert.equal(await call(valid, { ip }), 200);
  assert.equal(await call(valid, { ip }), 429);
});

test('a Resend failure is the documented 502', async (t) => {
  resendStatus = 500;
  t.after(() => {
    resendStatus = 200;
  });
  assert.equal(await call(valid), 502);
});

test('every required field is enforced', async () => {
  for (const key of message.required!) {
    const rest: Record<string, string> = { ...valid };
    delete rest[key];
    assert.equal(await call(rest), 400, `a message without "${key}" must be refused`);
  }
});

test('length rules hold exactly at the documented edges', async () => {
  const fill = (key: string, length: number) =>
    key === 'email'
      ? `${'a'.repeat(length - '@example.com'.length)}@example.com`
      : 'a'.repeat(length);
  for (const [key, field] of Object.entries(fields)) {
    if (field.maxLength !== undefined) {
      assert.equal(
        await call({ ...valid, [key]: fill(key, field.maxLength) }),
        200,
        `${key} at max`,
      );
      assert.equal(
        await call({ ...valid, [key]: fill(key, field.maxLength + 1) }),
        400,
        `${key} over max`,
      );
    }
    if (field.minLength) {
      assert.equal(
        await call({ ...valid, [key]: fill(key, field.minLength - 1) }),
        400,
        `${key} under min`,
      );
    }
  }
});

test('the spec email pattern and the Worker agree', async () => {
  const emailPattern = new RegExp(fields.email.pattern!);
  for (const email of [
    'ada@example.com',
    'a.b+c@d.co',
    'nope',
    'a@b',
    'a,b@c.de',
    'a<b>@c.de',
    'a b@c.de',
    'a@b@c.de',
  ]) {
    const expected = emailPattern.test(email) ? 200 : 400;
    assert.equal(await call({ ...valid, email }), expected, `disagreement on "${email}"`);
  }
});

test('a form post redirects to each documented notice', async () => {
  assert.match(await formPost(valid), /#contact-sent$/);
  assert.match(await formPost({ ...valid, email: 'nope' }), /#contact-failed$/);
  assert.match(await formPost(valid, { ASSETS }), /#contact-busy$/);
});

test('other methods get 405 and other /api/ paths get 404, as the spec says', async () => {
  const get = await worker.fetch(new Request('https://x/api/contact'), ENV as any);
  assert.equal(get.status, 405);
  assert.equal(mismatch(spec.components.schemas.Error, await get.json()), '');
  assert.match(pathItem.description, /\b405\b/);
  const unknown = await worker.fetch(
    new Request('https://x/api/nope', { method: 'POST' }),
    ENV as any,
  );
  assert.equal(unknown.status, 404);
  assert.equal(mismatch(spec.components.schemas.Error, await unknown.json()), '');
  assert.match(spec.info.description, /\b404\b/);
});

// Runs last: tests in one file run in order.
test('no documented status is stale', () => {
  assert.deepEqual([...seen].sort(), Object.keys(op.responses).sort());
});

test('the health check answers as the spec says', async () => {
  const health = spec.paths['/api/health'].get;
  for (const [env, status] of [
    [ENV, '200'],
    [{ ASSETS }, '503'],
  ] as const) {
    const res = await worker.fetch(new Request('https://x/api/health'), env as any);
    assert.equal(String(res.status), status);
    const why = mismatch(
      health.responses[status].content['application/json'].schema,
      await res.json(),
    );
    assert.equal(why, '');
  }
  const post = await worker.fetch(
    new Request('https://x/api/health', { method: 'POST' }),
    ENV as any,
  );
  assert.equal(post.status, 405);
  assert.match(spec.paths['/api/health'].description, /\b405\b/);
});

test('every API answer carries the documented X-Request-Id header', async () => {
  const res = await worker.fetch(new Request('https://x/api/health'), ENV as any);
  assert.ok(res.headers.get('x-request-id'));
  assert.match(spec.info.description, /X-Request-Id/);
});
