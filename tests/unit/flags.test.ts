import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { enabled, FLAGS } from '../../src/flags.ts';

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

test('every flag is read somewhere in src/ and described in the runbook', () => {
  const root = new URL('../../', import.meta.url);
  const sources = readdirSync(new URL('src/', root), { recursive: true })
    .map(String)
    .filter((file) => /\.(ts|astro)$/.test(file) && file !== 'flags.ts')
    .map((file) => readFileSync(new URL(`src/${file}`, root), 'utf8'))
    .join('\n');
  const runbook = readFileSync(new URL('docs/runbook.md', root), 'utf8');

  for (const [flag, { env }] of Object.entries(FLAGS)) {
    assert.ok(
      sources.includes(`enabled('${flag}'`),
      `${flag} is never read: remove it from src/flags.ts, or use it`,
    );
    assert.ok(runbook.includes(env), `${env} is missing from docs/runbook.md`);
  }
});
