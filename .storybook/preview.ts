import type { Preview } from "@storybook/react-vite";
import '../src/styles/main.css';
import '../src/main.ts';
import 'iconify-icon';

const preview: Preview = {
  parameters: {
    docs: {
      toc: { headingSelector: '.sbdocs-content > h2:not(.sbdocs-subtitle), .sbdocs-content > h3' },
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
        order: ['Introduction', 'Foundations', ['Overview', 'Principles', '*'], 'Primitives', ['Overview', '*'], 'Components', ['Overview', '*'], 'Compositions', ['Overview', 'Structure', ['Overview', '*'], '*'], 'Patterns', ['Overview', '*'], 'Data visualization*', ['Overview', 'Chart types', 'Elements', '*'], 'Concepts', ['Overview', '*'], '*'],
      },
    },
  },

  tags: ['autodocs']
};

export default preview;
