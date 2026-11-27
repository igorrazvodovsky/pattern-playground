import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { fileStem } from './lib/stem';

const AUTHORABLE_EVIDENCE_KINDS = ['observed', 'literature', 'used'] as const;
const EVIDENCE_BEARING_ROLES = ['pattern', 'collection'] as const;

const patterns = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/patterns',
    generateId: ({ entry }) => fileStem(entry),
  }),
  schema: z
    .object({
      'title': z.string(),
      'added': z.coerce.date(),
      'updated': z.coerce.date().nullish(),
      'role': z.enum(['pattern', 'collection', 'quality', 'foundation', 'component']),
      'activityLevel': z.enum(['operation', 'action', 'activity']).optional(),
      'lifecycle': z.string().optional(),
      'group': z.string().optional(),
      'domain': z.string().optional(),
      'mediation': z.enum(['individual', 'coordination', 'networking']).optional(),
      'description': z.string().optional(),
      'tags': z.array(z.string()).optional(),
      'showRelated': z.boolean().optional(),
      'relationships': z
        .record(
          z.string(),
          z.array(z.union([z.string(), z.object({ to: z.string(), note: z.string().optional() })])),
        )
        .optional(),
      'realised_by': z.array(z.string()).optional(),
      // Concept ids this pattern is a move on (docs/language/patterns-and-concepts.md).
      // A cross-dataset reference like `realised_by`: node metadata, never an edge.
      // The object form carries a note for a move on one action or one arm of the
      // concept rather than the whole.
      'acts_on': z
        .array(
          z.union([z.string(), z.object({ concept: z.string(), note: z.string().optional() })]),
        )
        .optional(),
      // Both situations are prose (relationship-vocabulary.md §Situations). The
      // clause-list form of `resulting` is the earlier representation, kept
      // until every page is migrated; it renders as the Consequences fallback.
      'situation': z
        .object({
          initiating: z.string().optional(),
          resulting: z
            .union([
              z.string(),
              z.array(
                z.union([
                  z.string(),
                  z.object({ 'clause': z.string(), 'sets-up': z.array(z.string()).optional() }),
                ]),
              ),
            ])
            .optional(),
        })
        .optional(),
      'decision-trees': z
        .array(
          z.object({
            'id': z.string(),
            'chart-index': z.number().int().nonnegative().optional(),
            'leaves': z.record(z.string(), z.string()),
          }),
        )
        .optional(),
      'seed': z.boolean().optional(),
      'evidence': z.array(z.union([z.string(), z.object({ kind: z.string() })])).optional(),
      'disclosure': z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const kinds: readonly string[] = AUTHORABLE_EVIDENCE_KINDS;
      const evidenceRoles: readonly string[] = EVIDENCE_BEARING_ROLES;

      if (data.role === 'foundation' && data.relationships !== undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['relationships'],
          message:
            'role: foundation entries are reader-facing essays outside the pattern graph and cannot declare relationships — link in body prose instead.',
        });
      }

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
      });
    }),
});

// --- Sequences ---
//
// See docs/specs/sequences.md.

const sequenceStep = z.object({
  // The decision, as a verb phrase.
  step: z.string(),
  // The pattern that says how to take the step, where there is one.
  rule: z.string().optional(),
  gloss: z.string().optional(),
  // The gloss carries the condition under which the step is skipped.
  optional: z.boolean().optional(),
  // Stored here because step-versus-constituent status is not derivable from
  // edge type.
  constituents: z
    .array(z.union([z.string(), z.object({ slug: z.string(), note: z.string().optional() })]))
    .optional(),
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
  // Alternatives combine unless the gloss says otherwise.
  z.object({
    choice: z.string(),
    gloss: z.string().optional(),
    alternatives: z.array(sequenceStep).min(2),
  }),
]);

const sequences = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/sequences',
    generateId: ({ entry }) => fileStem(entry),
  }),
  schema: z.object({
    'title': z.string(),
    'added': z.coerce.date(),
    'updated': z.coerce.date().nullish(),
    'description': z.string().optional(),
    // Place in the default reading order. Approximate: sequences sharing a
    // number are an unordered cluster, rendered alphabetically within it.
    'order': z.number().int().positive(),
    // What must already hold before the first step has material. Process-register
    // work is stated here as prose, never as a step.
    'presupposes': z.string(),
    // Quality slugs. Node metadata, not edges: a sequence is not a graph node,
    // so nothing is emitted into the graph.
    'enacts': z.array(z.string()).optional(),
    'sub-sequences': z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          // The head sub-sequence omits this; `presupposes` covers it.
          initiating: z.string().optional(),
          steps: z.array(sequencePosition).min(1),
          resulting: z.string().optional(),
        }),
      )
      .min(1)
      .superRefine((subs, ctx) => {
        // Ids become heading anchors on one page, alongside the step anchors
        // `<id>-<n>` that "Appears in" links to, so none may coincide.
        const taken = new Set<string>();
        for (const sub of subs) {
          for (let n = 1; n <= sub.steps.length; n++) taken.add(`${sub.id}-${n}`);
        }
        subs.forEach((sub, i) => {
          if (subs.findIndex((s) => s.id === sub.id) !== i) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'id'],
              message: `duplicate sub-sequence id "${sub.id}"`,
            });
          } else if (taken.has(sub.id)) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'id'],
              message: `sub-sequence id "${sub.id}" collides with a step anchor`,
            });
          }
        });
      }),
  }),
});

// --- Concepts ---
//
// Jackson's concepts as a catalogue beside the language: one entry per unit of
// functionality an actor recognises across systems. Entries are definitions
// only, held entirely in frontmatter with no body; how a concept reaches a surface is what patterns (`acts_on`) and
// components (`realised_by`) say. See docs/language/patterns-and-concepts.md.

const concepts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/concepts',
    generateId: ({ entry }) => fileStem(entry),
  }),
  schema: z.object({
    title: z.string(),
    added: z.coerce.date(),
    updated: z.coerce.date().nullish(),
    // One sentence: what the concept is for, in an actor's terms.
    purpose: z.string(),
    // The archetypal scenario in prose: if an actor does this, that follows.
    principle: z.string(),
    // Relations in the world's terms, `name: Kind -> one | opt | set Kind`.
    state: z.array(z.string()).optional(),
    // Action name → its effect in one sentence. Where the fixture world has the
    // action, the name is the world's and the cross-reference validator checks
    // the assignment both ways.
    actions: z
      .record(z.string(), z.string())
      .refine((actions) => Object.keys(actions).length > 0, 'a concept has at least one action'),
    // Known complications: scenarios in which the concept fails its purpose.
    // Where a pattern names this concept, it is usually a move on one of these.
    misfits: z.array(z.string()).optional(),
    // Other words the same concept goes by.
    aliases: z.array(z.string()).optional(),
    // Concept ids without which this one makes no sense. Not a graph edge.
    depends_on: z.array(z.string()).optional(),
    // Shipping systems where an actor has already met this concept.
    appears_in: z.array(z.string()).optional(),
  }),
});

// --- Project languages ---
//
// A project language is a list of design patterns chosen from the library for
// one project, ordered large to small. The entries here are starters for typical
// artifact shapes. See docs/specs/pattern-site.md §Project languages.

const languages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/languages',
    generateId: ({ entry }) => fileStem(entry),
  }),
  schema: z.object({
    title: z.string(),
    added: z.coerce.date(),
    updated: z.coerce.date().nullish(),
    // One sentence: the artifact shape, from the actor's situation.
    description: z.string(),
    // `role: pattern` slugs, large to small. The cross-reference validator
    // resolves each against the patterns collection.
    patterns: z
      .array(z.string())
      .min(1)
      .refine((slugs) => new Set(slugs).size === slugs.length, {
        message: 'a pattern is listed more than once',
      }),
    // Patterns the shape needs that the library does not have yet: a name, and
    // one sentence on what it would do here. The validator fails on a name that
    // matches an existing pattern's title, so a gap goes once its page exists.
    gaps: z.array(z.object({ name: z.string(), note: z.string() })).optional(),
  }),
});

const levels = defineCollection({
  loader: file('src/content/levels.yaml'),
  schema: z.object({
    // Parts run from the largest centres to the smallest.
    order: z.number().int().positive(),
    title: z.string(),
    // What the part's centres have in common.
    lead: z.string(),
    groups: z
      .array(
        z.object({
          title: z.string(),
          // The kind of work this group shares with its neighbours. Consecutive
          // groups with the same section are gathered under it in the sidebar.
          section: z.string().optional(),
          // The connecting sentence: the region the group works in and what its
          // patterns do there. Read in order, the leads summarise the language.
          lead: z.string(),
          patterns: z.array(z.string()).min(1),
        }),
      )
      .min(1)
      // The sidebar names and remembers branches by label, so each label must
      // be unique among its siblings, and a section must be one run of groups.
      .superRefine((groups, ctx) => {
        const top = new Set<string>();
        const inSection = new Map<string, Set<string>>();
        let previous: string | undefined;
        groups.forEach((group, i) => {
          const { section, title } = group;
          if (section && section !== previous) {
            if (inSection.has(section) || top.has(section)) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'section'],
                message: `Section "${section}" repeats a sibling label or is split by other groups`,
              });
            }
            top.add(section);
            inSection.set(section, new Set());
          }
          const siblings = section ? inSection.get(section)! : top;
          if (siblings.has(title) || (!section && inSection.has(title))) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'title'],
              message: `Group "${title}" repeats a sibling label`,
            });
          }
          siblings.add(title);
          previous = section;
        });
      }),
  }),
});

export const collections = { patterns, sequences, concepts, languages, levels };
