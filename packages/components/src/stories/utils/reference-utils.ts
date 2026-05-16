/**
 * Utilities for working with reference categories and data
 */

import type { ReferenceCategory, ReferenceItem } from '../../components/reference/types';

/**
 * Filter reference categories by type
 * @param categories - All reference categories
 * @param types - Array of types to include (e.g., ['user', 'document'])
 * @returns Filtered categories containing only specified types
 */
export function filterCategoriesByType(
  categories: ReferenceCategory[],
  types: string[]
): ReferenceCategory[] {
  return categories
    .map(category => ({
      ...category,
      children: category.children?.filter(child => types.includes(child.type))
    }))
    .filter(category => category.children && category.children.length > 0);
}

/**
 * Get a flat list of all reference items from categories
 * @param categories - Reference categories
 * @returns Flat array of all reference items
 */
export function flattenReferenceItems(categories: ReferenceCategory[]): ReferenceItem[] {
  return categories.flatMap(category => category.children || []);
}

/**
 * Find a reference item by ID across all categories
 * @param categories - Reference categories to search
 * @param id - ID of the item to find
 * @returns The reference item if found, undefined otherwise
 */
export function findReferenceById(
  categories: ReferenceCategory[],
  id: string
): ReferenceItem | undefined {
  for (const category of categories) {
    const item = category.children?.find(child => child.id === id);
    if (item) return item;
  }
  return undefined;
}

/**
 * Create a single-category reference data structure
 * Useful for reference pickers that only need one type (e.g., only users)
 * @param items - Array of reference items
 * @param categoryName - Name for the category
 * @param categoryId - ID for the category
 * @returns Single-category reference structure
 */
export function createSingleCategory(
  items: ReferenceItem[],
  categoryName: string,
  categoryId: string
): ReferenceCategory[] {
  return [{
    id: categoryId,
    name: categoryName,
    children: items
  }];
}