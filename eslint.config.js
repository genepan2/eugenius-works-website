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
      // Keep functions small enough to read in one go; the Worker's handler is the ceiling.
      complexity: ['error', 25],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
      // Tests and Worker bindings stub foreign types; `any` there is deliberate and local.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        // Header names, env bindings and JSON keys come from outside and keep their spelling.
        { selector: ['objectLiteralProperty', 'typeProperty', 'objectLiteralMethod'], format: null },
        { selector: 'import', format: null },
      ],
    },
  },
);
