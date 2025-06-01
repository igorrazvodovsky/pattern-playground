import type { Preview } from "@storybook/react";
import '../src/styles/main.css';

const preview: Preview = {
  parameters: {
    docs: {
      toc: { headingSelector: '.sbdocs-content > h2:not(.sbdocs-subtitle), .sbdocs-content > h3' },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduction', 'Foundations', ['Overview', '*'], 'Primitives', ['Overview', '*'], 'Components', ['Overview', '*'], 'Compositions', ['Overview', '*'], 'Patterns', ['Overview', '*'], 'Concepts', ['Overview', '*'], '*'],
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  tags: ['autodocs']
};

export default preview;