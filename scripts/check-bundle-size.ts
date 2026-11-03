/**
 * Fails when the built site sends more bytes than its budget, so a new
 * dependency or an unused font subset is noticed when it lands.
 * Run: npm run build && node scripts/check-bundle-size.ts
 */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = new URL('../dist/_astro/', import.meta.url).pathname;

// Budgets in bytes, about 50% above the size when they were set (2026-11).
const BUDGETS: Record<string, number> = {
  js: 5 * 1024,
  css: 20 * 1024,
  woff2: 80 * 1024,
};

const totals: Record<string, number> = {};
for (const name of readdirSync(ASSETS)) {
  const ext = name.split('.').pop()!;
  totals[ext] = (totals[ext] ?? 0) + statSync(join(ASSETS, name)).size;
}

let over = false;
for (const [ext, size] of Object.entries(totals)) {
  const budget = BUDGETS[ext];
  const line = `${ext}: ${(size / 1024).toFixed(1)} KB of ${budget ? (budget / 1024).toFixed(0) : '?'} KB`;
  if (budget === undefined || size > budget) {
    over = true;
    console.error(
      `${line}: ${budget === undefined ? 'no budget for this file type' : 'over budget'}`,
    );
  } else {
    console.log(line);
  }
}
if (over) {
  console.error(
    'Shrink the assets, or raise the budget in scripts/check-bundle-size.ts and say why.',
  );
  process.exit(1);
}
