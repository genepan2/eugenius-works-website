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
  'contact/index.html',
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

// One ink. Built CSS and SVG carry only black, white and transparent. In HTML the
// only color is the theme-color meta tag; links and JSON-LD hold `#fragments`
// and URLs, which are not colors, so the HTML is not scanned for hex.
const NEUTRAL_HEX = new Set(['#000', '#fff', '#000000', '#ffffff', '#0000', '#00000000']);
const NAMED = /\b(gr[ae]y|silver|red|blue|green|yellow|orange|purple|pink|brown|navy|teal)\b/i;
const ZERO_OR_FULL = '(?:0|100|255|1)(?:%|deg)?';

function colorProblems(raw: string): string[] {
  const bad: string[] = [];
  // Tailwind probes color support with throwaway colors inside @supports.
  const text = raw.replace(/@supports[^{]*\{/g, '{').replace(/url\([^)]*\)/g, '');

  for (const [hex] of text.matchAll(/#[0-9a-fA-F]{3,8}(?![\w-])/g)) {
    if (!NEUTRAL_HEX.has(hex.toLowerCase())) bad.push(hex);
  }
  for (const [call, fn, args] of text.matchAll(/\b(rgba?|hsla?|oklch|oklab|lab|lch|color)\(([^)]*)\)/g)) {
    const ok =
      (/^rgba?$/.test(fn) && /^\s*(0[\s,]+0[\s,]+0|255[\s,]+255[\s,]+255)\b/.test(args)) ||
      (/^hsla?$/.test(fn) && /^\s*[\d.]+(deg)?[\s,]+[\d.]+%[\s,]+(0|100)%/.test(args)) ||
      (/^(oklch|oklab|lab|lch)$/.test(fn) &&
        new RegExp(`^\\s*(?:0|1|100)(?:%)?[\\s,]+0[\\s,]+(?:0|none)`).test(args));
    if (!ok) bad.push(call);
  }
  for (const [call, args] of [...text.matchAll(/\bcolor-mix\(([^)]*)\)/g)].map((m): [string, string] => [m[0], m[1]])) {
    const words = args.replace(/\bin\s+[\w-]+/, '').replace(/[\d.]+%/g, '').split(/[\s,]+/).filter(Boolean);
    const neutral = ['currentcolor', 'transparent', 'black', 'white'];
    if (!words.every((w) => neutral.includes(w.toLowerCase()))) bad.push(call);
  }
  // Named colors count only as values of color-bearing properties.
  for (const [, prop, value] of text.matchAll(
    /(?:^|[;{\s])((?:[\w-]*color|background|border[\w-]*|outline[\w-]*|fill|stroke|[\w-]*shadow)\s*):\s*([^;}{]+)/g,
  )) {
    if (NAMED.test(value)) bad.push(`${prop.trim()}: ${value.trim()}`);
  }
  for (const [, attr, value] of text.matchAll(/\s(fill|stroke|stop-color|color)="([^"]*)"/g)) {
    if (NAMED.test(value)) bad.push(`${attr}="${value}"`);
  }
  return bad;
}

for (const file of files) {
  const name = relative(DIST, file);
  if (/\.(css|svg)$/.test(file)) {
    assert.deepEqual(colorProblems(readFileSync(file, 'utf8')), [], `${name}: a color other than black or white`);
  }
  if (file.endsWith('.html')) {
    const html = readFileSync(file, 'utf8');
    const theme = html.match(/<meta name="theme-color" content="([^"]*)"/)?.[1];
    assert.ok(theme === undefined || NEUTRAL_HEX.has(theme.toLowerCase()), `${name}: theme-color ${theme}`);
    // No inline styling of any kind: every rule lives in a stylesheet the CSP allows.
    assert.ok(!/\sstyle="/.test(html), `${name}: has a style attribute`);
    assert.ok(!/<style[\s>]/.test(html), `${name}: has a <style> element`);
  }
  // The owner banned dots and circles: no rounded corners, no circles.
  if (file.endsWith('.css')) {
    const radii = [...readFileSync(file, 'utf8').matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
    assert.deepEqual(radii.filter((r) => !/^0(px)?$/.test(r)), [], `${name}: non-zero border-radius`);
  }
  if (/\.(html|svg)$/.test(file)) {
    assert.ok(!/<circle[\s>]/.test(readFileSync(file, 'utf8')), `${name}: has a <circle>`);
  }
}

console.log(`site: all checks passed (${pages.length} pages)`);
