import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readingTime } from '../../src/reading-time.ts';

test('reading time is at least one minute', () => {
  assert.equal(readingTime(''), 1);
  assert.equal(readingTime(' \n '), 1);
});

test('reading time rounds up at 230 words a minute', () => {
  assert.equal(readingTime('word '.repeat(230)), 1);
  assert.equal(readingTime('word '.repeat(231)), 2);
});
