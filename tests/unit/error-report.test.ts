import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QUERY, summarizeErrors } from '../../scripts/error-report.ts';

test('no failed request is a quiet report', () => {
  const { markdown, total } = summarizeErrors([]);
  assert.equal(total, 0);
  assert.match(markdown, /No 5xx/);
});

test('failed requests become a table with their sum, counted as numbers', () => {
  const { markdown, total } = summarizeErrors([
    { path: '/api/contact', status: '502', outcome: 'resend_failed', requests: '3' },
    { path: '/api/health', status: '503', outcome: 'other', requests: 1 },
  ]);
  assert.equal(total, 4);
  assert.match(markdown, /4 failed/);
  assert.match(markdown, /\| \/api\/contact \| 502 \| resend_failed \| 3 \|/);
});

test('the query counts only 5xx answers of the last day, weighted by sampling', () => {
  assert.match(QUERY, /double2 = 1/);
  assert.match(QUERY, /INTERVAL '1' DAY/);
  assert.match(QUERY, /SUM\(_sample_interval\)/);
});
