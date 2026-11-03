import assert from 'node:assert/strict';
import { test } from 'node:test';
import { log, scrub } from '../../src/log.ts';

test('scrub redacts fields that hold personal data', () => {
  const out = scrub({ name: 'Ada', email: 'ada@example.com', ip: '1.2.3.4', status: 502 });
  assert.deepEqual(out, { name: '[redacted]', email: '[redacted]', ip: '[redacted]', status: 502 });
});

test('scrub masks an email address inside any other value', () => {
  assert.deepEqual(scrub({ error: 'rejected ada@example.com' }), { error: 'rejected [email]' });
});

test('log writes one JSON object per line, errors to stderr', (t) => {
  const lines: string[] = [];
  t.mock.method(console, 'error', (line: string) => lines.push(line));
  log('error', 'resend.failed', { requestId: 'r1', status: 500, email: 'a@b.co' });
  assert.deepEqual(JSON.parse(lines[0]), {
    level: 'error',
    event: 'resend.failed',
    requestId: 'r1',
    status: 500,
    email: '[redacted]',
  });
});
