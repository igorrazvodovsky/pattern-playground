import { useMemo } from 'react';
import type { Product } from '@shared/data/types';
import type { AttributeFilter } from '@shared/data/bindings';
import { productBinding } from '@shared/data/bindings';
import { applyFilters } from '../../templates/collection-view/FilterOperations';
import { generateFilterCategories, PRODUCT_FILTER_PATHS, type FilterCategory } from './FilterCategories';

export interface UseProductFilteringResult {
  filteredProducts: Product[];
  filterCategories: FilterCategory[];
}

export function useProductFiltering(
  products: Product[],
  filters: AttributeFilter[]
): UseProductFilteringResult {
  const filterCategories = useMemo(() =>
    generateFilterCategories(products, PRODUCT_FILTER_PATHS, productBinding),
    [products]
  );

  const filteredProducts = useMemo(() =>
    applyFilters(products, filters, productBinding),
    [products, filters]
  );

  return {
    filteredProducts,
    filterCategories
  };
}
