/**
 * Self-check for the Worker's routing and the contact handler's branching.
 * Run: node tests/contact.test.ts
 * No framework: plain asserts, and a stubbed fetch so nothing is ever sent.
 */
import assert from 'node:assert/strict';
import worker from '../src/worker.ts';

const ASSETS = { fetch: async () => new Response('ASSET_SENTINEL', { status: 200 }) };
const ENV = {
  RESEND_API_KEY: 'test',
  CONTACT_FROM: 'a@b.com',
  CONTACT_TO: 'c@d.com',
  ASSETS,
};
const post = (body: unknown, ip = '1.1.1.1', path = '/api/contact') =>
  new Request(`https://x${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
    body: JSON.stringify(body),
  });
const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello.' };

let sent = 0;
globalThis.fetch = (async () => {
  sent++;
  return new Response('{}', { status: 200 });
}) as typeof fetch;

const run = async (req: Request, env = ENV) => {
  const res = await worker.fetch(req, env as any, {} as any);
  return { status: res.status, body: await res.json() as any };
};

// Non-POST is rejected.
assert.equal((await run(new Request('https://x/api/contact'))).status, 405);

// Honeypot: looks like success to the bot, but sends nothing.
const before = sent;
const trap = await run(post({ ...valid, company: 'AcmeBot' }, '2.2.2.2'));
assert.equal(trap.status, 200);
assert.equal(trap.body.ok, true);
assert.equal(sent, before, 'honeypot must not send mail');

// Validation.
assert.equal((await run(post({ ...valid, name: '' }, '3.3.3.3'))).status, 400);
assert.equal((await run(post({ ...valid, email: 'nope' }, '3.3.3.3'))).status, 400);
assert.equal((await run(post({ ...valid, message: '' }, '3.3.3.3'))).status, 400);
assert.equal((await run(post({ ...valid, message: 'x'.repeat(5001) }, '3.3.3.3'))).status, 400);

// Missing key: 503, and the response never names the binding.
const unconfigured = await run(post(valid, '4.4.4.4'), { ASSETS } as typeof ENV);
assert.equal(unconfigured.status, 503);
assert.ok(!/RESEND_API_KEY/.test(JSON.stringify(unconfigured.body)), 'must not leak env state');

// Happy path sends exactly once.
const okBefore = sent;
const ok = await run(post(valid, '5.5.5.5'));
assert.equal(ok.status, 200);
assert.equal(ok.body.ok, true);
assert.equal(sent, okBefore + 1);

// Rate limit: 6th from one IP is rejected, a different IP is unaffected.
for (let i = 0; i < 5; i++) await run(post(valid, '6.6.6.6'));
assert.equal((await run(post(valid, '6.6.6.6'))).status, 429);
assert.equal((await run(post(valid, '7.7.7.7'))).status, 200);

// Routing: a page request reaches the asset handler.
const page = await worker.fetch(new Request('https://x/'), ENV as any, {} as any);
assert.equal(await page.text(), 'ASSET_SENTINEL', 'non-API requests must reach ASSETS');

// Routing: an unknown /api/ path is a JSON 404, not the HTML 404 page.
const unknown = await run(post(valid, '8.8.8.8', '/api/nope'));
assert.equal(unknown.status, 404);
assert.equal(unknown.body.ok, false);
assert.equal(typeof unknown.body.error, 'string');

console.log('contact worker: all checks passed');
