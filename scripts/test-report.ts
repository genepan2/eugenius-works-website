/**
 * Reads the JUnit reports in test-results/ and reports how long the tests took.
 * Run: node scripts/test-report.ts            (after npm test)
 *      node scripts/test-report.ts --flaky <dir> <dir> ...   (one dir per test run;
 *      .github/workflows/flaky.yml does this every night)
 * In CI it writes to the job summary, so every run shows the total, the slowest
 * tests and any test over the budget. With --flaky it compares the runs and fails
 * when one test passed in one run and failed in another.
 */
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A single test past this is a slow test, and the report fails. */
const BUDGET_SECONDS = 2;
const SLOWEST = 5;

export interface TestCase {
  file: string;
  name: string;
  seconds: number;
  passed: boolean;
}

const attr = (tag: string, key: string) =>
  tag
    .match(new RegExp(`\\s${key}="([^"]*)"`))?.[1]
    ?.replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&') ?? '';

/** The test cases of one node:test JUnit report. A skipped test is left out. */
export function parseJUnit(xml: string): TestCase[] {
  const cases: TestCase[] = [];
  for (const [, open, body = ''] of xml.matchAll(
    /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g,
  )) {
    if (/<skipped\b/.test(body)) continue;
    cases.push({
      file: attr(open, 'file').replace(/^.*?\/(tests\/)/, '$1'),
      name: attr(open, 'name'),
      seconds: Number(attr(open, 'time')) || 0,
      passed: !/<(failure|error)\b/.test(body),
    });
  }
  return cases;
}

const id = (c: TestCase) => `${c.file} › ${c.name}`;

/** Markdown for the job summary, and the tests over the budget. */
export function summarize(cases: TestCase[]): { markdown: string; slow: TestCase[] } {
  const total = cases.reduce((sum, c) => sum + c.seconds, 0);
  const slowest = [...cases].sort((a, b) => b.seconds - a.seconds).slice(0, SLOWEST);
  const slow = cases.filter((c) => c.seconds > BUDGET_SECONDS);
  const rows = slowest.map((c) => `| ${c.seconds.toFixed(3)} s | ${id(c)} |`).join('\n');
  const markdown = [
    `### Tests: ${cases.length} in ${total.toFixed(2)} s`,
    '',
    `| Time | Slowest ${SLOWEST} |`,
    '| ---: | --- |',
    rows,
    '',
    slow.length
      ? `**Over the ${BUDGET_SECONDS} s budget:** ${slow.map(id).join(', ')}`
      : `No test is over the ${BUDGET_SECONDS} s budget.`,
  ].join('\n');
  return { markdown, slow };
}

/** Tests that passed in at least one run and failed in another. */
export function findFlaky(runs: TestCase[][]): string[] {
  const outcomes = new Map<string, Set<boolean>>();
  for (const run of runs) {
    for (const c of run) outcomes.set(id(c), (outcomes.get(id(c)) ?? new Set()).add(c.passed));
  }
  return [...outcomes].filter(([, seen]) => seen.size > 1).map(([name]) => name);
}

function readDir(dir: string): TestCase[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.xml'))
    .flatMap((file) => parseJUnit(readFileSync(join(dir, file), 'utf8')));
}

function report(markdown: string): void {
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args[0] === '--flaky') {
    const runs = args.slice(1).map(readDir);
    const flaky = findFlaky(runs);
    report(
      flaky.length
        ? `### Flaky tests across ${runs.length} runs\n\n${flaky.map((n) => `- ${n}`).join('\n')}`
        : `### No flaky test across ${runs.length} runs`,
    );
    process.exit(flaky.length ? 1 : 0);
  }
  const cases = readDir('test-results');
  if (cases.length === 0) {
    console.error('No JUnit report in test-results/. Run npm test first.');
    process.exit(1);
  }
  const { markdown, slow } = summarize(cases);
  report(markdown);
  process.exit(slow.length ? 1 : 0);
}
