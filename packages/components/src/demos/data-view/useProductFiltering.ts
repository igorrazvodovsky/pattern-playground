import { useMemo } from 'react';
import { Product } from '@shared/data/types';
import { ProductFilter, ProductFilterCategory } from '../../templates/collection-view/FilterTypes';
import { applyFiltersToProducts } from '../../templates/collection-view/FilterOperations';
import { generateProductFilterCategories } from './FilterCategories';

export interface UseProductFilteringResult {
  filteredProducts: Product[];
  filterCategories: ProductFilterCategory[];
}

export function useProductFiltering(
  products: Product[],
  filters: ProductFilter[]
): UseProductFilteringResult {
  const filterCategories = useMemo(() =>
    generateProductFilterCategories(products),
    [products]
  );

  const filteredProducts = useMemo(() =>
    applyFiltersToProducts(products, filters),
    [products, filters]
  );

  return {
    filteredProducts,
    filterCategories
  };
}