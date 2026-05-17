import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/Intro.mdx",
    "../src/stories/@(operations|actions|activities|foundations|qualities|components|compositions|data-visualization|visual-elements|hooks|patterns|primitives|utils)/**/*.mdx",
    "../src/stories/@(operations|actions|activities|foundations|qualities|components|compositions|data-visualization|visual-elements|hooks|patterns|primitives|utils)/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-mcp'
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal: async (config, { configType }) => {
    if (configType === 'PRODUCTION') {
      config.base = './';
    }

    if (config.esbuild) {
      config.esbuild.target = 'es2020';
    }

    config.define = {
      ...config.define,
      __DEV__: JSON.stringify(configType === 'DEVELOPMENT'),
    };

    if (config.build) {
      config.build.copyPublicDir = true;
    }

    return config;
  },

  staticDirs: ['../../../public'],

  docs: {
    defaultName: 'Docs',
  },

  initialPath: '/docs/introduction--docs',

  core: {
    disableTelemetry: true,
  },

  typescript: {
    reactDocgen: false,
  },

  tags: {
    'activity-level:operation': {},
    'activity-level:action': {},
    'activity-level:activity': {},
    'atomic:primitive': {},
    'atomic:component': {},
    'atomic:composition': {},
    'lifecycle:seeking': {},
    'lifecycle:evaluation': {},
    'lifecycle:coordination': {},
    'mediation:individual': {},
    'mediation:coordination': {},
  },
};
export default config;
