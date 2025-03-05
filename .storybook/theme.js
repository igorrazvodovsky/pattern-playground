import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  fontBase: 'system-ui, sans-serif',
  fontCode: 'monospace',
  brandTitle: 'Igor\'s design system playground',
  brandImage: './playground.png',
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