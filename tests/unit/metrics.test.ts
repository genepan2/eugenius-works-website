import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contactOutcome, recordRequest } from '../../src/metrics.ts';

test('a request becomes one data point with path, status, outcome and time', () => {
  const points: unknown[] = [];
  recordRequest(
    { writeDataPoint: (p) => points.push(p) },
    {
      path: '/api/contact',
      method: 'POST',
      status: 502,
      outcome: 'resend_failed',
      ms: 12,
      resendMs: 9,
    },
  );
  assert.deepEqual(points, [
    { indexes: ['/api/contact'], blobs: ['POST', '502', 'resend_failed'], doubles: [12, 1, 9] },
  ]);
});

test('no binding or a failing dataset never breaks the request', () => {
  const metric = { path: '/api/health', method: 'GET', status: 200, outcome: 'other', ms: 1 };
  assert.doesNotThrow(() => recordRequest(undefined, metric));
  assert.doesNotThrow(() =>
    recordRequest(
      {
        writeDataPoint: () => {
          throw new Error('full');
        },
      },
      metric,
    ),
  );
});

test('each contact status has its outcome word', () => {
  assert.equal(contactOutcome(200), 'sent');
  assert.equal(contactOutcome(429), 'rate_limited');
  assert.equal(contactOutcome(418), 'other');
});
