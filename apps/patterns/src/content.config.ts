import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const AUTHORABLE_EVIDENCE_KINDS = ['observed', 'literature', 'used'] as const;
const EVIDENCE_BEARING_ROLES = ['pattern', 'collection'] as const;

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/patterns',
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    added: z.coerce.date(),
    updated: z.coerce.date().nullish(),
    role: z.enum(['pattern', 'collection', 'umbrella', 'quality', 'foundation', 'component']),
    activityLevel: z.enum(['operation', 'action', 'activity']).optional(),
    lifecycle: z.string().optional(),
    group: z.string().optional(),
    domain: z.string().optional(),
    atomic: z.enum(['primitive', 'component', 'composition', 'pattern']).optional(),
    mediation: z.enum(['individual', 'coordination', 'networking']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    showRelated: z.boolean().optional(),
    relationships: z.record(z.array(z.union([
      z.string(),
      z.object({ to: z.string(), note: z.string().optional() }),
    ]))).optional(),
    realised_by: z.array(z.string()).optional(),
    situation: z.object({
      initiating: z.string().optional(),
      resulting: z.array(z.union([
        z.string(),
        z.object({ clause: z.string(), 'sets-up': z.array(z.string()).optional() }),
      ])).optional(),
    }).optional(),
    'decision-trees': z.array(z.object({
      id: z.string(),
      'chart-index': z.number().int().nonnegative().optional(),
      leaves: z.record(z.string()),
    })).optional(),
    seed: z.boolean().optional(),
    evidence: z.array(z.union([
      z.string(),
      z.object({ kind: z.string(), ref: z.string().optional() }),
    ])).optional(),
    disclosure: z.string().optional(),
  }).superRefine((data, ctx) => {
    const kinds: readonly string[] = AUTHORABLE_EVIDENCE_KINDS;
    const evidenceRoles: readonly string[] = EVIDENCE_BEARING_ROLES;

    if (data.evidence !== undefined && !evidenceRoles.includes(data.role)) {
      ctx.addIssue({
        code: 'custom',
        path: ['evidence'],
        message:
          `evidence is only carried by role: ${evidenceRoles.join(' | ')} — a ` +
          `role: ${data.role} entry is a lens or a frame, not a move, so "what ` +
          'backs this" means something weaker. Use seed and disclosure instead.',
      });
    }

    (data.evidence ?? []).forEach((entry, index) => {
      const kind = typeof entry === 'string' ? entry : entry.kind;
      const ref = typeof entry === 'string' ? undefined : entry.ref;

      if (kind === 'built') {
        ctx.addIssue({
          code: 'custom',
          path: ['evidence', index],
          message:
            'built is derived from realised_by, never authored — populate ' +
            'realised_by and the extractor entails it. Authoring it creates a ' +
            'second copy of the claim that can disagree with the first.',
        });
      } else if (!kinds.includes(kind)) {
        ctx.addIssue({
          code: 'custom',
          path: ['evidence', index],
          message: `unknown evidence kind "${kind}" — expected ${kinds.join(' | ')}.`,
        });
      }

      if (ref !== undefined && kind !== 'literature') {
        ctx.addIssue({
          code: 'custom',
          path: ['evidence', index, 'ref'],
          message: `ref names a references/ entry, so it belongs on kind: literature — not on "${kind}".`,
        });
      }
    });
  }),
});

export const collections = { patterns };
