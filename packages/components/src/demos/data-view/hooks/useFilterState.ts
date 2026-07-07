import React from 'react';
import { nanoid } from 'nanoid';
import { ProductFilter, ProductFilterType, ProductFilterOperator } from '../FilterTypes';

const getFilterOperator = (): ProductFilterOperator => {
  return ProductFilterOperator.IS;
};

export const useFilterState = (filters: ProductFilter[], setFilters: React.Dispatch<React.SetStateAction<ProductFilter[]>>) => {
  const addFilter = React.useCallback((filterType: ProductFilterType, value: string) => {
    const newFilter: ProductFilter = {
      id: nanoid(),
      type: filterType,
      operator: getFilterOperator(),
      value: [value],
    };
    setFilters(prev => [...prev, newFilter]);
  }, [setFilters]);

  const clearFilters = React.useCallback(() => setFilters([]), [setFilters]);

  const hasActiveFilters = React.useMemo(
    () => filters.some(filter => filter.value?.length > 0),
    [filters]
  );

  return { addFilter, clearFilters, hasActiveFilters };
};