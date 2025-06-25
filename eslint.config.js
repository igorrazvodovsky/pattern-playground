// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import globals from "globals";
import tseslint from "typescript-eslint";
import lit from 'eslint-plugin-lit';
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/** @type {import('eslint').Linter.Config[]} */
export default [lit.configs['flat/recommended'], {
  files: ["**/*.{js,mjs,cjs,ts,jsx,jsx,tsx}"],
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
}, {
  languageOptions: { globals: globals.browser },
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}, ...tseslint.configs.recommended, ...storybook.configs["flat/recommended"], ...storybook.configs["flat/recommended"]];