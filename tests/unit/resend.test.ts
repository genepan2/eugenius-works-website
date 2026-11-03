import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { resetResendCircuit, sendEmail } from '../../src/resend.ts';

const email = { from: 'a@b.co', to: 'c@d.co', replyTo: 'e@f.co', subject: 'S', text: 'T' };

let calls: RequestInit[] = [];
let answers: (number | 'throw')[] = [];
globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
  calls.push(init!);
  const next = answers.shift() ?? 200;
  if (next === 'throw') throw new TypeError('fetch failed');
  return new Response('{}', { status: next });
}) as typeof fetch;

beforeEach(() => {
  calls = [];
  answers = [];
  resetResendCircuit();
});

test('a 200 sends once, with the request ID as idempotency key', async () => {
  assert.equal(await sendEmail('k', email, 'req-1'), true);
  assert.equal(calls.length, 1);
  assert.equal((calls[0].headers as Record<string, string>)['idempotency-key'], 'req-1');
  assert.ok(calls[0].signal, 'the request has a timeout');
});

test('a 5xx or a network error is retried once', async () => {
  answers = [500, 200];
  assert.equal(await sendEmail('k', email, 'r'), true);
  assert.equal(calls.length, 2);
  answers = ['throw', 'throw'];
  assert.equal(await sendEmail('k', email, 'r'), false);
  assert.equal(calls.length, 4);
});

test('a 4xx other than 429 is not retried', async () => {
  answers = [422];
  assert.equal(await sendEmail('k', email, 'r'), false);
  assert.equal(calls.length, 1);
});

test('five failures in a row open the circuit, and an open circuit sends nothing', async () => {
  answers = Array(10).fill(422);
  for (let i = 0; i < 5; i++) await sendEmail('k', email, 'r');
  const before = calls.length;
  assert.equal(await sendEmail('k', email, 'r'), false);
  assert.equal(calls.length, before, 'no request while the circuit is open');
});

test('a success resets the failure count', async () => {
  answers = [422, 422, 422, 422, 200, 422];
  for (let i = 0; i < 6; i++) await sendEmail('k', email, 'r');
  answers = [200];
  assert.equal(await sendEmail('k', email, 'r'), true);
});
