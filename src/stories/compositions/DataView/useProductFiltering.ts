import { useMemo } from 'react';
import { Product } from '../../data/types';
import { ProductFilter, ProductFilterCategory } from './FilterTypes';
import { applyFiltersToProducts } from './FilterOperations';
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