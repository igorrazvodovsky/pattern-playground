import { z } from "zod";

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

// Schema for version history entries (used by "Product" items)
const versionHistorySchema = z.object({
  version: z.string(),
  timestamp: z.string(), // could use z.string().datetime() if you want to enforce ISO dates with a refinement
  changes: z.string()
});

// Schema for related objects
const relatedObjectSchema = z.object({
  referenceId: z.string(),
  relationshipType: z.string(),
  relationshipDescription: z.string()
});

// Schema for the connection reference inside a connection object
const connectionReferenceSchema = z.object({
  target: z.string(),
  relation: z.string()
});

// Schema for connection objects (used in the "ConnectionsGroup")
const connectionSchema = z.object({
  connectionId: z.string(),
  connectionType: z.string(),
  description: z.string(),
  references: z.array(connectionReferenceSchema)
});

// Schema for data type entries (used in the "DataTypesGroup")
const dataTypeSchema = z.object({
  dataTypeName: z.string(),
  type: z.string(),
  unit: z.string()
});

// Schema for actions within a service object
const serviceActionSchema = z.object({
  actionId: z.string(),
  actionDescription: z.string()
});

// Schema for service objects (used in the "ServicesGroup")
const serviceSchema = z.object({
  serviceId: z.string(),
  serviceType: z.string(),
  description: z.string(),
  // Either "recommendedFrequency" or "offeredFrequency" might be present
  recommendedFrequency: z.string().optional(),
  offeredFrequency: z.string().optional(),
  actions: z.array(serviceActionSchema)
});

// Schema for a single item in the flattened model.
// This covers common properties, while extra keys are marked as optional.
export const modelItemSchema = z.object({
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
  relatedObjects: z.array(relatedObjectSchema),
  // Optional fields for specific groups
  versionHistory: z.array(versionHistorySchema).optional(),
  connections: z.array(connectionSchema).optional(),
  dataTypesList: z.array(dataTypeSchema).optional(),
  servicesList: z.array(serviceSchema).optional()
});

// Schema for the entire JSON file
export const pasteurizerSchema = z.object({
  model: z.array(modelItemSchema)
});

// Exporting a TS type for convenience
export type PasteurizerModel = z.infer<typeof pasteurizerSchema>;
