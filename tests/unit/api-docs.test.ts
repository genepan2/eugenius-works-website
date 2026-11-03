import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

test('docs/api.md matches docs/openapi.json', () => {
  const script = new URL('../../scripts/gen-api-docs.ts', import.meta.url).pathname;
  assert.doesNotThrow(
    () => execFileSync(process.execPath, [script, '--check'], { stdio: 'pipe' }),
    'docs/api.md is out of date. Run `npm run docs`.',
  );
});
