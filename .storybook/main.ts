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
    options: {
      builder: {
        viteConfigPath: undefined, // Don't use root vite.config.ts
      }
    },
  },

  // Add viteFinal configuration for proper base URL handling in production
  viteFinal: async (config, { configType }) => {
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

    // Disable library build mode for Storybook
    if (config.build) {
      delete config.build.lib;
      config.build.copyPublicDir = true;
    }

    // Remove vite-plugin-dts for Storybook builds (it's only needed for library builds)
    if (config.plugins && Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((plugin) => {
        if (!plugin) return true;
        // Handle both resolved and unresolved plugins
        const pluginObj = typeof plugin === 'function' ? null : plugin;
        if (pluginObj && 'name' in pluginObj) {
          // Remove vite-plugin-dts
          return pluginObj.name !== 'vite:dts';
        }
        return true;
      });
    }

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
