import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const patterns = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/patterns' }),
  schema: z.object({
    title: z.string(),
    role: z.enum(['pattern', 'umbrella', 'quality', 'foundation', 'component']),
    activityLevel: z.enum(['operation', 'action', 'activity']).optional(),
    atomic: z.enum(['primitive', 'component', 'composition', 'pattern']).optional(),
    mediation: z.enum(['individual', 'coordination']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { patterns };
