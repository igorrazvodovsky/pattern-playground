import { create } from 'storybook/theming/create';

export default create({
  base: 'light',
  fontBase: 'system-ui, sans-serif',
  fontCode: 'monospace',
  /* Text brand, no image — inherits each theme's text colour, so it needs no
     per-scheme asset. */
  brandTitle: 'Component playground',
  brandTarget: '_self',

  colorPrimary: 'red',
  colorSecondary: 'gray',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: 'rgba(38, 85, 115, 0.15)',
  appBorderRadius: 4,
});