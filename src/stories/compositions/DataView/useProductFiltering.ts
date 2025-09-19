import { useMemo } from 'react';
import { Product } from '../../data/types';
import {
  ProductFilter,
  ProductFilterCategory,
  generateProductFilterCategories,
  applyFiltersToProducts
} from './ProductFilterTypes';

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