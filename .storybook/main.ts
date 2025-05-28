import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/stories-react/**/*"
  ],
  addons: ["@storybook/addon-docs"],
  refs: {
    'react-stories': {
      title: 'React Stories',
      url: 'http://localhost:7007/',
    },
  },
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },

  // Add viteFinal configuration for proper base URL handling in production
  viteFinal: (config, { configType }) => {
    // Set base URL for production builds
    if (configType === 'PRODUCTION') {
      config.base = './';
    }

    return config;
  },

  // Configure static files handling
  staticDirs: ['../public'],

  // Add core configuration for iframe communication
  core: {
    disableTelemetry: true,
  }
};
export default config;
