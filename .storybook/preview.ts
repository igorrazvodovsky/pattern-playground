import type { Preview } from "@storybook/web-components";
import '../src/styles/main.css';
import '../src/main.ts';
import 'iconify-icon';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduction', 'Foundations', ['Overview', '*'], 'Primitives', 'Components', ['Overview', '*'], 'Compositions', ['Overview', '*'], 'Patterns', ['Overview', '*'], '*'],
      },
    },
  },
};

export default preview;
