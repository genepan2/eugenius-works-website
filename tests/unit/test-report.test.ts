import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findFlaky, parseJUnit, summarize } from '../../scripts/test-report.ts';

const xml = `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
	<testcase name="a fast test" time="0.002" classname="test" file="/home/x/repo/tests/unit/a.test.ts"/>
	<testcase name="a &quot;quoted&quot; test" time="0.5" classname="test" file="/home/x/repo/tests/unit/a.test.ts">
		<failure type="testCodeFailure" message="boom">boom</failure>
	</testcase>
	<testcase name="a skipped test" time="0" classname="test" file="/home/x/repo/tests/unit/a.test.ts">
		<skipped type="skipped" message="later"/>
	</testcase>
</testsuites>`;

test('a JUnit report becomes test cases with file, name, time and outcome', () => {
  assert.deepEqual(parseJUnit(xml), [
    { file: 'tests/unit/a.test.ts', name: 'a fast test', seconds: 0.002, passed: true },
    { file: 'tests/unit/a.test.ts', name: 'a "quoted" test', seconds: 0.5, passed: false },
  ]);
});

test('the summary names the total, the slowest tests and any test over the budget', () => {
  const fast = { file: 'tests/unit/a.test.ts', name: 'fast', seconds: 0.01, passed: true };
  const slow = { file: 'tests/unit/a.test.ts', name: 'slow', seconds: 3, passed: true };
  const { markdown, slow: over } = summarize([fast, slow]);
  assert.match(markdown, /Tests: 2 in 3\.01 s/);
  assert.ok(markdown.indexOf('slow') < markdown.indexOf('fast'), 'slowest first');
  assert.deepEqual(over, [slow]);
  assert.match(summarize([fast]).markdown, /No test is over/);
});

test('a test that passed in one run and failed in another is flaky', () => {
  const run = (passed: boolean) => [
    { file: 'tests/unit/a.test.ts', name: 'steady', seconds: 0, passed: true },
    { file: 'tests/unit/a.test.ts', name: 'shaky', seconds: 0, passed },
  ];
  assert.deepEqual(findFlaky([run(true), run(false), run(true)]), ['tests/unit/a.test.ts › shaky']);
  assert.deepEqual(findFlaky([run(true), run(true)]), []);
});
