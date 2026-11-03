/**
 * Lists the open TODO, FIXME and PLACEHOLDER markers and fails when a file with a
 * TODO or FIXME is not named in ROADMAP.md, so no debt lives only in a comment.
 * Run: node scripts/check-todos.ts
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const roadmap = readFileSync(new URL('../ROADMAP.md', import.meta.url), 'utf8');
const files = execFileSync('git', ['ls-files', 'src', 'scripts', 'tests', 'public'], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);

const untracked: string[] = [];
let count = 0;
for (const file of files) {
  if (file === 'scripts/check-todos.ts') continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const marker = line.match(/\b(TODO|FIXME|PLACEHOLDER)\b/)?.[1];
    if (!marker) return;
    count++;
    console.log(`${file}:${i + 1}  ${marker}  ${line.trim().slice(0, 90)}`);
    if (marker !== 'PLACEHOLDER' && !roadmap.includes(file) && !untracked.includes(file)) {
      untracked.push(file);
    }
  });
}

if (untracked.length) {
  for (const file of untracked) console.error(`${file} has a TODO that ROADMAP.md does not name.`);
  console.error('Add an entry to ROADMAP.md that names the file, or resolve the TODO.');
  process.exit(1);
}
console.log(`todos: ${count} markers, every TODO is on the roadmap`);
