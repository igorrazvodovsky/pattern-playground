import { callOpenAI } from "../../../../../utils/api.js";
import { ModelItem } from "../../../../schemas/index";

/**
 * Interface for the API service options
 */
export interface ApiServiceOptions {
  stream: boolean;
  onChunk: (chunk: string, isDone: boolean) => void;
}

/**
 * Creates a new ModelItem from a component
 * @param component - The component to convert
 * @param index - The index for generating a unique ID
 * @returns A new ModelItem
 */
export const createModelItem = (component: Partial<ModelItem>, index: number): ModelItem => ({
  id: `comp-${index}`,
  type: 'Component',
  name: component.name || 'Unnamed Component',
  label: component.label || '',
  description: component.description || '',
  path: [],
  parentId: null,
  childrenIds: [],
  relationshipType: component.relationshipType || null,
  relationshipDescription: component.relationshipDescription || '',
  attributes: [],
  rulesAndConstraints: [],
  possibleActions: [],
  relatedObjects: []
});

/**
 * Fetches AI-inferred components based on the provided prompt
 * @param prompt - The prompt to send to the AI
 * @param options - Options for the API call
 * @returns Promise that resolves when the API call is complete
 */
export const fetchAIComponents = async (
  prompt: string,
  options: ApiServiceOptions
): Promise<void> => {
  try {
    await callOpenAI(prompt, {
      stream: options.stream,
      onChunk: options.onChunk
    });
  } catch (error: unknown) {
    throw error;
  }
};
