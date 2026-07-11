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
    // Component realisation: Storybook docs ids of the components that realise
    // this move. The single authorable home for the claim — <ComponentRef> prose
    // mentions are citations, not claims. Cross-dataset: validated against
    // Storybook's index.json, emitted as node metadata, never an edge. See
    // docs/language/relationship-vocabulary.md §Component realisation.
    realised_by: z.array(z.string()).optional(),
    // Situations: the design situation the move applies in and the one it leaves
    // behind. A resulting clause with `sets-up` emits a `precedes` edge carrying
    // the clause as derived situation text. See relationship-vocabulary.md §Situations.
    situation: z.object({
      initiating: z.string().optional(),
      resulting: z.array(z.union([
        z.string(),
        z.object({ clause: z.string(), 'sets-up': z.array(z.string()).optional() }),
      ])).optional(),
    }).optional(),
    // Decision trees: leaf-label → pattern-slug maps for the page's Mermaid
    // flowcharts; each resolved path emits a `recommends` edge with hints.
    'decision-trees': z.array(z.object({
      id: z.string(),
      'chart-index': z.number().int().nonnegative().optional(),
      leaves: z.record(z.string()),
    })).optional(),
  }),
});

export const collections = { patterns };
