import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs"
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  // Add viteFinal configuration for proper base URL handling in production
  viteFinal: (config, { configType }) => {
    // Set base URL for production builds
    if (configType === 'PRODUCTION') {
      config.base = './';
    }

    // Configure TypeScript to handle decorators properly
    if (config.esbuild) {
      config.esbuild.target = 'es2020';
    }

    // Ensure TypeScript configuration supports decorators
    config.define = {
      ...config.define,
      __DEV__: JSON.stringify(configType === 'DEVELOPMENT'),
    };

    return config;
  },

  staticDirs: ['../public'],

  core: {
    disableTelemetry: true,
  },

  typescript: {
    reactDocgen: false,
  }
};
export default config;
