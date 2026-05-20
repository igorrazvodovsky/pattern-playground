import { defineConfig } from 'astro/config';
import lit from '@astrojs/lit';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [lit(), mdx(), react()],
  publicDir: path.resolve(__dirname, '../../public'),
  vite: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, '../../packages/components/src/components'),
        '@styles': path.resolve(__dirname, '../../packages/components/src/styles'),
        '@pkg': path.resolve(__dirname, '../../packages/components/src'),
      },
    },
  },
});
