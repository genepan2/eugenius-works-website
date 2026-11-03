import assert from 'node:assert/strict';
import { test } from 'node:test';
import { metaDescription } from '../../src/meta-description.ts';

test('meta description keeps whole sentences while they fit', () => {
  const text = 'One sentence. Two sentences here. ' + 'Three is too long. '.repeat(10);
  assert.equal(metaDescription(text, 40), 'One sentence. Two sentences here.');
});

test('meta description cuts a long first sentence at a word and adds an ellipsis', () => {
  const out = metaDescription('word '.repeat(60), 50);
  assert.ok(out.length <= 50, `${out.length} characters`);
  assert.match(out, /word…$/);
});
