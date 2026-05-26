import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/patterns',
    generateId: ({ entry }) => {
      let id = entry.replace(/\.(md|mdx)$/, '');
      id = id.replace(/\/index$/, '');
      return id;
    },
  }),
});

export const collections = { patterns };
