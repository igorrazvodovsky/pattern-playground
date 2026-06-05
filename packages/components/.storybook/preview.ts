// import type { Preview } from "@storybook/react-vite";
import '../src/styles/main.css';
import '../src/styles/docs.css';
import '../src/main.ts';
import 'iconify-icon';
import { PatternRef } from '../src/stories/utils/PatternRef';

const preview: Preview = {
  parameters: {
    docs: {
      toc: { headingSelector: '.sbdocs-content > h2:not(.sbdocs-subtitle), .sbdocs-content > h3' },
      components: { PatternRef },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Introduction',
          'Foundations', ['Overview', 'Principles', '*'],
          '*'],
      },
    },

    a11y: {
      test: 'error'
    }
  },

  tags: ['autodocs']
};

export default preview;
