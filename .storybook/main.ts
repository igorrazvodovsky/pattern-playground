import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@chromatic-com/storybook"],
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
  },
};
export default config;
