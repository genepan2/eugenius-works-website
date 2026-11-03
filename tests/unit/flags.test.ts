import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enabled } from '../../src/flags.ts';

test('a flag without a variable keeps its default', () => {
  assert.equal(enabled('contactForm', {}), true);
});

test('"off", "false" and "0" switch a flag off, "on", "true" and "1" on', () => {
  for (const value of ['off', 'OFF', 'false', '0', ' off ']) {
    assert.equal(enabled('contactForm', { FLAG_CONTACT_FORM: value }), false, value);
  }
  for (const value of ['on', 'true', '1']) {
    assert.equal(enabled('metrics', { FLAG_METRICS: value }), true, value);
  }
});

test('an unknown value keeps the default rather than guessing', () => {
  assert.equal(enabled('contactForm', { FLAG_CONTACT_FORM: 'maybe' }), true);
});
