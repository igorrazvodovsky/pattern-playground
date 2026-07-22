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

    /* The widths that matter for this library: the pattern site's pane cap
       (36rem) and a phone. #storybook-root is a `demo` query container (see
       docs.css), so these exercise the narrow-container adaptations. */
    viewport: {
      options: {
        pane: { name: 'Site pane (36rem)', styles: { width: '576px', height: '860px' } },
        phone: { name: 'Phone', styles: { width: '390px', height: '844px' } },
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
