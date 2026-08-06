import { create } from 'storybook/theming/create';

// Dark counterpart to theme.js — picked at load time in manager.ts/preview.ts
// when the OS prefers dark. Hex approximations of the library's dark neutral
// ladder (variables-palette.css), since Storybook theming predates oklch.
export default create({
  base: 'dark',
  fontBase: 'system-ui, sans-serif',
  fontCode: 'monospace',
  brandTitle: 'Component playground',
  brandTarget: '_self',

  colorPrimary: 'red',
  colorSecondary: 'gray',

  // UI — appBg ≈ neutral-50 dark (oklch 20%), content/preview ≈ neutral-0 dark (oklch 16%)
  appBg: '#191b1e',
  appContentBg: '#111214',
  appPreviewBg: '#111214',
  appBorderColor: 'rgba(255, 255, 255, 0.14)',
  appBorderRadius: 4,
});
