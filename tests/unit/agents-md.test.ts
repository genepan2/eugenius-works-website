/**
 * Keeps AGENTS.md true to the repository.
 * Run: npm test
 * Every `npm run <script>` it names must be a script in package.json, and every
 * file or folder path in backticks must exist. The same holds for project skills.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const root = new URL('../../', import.meta.url);
const scripts = Object.keys(
  JSON.parse(readFileSync(new URL('package.json', root), 'utf8')).scripts,
);
const skillsDir = new URL('.factory/skills/', root);
const skills = existsSync(skillsDir) ? readdirSync(skillsDir) : [];

const docs = ['AGENTS.md', ...skills.map((name) => `.factory/skills/${name}/SKILL.md`)];

// A backticked token is a path when it has a slash or a file extension, and no spaces,
// globs, placeholders or URL scheme.
const isPath = (t: string) =>
  !/[\s*<>{}:]/.test(t) &&
  !t.startsWith('/') &&
  !t.startsWith('#') &&
  (t.includes('/') || /^[\w.-]*\w\.[a-z]+$/i.test(t));

test('every command, path and skill named in AGENTS.md and the skills exists', () => {
  let checked = 0;
  for (const doc of docs) {
    const text = readFileSync(new URL(doc, root), 'utf8');
    for (const [, name] of text.matchAll(/npm run ([\w:-]+)/g)) {
      assert.ok(
        scripts.includes(name),
        `${doc} names "npm run ${name}", which is not in package.json`,
      );
      checked++;
    }
    if (/\bnpm test\b/.test(text)) assert.ok(scripts.includes('test'), `${doc} names "npm test"`);
    for (const [, token] of text.matchAll(/`([^`\n]+)`/g)) {
      if (!isPath(token)) continue;
      assert.ok(
        existsSync(new URL(token, root)),
        `${doc} names \`${token}\`, which does not exist`,
      );
      checked++;
    }
    for (const [, skill] of text.matchAll(/skill `([\w-]+)`/g)) {
      assert.ok(
        skills.includes(skill),
        `${doc} names the skill "${skill}", which is not in .factory/skills/`,
      );
      checked++;
    }
  }

  assert.ok(checked > 0, 'AGENTS.md names nothing checkable');
});

test('every project skill has a name and a description', () => {
  for (const name of skills) {
    const head = readFileSync(new URL(`.factory/skills/${name}/SKILL.md`, root), 'utf8').match(
      /^---\n([\s\S]*?)\n---\n/,
    );
    assert.ok(head, `.factory/skills/${name}/SKILL.md needs frontmatter`);
    assert.match(
      head[1],
      new RegExp(`^name: ${name}$`, 'm'),
      `${name}: the frontmatter name must match the folder`,
    );
    assert.match(head[1], /^description: \S/m, `${name}: the frontmatter needs a description`);
  }
});
