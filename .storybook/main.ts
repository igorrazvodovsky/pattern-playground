import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "!../src/stories-react/**/*"
  ],
  addons: ["@storybook/addon-docs"],
  refs: (config, { configType }) => {
    if (configType === 'DEVELOPMENT') {
      return {
        react: {
          title: 'React-based stuff',
          url: 'http://localhost:7007/',
        },
      };
    }
    return {
      react: {
        title: 'React-based stuff',
        url: 'https://pattern-playground-react.onrender.com',
      },
    };
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
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  }
};
export default config;
