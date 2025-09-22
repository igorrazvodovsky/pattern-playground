import { Product } from '../../data/types';
import { SortField, SortOrder } from './types';
import { getAttributeValue } from './AttributeUtils';

export const sortProducts = (
  products: Product[],
  sortField: SortField,
  sortOrder: SortOrder
): Product[] => {

  try {
    return [...products].sort((a, b) => {
      try {
        const valueA = getAttributeValue(a, sortField);
        const valueB = getAttributeValue(b, sortField);

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) {
          if (valueB === null || valueB === undefined) return 0;
          return sortOrder === 'asc' ? 1 : -1;
        }
        if (valueB === null || valueB === undefined) {
          return sortOrder === 'asc' ? -1 : 1;
        }

        // Convert to comparable values
        let compareA: string | number;
        let compareB: string | number;

        // Handle numeric fields
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          compareA = valueA;
          compareB = valueB;
        } else {
          // Convert to strings for comparison
          compareA = String(valueA).toLowerCase();
          compareB = String(valueB).toLowerCase();
        }

        let result: number;
        if (typeof compareA === 'number' && typeof compareB === 'number') {
          result = compareA - compareB;
        } else {
          result = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        }

        return sortOrder === 'asc' ? result : -result;
      } catch (error) {
        // If individual comparison fails, maintain original order
        console.warn('Comparison failed for sorting:', error);
        return 0;
      }
    });
  } catch (error) {
    console.warn('Sorting failed, returning unsorted data:', error);
    return [...products];
  }
};