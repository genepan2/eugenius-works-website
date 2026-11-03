// @ts-check
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', '.wrangler/', 'node_modules/', '.claude-flow/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      // Tests and Worker bindings stub foreign types; `any` there is deliberate and local.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
