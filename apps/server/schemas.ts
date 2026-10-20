import { z } from 'zod';

// One server-sent event on a streaming endpoint (text lens, explanation).
export type StreamChunk = {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
};

// Text lens schemas
export type TextLensRequest = {
  text: string;
  context?: string;
  direction: 'in' | 'out';
  intensity: number;
};

const textLensRequestSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional(),
  direction: z.enum(['in', 'out']),
  intensity: z.number().min(10).max(100),
});

// Explanation schemas
export type ExplanationRequest = {
  text: string;
  references?: Array<{
    id: string;
    label: string;
    type:
      | 'user'
      | 'document'
      | 'project'
      | 'task'
      | 'file'
      | 'link'
      | 'quote'
      | 'material'
      | 'component'
      | 'product'
      | 'service';
    metadata?: Record<string, unknown>;
  }>;
  context?: string;
};

const explanationRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  references: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum([
          'user',
          'document',
          'project',
          'task',
          'file',
          'link',
          'quote',
          'material',
          'component',
          'product',
          'service',
        ]),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .optional(),
  context: z.string().optional(),
});

// Suggestion schemas. `metadata` is accepted but not read by the server.
const suggestionRequestSchema = z.object({
  prompt: z.string().min(1),
  context: z.object({
    type: z.string().min(1),
    availableOptions: z.record(z.string(), z.array(z.union([z.string(), z.number(), z.boolean()]))),
    metadata: z.record(z.string(), z.json()).optional(),
  }),
});

// Timeline grouping schemas: a flat run of dated records in, a two-level
// hierarchy of named episodes out. The client sends the records rather than an
// id, so the endpoint stays agnostic about whose timeline it is grouping.
export type TimelineRecord = {
  id: string;
  date: string;
  label: string;
  amount?: number;
  category?: string;
};

export type TimelineGroupingRequest = {
  records: TimelineRecord[];
  /** What the timeline is, in a phrase — steers the naming. */
  subject?: string;
};

/* The reply shapes double as the model's output contract: the API is held to
   them through Structured Outputs, so every field is required and none is a
   record with open keys. */
const timelineGroupingSchema = z.object({
  phases: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      episodes: z.array(
        z.object({
          title: z.string(),
          summary: z.string(),
          /** The record the episode opens on; it runs until the next episode's. */
          startId: z.string(),
        }),
      ),
    }),
  ),
});

export type TimelineGrouping = z.infer<typeof timelineGroupingSchema>;
export type TimelinePhase = TimelineGrouping['phases'][number];
export type TimelineEpisode = TimelinePhase['episodes'][number];

const timelineGroupingRequestSchema = z.object({
  records: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        label: z.string(),
        amount: z.number().optional(),
        category: z.string().optional(),
      }),
    )
    .min(2)
    .max(200),
  subject: z.string().max(200).optional(),
});

// Model deduction schemas: one component and its modelled neighbourhood in,
// proposals for components the model does not contain out. The client sends the
// neighbourhood rather than an id, so the endpoint stays agnostic about whose
// model it is reasoning over — and the anchor ids it may answer with are
// exactly the ones it was given.
export type DeductionRequest = {
  focus: {
    id: string;
    name: string;
    type: string;
    description: string;
    attributes: { name: string; value: string }[];
  };
  neighbourhood: { id: string; name: string; relation: string }[];
  /** What the model is, in a phrase — steers the vocabulary. */
  subject?: string;
};

const deductionSchema = z.object({
  proposals: z.array(
    z.object({
      name: z.string(),
      rationale: z.string(),
      /** The modelled component the proposal would hang under. */
      anchorId: z.string(),
    }),
  ),
});

export type Deduction = z.infer<typeof deductionSchema>;
export type Proposal = Deduction['proposals'][number];

const deductionRequestSchema = z.object({
  focus: z.object({
    id: z.string(),
    name: z.string().min(1).max(200),
    type: z.string().max(100),
    description: z.string().max(2000),
    attributes: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .max(40)
      .default([]),
  }),
  neighbourhood: z
    .array(z.object({ id: z.string(), name: z.string(), relation: z.string() }))
    .max(60)
    .default([]),
  subject: z.string().max(300).optional(),
});

export {
  textLensRequestSchema,
  explanationRequestSchema,
  suggestionRequestSchema,
  timelineGroupingRequestSchema,
  timelineGroupingSchema,
  deductionRequestSchema,
  deductionSchema,
};
