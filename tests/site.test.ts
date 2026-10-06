/**
 * Self-check for the built site in dist/.
 * Run: npm run build && node tests/site.test.ts
 * No framework: plain asserts, and the files are read as text.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
if (!existsSync(DIST)) {
  console.error('dist/ is missing. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
assert.ok(pages.length > 0, 'dist/ holds no HTML page');

// Whether a site path (`/works/x/`, `/rss.xml`) is served by a file in dist/.
const served = (path: string) =>
  existsSync(join(DIST, path.endsWith('/') ? `${path}index.html` : path));

for (const page of pages) {
  const name = relative(DIST, page);
  const html = readFileSync(page, 'utf8');
  const check = (ok: unknown, what: string) => assert.ok(ok, `${name}: ${what}`);

  check((html.match(/<h1[\s>]/g) ?? []).length === 1, 'needs exactly one <h1>');
  check(/<html[^>]*\slang="en"/.test(html), 'needs lang="en"');
  check(/<title>[^<]+<\/title>/.test(html), 'needs a <title>');

  const description = html
    .match(/<meta name="description" content="([^"]*)"/)?.[1]
    ?.replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  check(description !== undefined, 'needs a meta description');
  check(description!.length <= 160, `meta description is ${description!.length} characters`);

  if (name !== '404.html') {
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
    check(canonical?.endsWith('/'), `canonical must end with "/", got ${canonical}`);
  }

  for (const [, tag] of html.matchAll(/<script\b([^>]*)>/g)) {
    check(
      /\ssrc=/.test(` ${tag}`) || /type="application\/ld\+json"/.test(tag),
      'no inline <script> without src, except JSON-LD',
    );
  }

  for (const [, href] of html.matchAll(/<a\b[^>]*\shref="(\/[^"/][^"]*|\/)"/g)) {
    const path = href.split('#')[0].split('?')[0] || '/';
    check(served(path), `link ${href} does not resolve to a file in dist/`);
    if (!/\.\w+$/.test(path)) check(path.endsWith('/'), `page link ${href} must end with "/"`);
  }
}

const has = (file: string) => assert.ok(existsSync(join(DIST, file)), `dist/${file} is missing`);
for (const file of [
  'sitemap-index.xml',
  'rss.xml',
  'robots.txt',
  '_headers',
  '_redirects',
  'favicon.svg',
  'og.png',
]) {
  has(file);
}

assert.match(readFileSync(join(DIST, '404.html'), 'utf8'), /<meta name="robots" content="noindex"/);

for (const file of files.filter((f) => /\.(html|css|js|xml|svg|txt)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  for (const banned of ['neutral-', 'fonts.googleapis', 'fonts.gstatic']) {
    assert.ok(!text.includes(banned), `${relative(DIST, file)} contains "${banned}"`);
  }
}

console.log(`site: all checks passed (${pages.length} pages)`);
