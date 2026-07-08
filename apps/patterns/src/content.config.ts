import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/patterns',
    // Identity is the filename stem, decoupled from on-disk location.
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    role: z.enum(['pattern', 'collection', 'umbrella', 'quality', 'foundation', 'component']),
    // Classification facets. Navigation is a projection over these (see Base.astro); more lenses can be added as fields without moving files.
    activityLevel: z.enum(['operation', 'action', 'activity']).optional(),
    lifecycle: z.string().optional(),
    group: z.string().optional(),
    domain: z.string().optional(),
    atomic: z.enum(['primitive', 'component', 'composition', 'pattern']).optional(),
    mediation: z.enum(['individual', 'coordination', 'networking']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Suppress the rendered "Related patterns" block when the body already
    // narrates its relationships inline. Edges still feed the graph; only the
    // on-page section is skipped (see RelatedPatterns invocation in [...slug].astro).
    showRelated: z.boolean().optional(),
    // Typed relationships: rel-type → array of bare slugs or {to, note} objects.
    // Parsed by scripts/extract-graph-data.ts; see docs/language/relationship-vocabulary.md.
    relationships: z.record(z.array(z.union([
      z.string(),
      z.object({ to: z.string(), note: z.string().optional() }),
    ]))).optional(),
  }),
});

export const collections = { patterns };
