// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import globals from "globals";
import tseslint from "typescript-eslint";
import lit from 'eslint-plugin-lit';
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import react from 'eslint-plugin-react'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "storybook-static/**", "node_modules/**", "src/stories/.obsidian/**"],
  },
  lit.configs['flat/recommended'],
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,jsx,tsx}"],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      '@typescript-eslint/no-namespace': ['error', {
        allowDeclarations: true,
        allowDefinitionFiles: true
      }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ["src/**/*.tsx"],
    plugins: {
      react,
    },
    rules: {
      'react/forbid-component-props': ['error', {
        forbid: [{
          propName: 'style',
          message: 'Use CSS classes, not inline styles. See .claude/rules/styling.md',
        }],
      }],
    },
  },
  {
    files: ["src/components/**/*.ts"],
    ignores: ["src/components/register-all.ts", "src/components/component-registry.ts"],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "CallExpression[callee.object.name='customElements'][callee.property.name='define']",
        message: 'Register components via src/components/register-all.ts. See .claude/rules/web-components.md',
      }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "CallExpression[callee.property.name=/^(querySelector|querySelectorAll|closest|matches)$/] > Literal[value=/^\\[(role|aria-)/]",
        message: 'Use data-* attributes as JS hooks, not role/aria-*. See .claude/rules/web-components.md',
      }],
    },
  },
  {
    files: ["server/**/*.{ts,js}", "scripts/**/*.{ts,js,mjs}", "utils/**/*.ts"],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ["src/stories/**/*.{ts,tsx}", "src/tldraw/**/*.{ts,tsx}"],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  ...storybook.configs["flat/recommended"]
];