// import type { Preview } from "@storybook/react-vite";
import '../src/styles/main.css';
import '../src/styles/docs.css';
import '../src/main.ts';
import 'iconify-icon';
import { PatternRef } from '../src/stories/utils/PatternRef';
import { modalService } from '../src/services/modal-service';
import lightTheme from './theme';
import darkTheme from './theme-dark';

// Docs pages draw their chrome from a theme object, not CSS, so the OS
// preference is read once at load — same limitation as the manager theme.
const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const preview: Preview = {
  /* Modal surfaces mount on document.body, outside the story canvas, and the
     service only tears one down when it is dismissed. A story that opens a
     dialog and never closes it leaves it in the top layer, which makes every
     later story's canvas inert — clicks and focus stop landing. Clear the
     board before each story rather than asking each play function to tidy up
     after itself. */
  beforeEach: () => {
    modalService.closeAll();
  },

  parameters: {
    docs: {
      theme: prefersDark ? darkTheme : lightTheme,
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
