import { ModelItem, RelationObject } from "../../../../schemas/index";
import { RelationGroups } from "../components/ui-components";

/**
 * Ensures that an item from the data conforms to the ModelItem type
 * @param item - The item to ensure type compatibility
 * @returns The item as a ModelItem
 */
export const ensureModelItem = (item: Partial<ModelItem>): ModelItem => {
  // Ensure required properties have appropriate values
  return {
    ...item,
    relationshipType: item.relationshipType ?? null,
    relationshipDescription: item.relationshipDescription ?? null,
    attributes: item.attributes || [],
    rulesAndConstraints: item.rulesAndConstraints || [],
    possibleActions: item.possibleActions || [],
    relatedObjects: item.relatedObjects || []
  } as ModelItem;
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
 * Creates a selected item from a model item
 * @param modelItem - The model item to convert
 * @returns The selected item
 */
export const createSelectedItem = (modelItem: ModelItem) => {
  return {
    category: 'pasteurizer',
    name: modelItem.name,
    description: modelItem.description || '',
    id: modelItem.id,
    type: modelItem.type
  };
};

/**
 * Groups related objects by relationship type
 * @param pasteurizerItem - The item to group related objects for
 * @param allItems - All model items
 * @returns Grouped related objects or null if none
 */
export const groupRelatedObjects = (
  pasteurizerItem: ModelItem,
  allItems: ModelItem[]
): RelationGroups | null => {
  if (!pasteurizerItem.relatedObjects || pasteurizerItem.relatedObjects.length === 0) {
    return null;
  }

  const groups: RelationGroups = {
    'Operational Partners': [],
    'Component Parts': [],
    'Support Systems': [],
    'Downstream Partners': []
  };

  pasteurizerItem.relatedObjects.forEach(relation => {
    const relatedItem = findModelItem(allItems, relation.referenceId);
    if (!relatedItem) return;

    const relationObject: RelationObject = {
      name: relatedItem.name,
      objectType: relatedItem.type,
      label: relatedItem.label || relatedItem.name,
      description: relatedItem.description || '',
      relationship: relation.relationshipType
    };

    // Categorize based on relationship type
    if (relation.relationshipType.includes('Parent') || relation.relationshipType.includes('Child')) {
      // Skip parent/child relationships as they're shown in the structure section
    } else if (relation.relationshipType.includes('Operational Partner')) {
      groups['Operational Partners'].push(relationObject);
    } else if (relation.relationshipType.includes('Component Part')) {
      groups['Component Parts'].push(relationObject);
    } else if (relation.relationshipType.includes('Support') || relation.relationshipType.includes('CIP')) {
      groups['Support Systems'].push(relationObject);
    } else if (relation.relationshipType.includes('Downstream')) {
      groups['Downstream Partners'].push(relationObject);
    }
  });

  return groups;
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
