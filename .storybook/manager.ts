import { addons } from 'storybook/manager-api';
import theme from './theme';

addons.setConfig({
  theme: theme,
  showToolbar: false,
  sidebar: {
    collapsedRoots: ['primitives'],
  },
});