import { ModelItem } from "../../schemas/index";
import juiceProductionData from './data/JuiceProduction.json' with { type: 'json' };

interface JuiceProductionDataStructure {
  flattenedModel?: Partial<ModelItem>[];
  [key: string]: unknown;
}

/**
 * Ensures that an item from the data conforms to the ModelItem type
 * @param item - The item to ensure type compatibility
 * @returns The item as a ModelItem
 */
export const ensureModelItem = (item: Partial<ModelItem>): ModelItem => {
  // Ensure required properties have appropriate values
  const ensuredItem = {
    ...item,
    relationshipType: item.relationshipType ?? null,
    relationshipDescription: item.relationshipDescription ?? null,
    attributes: item.attributes || [],
    rulesAndConstraints: item.rulesAndConstraints || [],
    possibleActions: item.possibleActions || [],
    relatedObjects: item.relatedObjects || []
  } as ModelItem;

  // Map childrenIds to children for backwards compatibility
  if ('childrenIds' in item && Array.isArray(item.childrenIds)) {
    ensuredItem.children = item.childrenIds;
  }

  return ensuredItem;
};

/**
 * Ensures that an array of items conforms to the ModelItem[] type
 * @param items - The array of items to ensure type compatibility
 * @returns The array as ModelItem[]
 */
export const ensureModelItems = (items: Partial<ModelItem>[]): ModelItem[] => {
  return items.map(item => ensureModelItem(item));
};

/**
 * Finds a model item by ID or name
 * @param items - The array of model items to search
 * @param idOrName - The ID or name to search for
 * @returns The found model item or undefined
 */
export const findModelItem = (
  items: ModelItem[],
  idOrName: string
): ModelItem | undefined => {
  return items.find(item => item.id === idOrName || item.name === idOrName);
};

/**
 * Gets a random item from an array
 * @param items - The array to get a random item from
 * @returns A random item from the array
 */
export const getRandomItem = <T>(items: T[]): T => {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

/**
 * React-compatible DataService class for managing production line data
 */
export class DataService {
  private items: ModelItem[] = [];
  private initialized = false;

  /**
   * Initialize the data service with JSON data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load and process the JSON data
      const rawData = juiceProductionData as JuiceProductionDataStructure;
      this.items = ensureModelItems(rawData.flattenedModel || []);
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize data service: ${error}`);
    }
  }

  /**
   * Get the root item (production line)
   */
  getRootItem(): ModelItem | undefined {
    return this.items.find(item => !item.parentId);
  }

  /**
   * Get an item by ID
   */
  getItem(id: string): ModelItem | undefined {
    return findModelItem(this.items, id);
  }

  /**
   * Get all items
   */
  getAllItems(): ModelItem[] {
    return this.items;
  }

  /**
   * Get child items for a given parent ID
   */
  getChildren(parentId: string): ModelItem[] {
    return this.items.filter(item => item.parentId === parentId);
  }

  /**
 * Get related objects for an item (using real AI API)
 */
  async getRelatedObjects(
    itemId: string,
    onAIUpdate?: (aiComponents: Array<{ id: string, label: string, description: string, relationship: string, isAIInferred: boolean }>) => void
  ): Promise<Array<{ id: string, label: string, description: string, relationship: string, isAIInferred?: boolean }>> {
    const item = this.getItem(itemId);
    const relatedObjects: Array<{ id: string, label: string, description: string, relationship: string, isAIInferred?: boolean }> = [];

    // First, add any existing related objects from the data
    if (item?.relatedObjects) {
      const existingRelated = item.relatedObjects
        .map(relation => {
          const relatedItem = this.getItem(relation.referenceId);
          if (!relatedItem) return null;

          return {
            id: relatedItem.id,
            label: relatedItem.label || relatedItem.name,
            description: relatedItem.description || '',
            relationship: relation.relationshipType,
            isAIInferred: false
          };
        })
        .filter(Boolean) as Array<{ id: string, label: string, description: string, relationship: string, isAIInferred: boolean }>;

      relatedObjects.push(...existingRelated);
    }

    // Use real AI to discover additional connections
    if (item && onAIUpdate) {
      const aiComponents: ModelItem[] = [];

      try {
        // Import fetchAIComponents dynamically to avoid issues
        const { fetchAIComponents, createModelItem } = await import('./api-service');

        await fetchAIComponents(item.name, {
          stream: true,
          onChunk: (chunk: string, isDone: boolean) => {
            try {
              const parsedData = JSON.parse(chunk);

              if (isDone) {
                return;
              }

              // Check if we have a new individual component
              if (parsedData.newComponent) {
                const component = parsedData.newComponent as Partial<ModelItem>;
                const modelItem = createModelItem(component, aiComponents.length + 1);
                aiComponents.push(modelItem);

                // Convert to related objects format and update
                const aiRelated = aiComponents.map(aiItem => ({
                  id: aiItem.id,
                  label: aiItem.label || aiItem.name,
                  description: aiItem.description || `AI-discovered connection to ${item.name}`,
                  relationship: aiItem.relationshipDescription || 'AI-discovered relationship',
                  isAIInferred: true
                }));

                onAIUpdate(aiRelated);
              } else if (parsedData.model && Array.isArray(parsedData.model)) {
                // Convert all components to ModelItem format
                const newAiComponents = parsedData.model.map((component: Partial<ModelItem>, index: number) =>
                  createModelItem(component, index + 1)
                );

                aiComponents.splice(0, aiComponents.length, ...newAiComponents);

                // Convert to related objects format and update
                const aiRelated = aiComponents.map(aiItem => ({
                  id: aiItem.id,
                  label: aiItem.label || aiItem.name,
                  description: aiItem.description || `AI-discovered connection to ${item.name}`,
                  relationship: aiItem.relationshipDescription || 'AI-discovered relationship',
                  isAIInferred: true
                }));

                onAIUpdate(aiRelated);
              }
            } catch (err) {
              console.warn('Error parsing AI chunk:', err);
            }
          }
        });
      } catch (error) {
        console.warn('AI service unavailable, falling back to existing relationships:', error);
      }
    }

    return relatedObjects;
  }

  /**
   * Search items by name or description
   */
  searchItems(query: string): ModelItem[] {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
  }
}
