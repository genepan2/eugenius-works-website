// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE_URL } from './src/consts.ts';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [sitemap()],
  // No inlining: every script is its own file, so the CSP can say script-src 'self'.
  vite: { plugins: [tailwindcss()], build: { assetsInlineLimit: 0 } },
});
