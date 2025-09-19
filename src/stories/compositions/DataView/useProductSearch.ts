import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Product } from '../../data/types';

export interface UseProductSearchOptions {
  threshold?: number;
  keys?: Array<string | { name: string; weight: number }>;
  minMatchCharLength?: number;
}

const DEFAULT_OPTIONS: Required<UseProductSearchOptions> = {
  threshold: 0.3,
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'description', weight: 0.3 },
    { name: 'searchableText', weight: 0.2 }
  ],
  minMatchCharLength: 1
};

export function useProductSearch(
  products: Product[],
  searchQuery: string,
  options: UseProductSearchOptions = {}
): Product[] {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    if (searchQuery.trim().length < config.minMatchCharLength) {
      return products;
    }

    const fuse = new Fuse(products, {
      threshold: config.threshold,
      keys: config.keys,
      minMatchCharLength: config.minMatchCharLength,
      includeScore: false,
      isCaseSensitive: false,
    });

    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }, [products, searchQuery, config.threshold, config.keys, config.minMatchCharLength]);
}