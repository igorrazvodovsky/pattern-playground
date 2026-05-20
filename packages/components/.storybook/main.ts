import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/Intro.mdx",
    "../src/stories/@(operations|actions|activities|foundations|qualities|components|compositions|data-visualization|visual-elements|hooks|patterns|primitives|utils|01-atoms|02-molecules|03-organisms)/**/*.mdx",
    "../src/stories/@(operations|actions|activities|foundations|qualities|components|compositions|data-visualization|visual-elements|hooks|patterns|primitives|utils|01-atoms|02-molecules|03-organisms)/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-mcp")
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
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

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
