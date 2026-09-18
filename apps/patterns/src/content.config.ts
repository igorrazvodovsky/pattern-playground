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
    mediation: z.enum(['individual', 'coordination', 'networking']).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    showRelated: z.boolean().optional(),
    relationships: z.record(z.string(), z.array(z.union([
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
      leaves: z.record(z.string(), z.string()),
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

// --- Sequences ---
//
// See docs/specs/sequences.md.

const sequenceStep = z.object({
  // The decision, as a verb phrase.
  step: z.string(),
  // Absent = the weak form: a decision the sequence needs that names no pattern.
  rule: z.string().optional(),
  // Which side of the rule the step invokes, when not the pattern plain —
  // for example, "its writable dimension". Meaningless without `rule`.
  aspect: z.string().optional(),
  gloss: z.string().optional(),
  // The gloss carries the condition under which the step is skipped.
  optional: z.boolean().optional(),
  // Stored here because step-versus-constituent status is not derivable from
  // edge type.
  constituents: z.array(z.union([
    z.string(),
    z.object({ slug: z.string(), note: z.string().optional() }),
  ])).optional(),
});

// One numbered place: usually one step, but a cluster or choice point takes a
// number for the several steps it holds.
const sequencePosition = z.union([
  sequenceStep,
  // Nothing orders a cluster's steps among themselves, so they share one number
  // rather than being serialised.
  z.object({
    cluster: z.string(),
    gloss: z.string().optional(),
    steps: z.array(sequenceStep).min(2),
  }),
  // Alternatives combine unless marked exclusive; `tree` names the pattern page
  // whose decision tree owns the judgement.
  z.object({
    choice: z.string(),
    gloss: z.string().optional(),
    exclusive: z.boolean().optional(),
    tree: z.string().optional(),
    alternatives: z.array(sequenceStep).min(2),
  }),
]);

const sequences = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/sequences',
    generateId: ({ entry }) => entry.split('/').pop()!.replace(/\.mdx?$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    added: z.coerce.date(),
    updated: z.coerce.date().nullish(),
    description: z.string().optional(),
    // Place in the default reading order. Approximate: sequences sharing a
    // number are an unordered cluster, rendered alphabetically within it.
    order: z.number().int().positive(),
    // What must already hold before the first step has material. Process-register
    // work is stated here as prose, never as a step.
    presupposes: z.string(),
    // Quality slugs. Node metadata, not edges: a sequence is not a graph node,
    // so nothing is emitted into the graph.
    enacts: z.array(z.string()).optional(),
    'sub-sequences': z.array(z.object({
      id: z.string(),
      title: z.string(),
      // The head sub-sequence omits this; `presupposes` covers it.
      initiating: z.string().optional(),
      steps: z.array(sequencePosition).min(1),
      resulting: z.string().optional(),
    })).min(1).superRefine((subs, ctx) => {
      // Ids become heading anchors on one page, alongside the step anchors
      // `<id>-<n>` and the fixed Connections heading, so none may coincide.
      const taken = new Set(['sequence-connections-heading']);
      for (const sub of subs) {
        for (let n = 1; n <= sub.steps.length; n++) taken.add(`${sub.id}-${n}`);
      }
      subs.forEach((sub, i) => {
        if (subs.findIndex((s) => s.id === sub.id) !== i) {
          ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `duplicate sub-sequence id "${sub.id}"` });
        } else if (taken.has(sub.id)) {
          ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `sub-sequence id "${sub.id}" collides with a step anchor or a reserved heading id` });
        }
      });
    }),
    // Cross-sequence only; a call within this sequence is narrated in the
    // calling step's gloss. `at` is `<sub-sequence>[/<step>]`, `to`/`from` is
    // `<sequence>[/<sub-sequence>[/<step>]]`. A far sequence need not exist yet:
    // forward references mark work, not errors.
    connections: z.array(z.object({
      kind: z.enum(['calls', 'hands-off', 'interleaves']),
      at: z.string(),
      to: z.string().optional(),
      from: z.string().optional(),
      // Pattern slug where the connection lands, when one carries it.
      via: z.string().optional(),
      note: z.string().optional(),
    }).refine((c) => (c.to === undefined) !== (c.from === undefined), {
      message: 'a connection names exactly one far end: to (outgoing) or from (incoming); the outgoing side owns the entry once both sequences exist',
    })).optional(),
  }),
});

export const collections = { patterns, sequences };
