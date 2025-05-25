import globals from "globals";
import tseslint from "typescript-eslint";
import { configs } from 'eslint-plugin-lit';
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...configs['flat/recommended'],
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,jsx,tsx}"],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
  },
  {
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  ...tseslint.configs.recommended,
];