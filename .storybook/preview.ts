import type { Preview } from "@storybook/web-components";
import '../src/styles/main.css';
import '../src/main.ts';
import "iconify-icon";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
