import type { Preview } from "@storybook/web-components";
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
        order: ['Introduction', 'Foundations', ['Overview', '*'], 'Primitives', ['Overview', '*'], 'Components', ['Overview', '*'], 'Compositions', ['Overview', '*'], 'Patterns', ['Overview', '*'], 'Concepts', ['Overview', '*'], '*'],
      },
    },
  },
};

export default preview;
