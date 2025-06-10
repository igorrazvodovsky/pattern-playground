import { z } from "zod";

// ==========================================
// Zod Schemas
// ==========================================

/**
 * Schema for each attribute in the "attributes" array
 */
export const attributeSchema = z.object({
  name: z.string(),
  label: z.string(),
  value: z.string(),
  unit: z.string().nullable()
});

/**
 * Schema for the actions in the "possibleActions" array
 */
export const actionSchema = z.object({
  actionName: z.string(),
  actionDescription: z.string()
});

/**
 * Schema for version history entries (used by "Product" items)
 */
export const versionHistorySchema = z.object({
  version: z.string(),
  timestamp: z.string(), // could use z.string().datetime() if you want to enforce ISO dates with a refinement
  changes: z.string()
});

/**
 * Schema for related objects
 */
export const relatedObjectSchema = z.object({
  referenceId: z.string(),
  relationshipType: z.string(),
  relationshipDescription: z.string()
});

/**
 * Schema for the connection reference inside a connection object
 */
export const connectionReferenceSchema = z.object({
  target: z.string(),
  relation: z.string()
});

/**
 * Schema for connection objects (used in the "ConnectionsGroup")
 */
export const connectionSchema = z.object({
  connectionId: z.string(),
  connectionType: z.string(),
  description: z.string(),
  references: z.array(connectionReferenceSchema)
});

/**
 * Schema for data type entries (used in the "DataTypesGroup")
 */
export const dataTypeSchema = z.object({
  dataTypeName: z.string(),
  type: z.string(),
  unit: z.string()
});

/**
 * Schema for actions within a service object
 */
export const serviceActionSchema = z.object({
  actionId: z.string(),
  actionDescription: z.string()
});

/**
 * Schema for service objects (used in the "ServicesGroup")
 */
export const serviceSchema = z.object({
  serviceId: z.string(),
  serviceType: z.string(),
  description: z.string(),
  // Either "recommendedFrequency" or "offeredFrequency" might be present
  recommendedFrequency: z.string().optional(),
  offeredFrequency: z.string().optional(),
  actions: z.array(serviceActionSchema)
});

/**
 * Schema for a single item in the flattened model.
 * This covers common properties, while extra keys are marked as optional.
 */
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

/**
 * Schema for the entire JSON file
 */
export const juiceProductionSchema = z.object({
  model: z.array(modelItemSchema)
});

// Exporting a TS type for convenience
export type JuiceProductionModel = z.infer<typeof juiceProductionSchema>;

// ==========================================
// TypeScript Interfaces (Alternative to Zod)
// ==========================================

/**
 * Interface for each attribute in the "attributes" array
 */
export interface Attribute {
  name: string;
  label: string;
  value: string;
  unit: string | null;
}

/**
 * Interface for the actions in the "possibleActions" array
 */
export interface Action {
  actionName: string;
  actionDescription: string;
}

/**
 * Interface for related objects
 */
export interface RelatedObject {
  referenceId: string;
  relationshipType: string;
  relationshipDescription: string;
}

/**
 * Interface for a single item in the model
 */
export interface ModelItem {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  path: string[];
  parentId: string | null;
  childrenIds: string[];
  children?: string[]; // Backward compatibility alias for childrenIds
  relationshipType: string | null;
  relationshipDescription: string | null;
  attributes: Attribute[];
  rulesAndConstraints: string[];
  possibleActions: Action[];
  relatedObjects: RelatedObject[];
  // Optional fields for specific groups
  versionHistory?: {
    version: string;
    timestamp: string;
    changes: string;
  }[];
  connections?: {
    connectionId: string;
    connectionType: string;
    description: string;
    references: {
      target: string;
      relation: string;
    }[];
  }[];
  dataTypesList?: {
    dataTypeName: string;
    type: string;
    unit: string;
  }[];
  servicesList?: {
    serviceId: string;
    serviceType: string;
    description: string;
    recommendedFrequency?: string;
    offeredFrequency?: string;
    actions: {
      actionId: string;
      actionDescription: string;
    }[];
  }[];
}

/**
 * Interface for the selected item in the UI
 */
export interface SelectedItem {
  category: string;
  name: string;
  description?: string;
  id: string;
  type?: string;
}

/**
 * Interface for a relation object in the UI
 */
export interface RelationObject {
  name: string;
  objectType: string;
  label: string;
  description: string;
  relationship: string;
  isAIInferred?: boolean;
}
