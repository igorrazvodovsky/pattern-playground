import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const utilsPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../utils");
const sharedPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../shared");

const config: StorybookConfig = {
  stories: [
    "../src/stories/Intro.mdx",
    "../src/stories/*.mdx",
    "../src/stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
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

    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        '@utils': utilsPath,
        '@shared': sharedPath,
      },
    };

    if (config.esbuild) {
      config.esbuild.target = 'es2020';
    }

    // Deps only reached from story files are invisible to Vite's initial scan;
    // declaring them up front avoids a mid-session re-optimize + full reload.
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [...(config.optimizeDeps?.include ?? []), 'leaflet', '@elenajs/core'],
    };

    config.define = {
      ...config.define,
      __DEV__: JSON.stringify(configType === 'DEVELOPMENT'),
    };

    // Astro exposes `PUBLIC_`-prefixed env vars to the client natively; Vite on
    // its own only exposes `VITE_`. Adding the prefix here lets shared code
    // under packages/components read one name in both builds — currently
    // PUBLIC_TLDRAW_LICENSE_KEY (see src/tldraw/licenseKey.ts).
    config.envPrefix = [
      ...(typeof config.envPrefix === 'string'
        ? [config.envPrefix]
        : (config.envPrefix ?? ['VITE_'])),
      'PUBLIC_',
    ];

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

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
