import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories-react/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../src/stories-react/**/*.mdx",
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (config, { configType }) => {
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
