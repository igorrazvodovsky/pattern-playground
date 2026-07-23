import { z } from 'zod';

// Define TypeScript types based on Zod schemas
export type Attribute = {
  name: string;
  label: string;
  value: string;
  unit: string | null;
};

export type Action = {
  actionName: string;
  actionDescription: string;
};

export type RelatedObject = {
  referenceId: string;
  relationshipType: string;
  relationshipDescription: string;
};

export type ModelItem = {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  path: string[];
  parentId: string | null;
  childrenIds: string[];
  relationshipType: string;
  relationshipDescription: string;
  attributes: Attribute[];
  rulesAndConstraints: string[];
  possibleActions: Action[];
  relatedObjects: RelatedObject[];
  // Additional properties that might be present in the API response
  component_name?: string;
  [key: string]: unknown;
};

export type JuiceProductionModel = {
  model: ModelItem[];
};

// Schema for each attribute in the "attributes" array
const attributeSchema = z.object({
  name: z.string(),
  label: z.string(),
  value: z.string(),
  unit: z.string().nullable()
});

// Schema for the actions in the "possibleActions" array
const actionSchema = z.object({
  actionName: z.string(),
  actionDescription: z.string()
});

// Schema for related objects
const relatedObjectSchema = z.object({
  referenceId: z.string(),
  relationshipType: z.string(),
  relationshipDescription: z.string()
});

// Schema for a single item in the flattened model.
const modelItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  label: z.string(),
  description: z.string(),
  path: z.array(z.string()),
  parentId: z.string().nullable(),
  childrenIds: z.array(z.string()),
  relationshipType: z.string().nullable(),
  relationshipDescription: z.string().nullable(),
  attributes: z.array(attributeSchema),
  rulesAndConstraints: z.array(z.string()),
  possibleActions: z.array(actionSchema),
  relatedObjects: z.array(relatedObjectSchema)
});

// Schema for the entire JSON file
const juiceProductionSchema = z.object({
  model: z.array(modelItemSchema)
});

// Convert Zod schema to JSON Schema format
const jsonSchema = {
  additionalProperties: false,
  type: "object",
  properties: {
    model: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          type: { type: "string" },
          name: { type: "string" },
          label: { type: "string" },
          description: { type: "string" },
          path: { type: "array", items: { type: "string" } },
          parentId: { type: ["string", "null"] },
          childrenIds: { type: "array", items: { type: "string" } },
          relationshipType: { type: ["string", "null"] },
          relationshipDescription: { type: ["string", "null"] },
          attributes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                label: { type: "string" },
                value: { type: "string" },
                unit: { type: ["string", "null"] }
              },
              required: ["name", "label", "value", "unit"]
            }
          },
          rulesAndConstraints: { type: "array", items: { type: "string" } },
          possibleActions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                actionName: { type: "string" },
                actionDescription: { type: "string" }
              },
              required: ["actionName", "actionDescription"]
            }
          },
          relatedObjects: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                referenceId: { type: "string" },
                relationshipType: { type: "string" },
                relationshipDescription: { type: "string" }
              },
              required: ["referenceId", "relationshipType", "relationshipDescription"]
            }
          }
        },
        required: [
          "id", "type", "name", "label", "description", "path", "parentId",
          "childrenIds", "relationshipType", "relationshipDescription", "attributes",
          "rulesAndConstraints", "possibleActions", "relatedObjects"
        ]
      }
    }
  },
  required: ["model"]
};

// Text lens schemas
export type TextLensRequest = {
  text: string;
  context?: string;
  direction: 'in' | 'out';
  intensity: number;
};

export type TextLensStreamChunk = {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
};

const textLensRequestSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional(),
  direction: z.enum(['in', 'out']),
  intensity: z.number().min(10).max(100)
});

// Explanation schemas
export type ExplanationRequest = {
  text: string;
  references?: Array<{
    id: string;
    label: string;
    type: 'user' | 'document' | 'project' | 'task' | 'file' | 'link' | 'quote' | 'material' | 'component' | 'product' | 'service';
    metadata?: Record<string, unknown>;
  }>;
  context?: string;
};

export type ExplanationStreamChunk = {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
};

const explanationRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  references: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['user', 'document', 'project', 'task', 'file', 'link', 'quote', 'material', 'component', 'product', 'service']),
    metadata: z.record(z.unknown()).optional()
  })).optional(),
  context: z.string().optional()
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

export type TimelineEpisode = {
  title: string;
  summary: string;
  /** The record the episode opens on; it runs until the next episode's. */
  startId: string;
};

export type TimelinePhase = {
  title: string;
  summary: string;
  episodes: TimelineEpisode[];
};

export type TimelineGrouping = {
  phases: TimelinePhase[];
};

const timelineGroupingRequestSchema = z.object({
  records: z.array(z.object({
    id: z.string(),
    date: z.string(),
    label: z.string(),
    amount: z.number().optional(),
    category: z.string().optional()
  })).min(2).max(200),
  subject: z.string().max(200).optional()
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

export type Proposal = {
  name: string;
  rationale: string;
  /** The modelled component the proposal would hang under. */
  anchorId: string;
};

export type Deduction = {
  proposals: Proposal[];
};

const deductionRequestSchema = z.object({
  focus: z.object({
    id: z.string(),
    name: z.string().min(1).max(200),
    type: z.string().max(100),
    description: z.string().max(2000),
    attributes: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .max(40)
      .default([])
  }),
  neighbourhood: z
    .array(z.object({ id: z.string(), name: z.string(), relation: z.string() }))
    .max(60)
    .default([]),
  subject: z.string().max(300).optional()
});

export {
  juiceProductionSchema,
  jsonSchema,
  textLensRequestSchema,
  explanationRequestSchema,
  timelineGroupingRequestSchema,
  deductionRequestSchema
};
