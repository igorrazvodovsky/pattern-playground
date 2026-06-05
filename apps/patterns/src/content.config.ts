import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/patterns',
    // Identity is the filename stem, decoupled from on-disk location. The content
    // directory is flat today; this keeps slugs stable if files are ever regrouped
    // into folders for authoring convenience.
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    role: z.enum(['pattern', 'umbrella', 'quality', 'foundation', 'component']),
    // Classification facets — independent lenses, none privileged by the filesystem.
    // Navigation is a projection over these (see Base.astro); more lenses can be
    // added as fields without moving files.
    activityLevel: z.enum(['operation', 'action', 'activity']).optional(),
    lifecycle: z.string().optional(),
    group: z.string().optional(),
    domain: z.string().optional(),
    atomic: z.enum(['primitive', 'component', 'composition', 'pattern']).optional(),
    mediation: z.enum(['individual', 'coordination']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { patterns };
