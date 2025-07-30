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

// Semantic zoom schemas
export type SemanticZoomRequest = {
  text: string;
  context?: string;
  direction: 'in' | 'out';
  intensity: number;
};

export type SemanticZoomStreamChunk = {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
};

const semanticZoomRequestSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional(),
  direction: z.enum(['in', 'out']),
  intensity: z.number().min(10).max(100)
});

export {
  juiceProductionSchema,
  jsonSchema,
  semanticZoomRequestSchema
};
