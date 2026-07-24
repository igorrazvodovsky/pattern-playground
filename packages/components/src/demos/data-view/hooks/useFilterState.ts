import React from 'react';
import { nanoid } from 'nanoid';
import type { AttributeFilter, EntityBinding } from '@shared/data/bindings';
import { productBinding, findAttribute, defaultFilterOperator } from '@shared/data/bindings';

export const useFilterState = (
  filters: AttributeFilter[],
  setFilters: React.Dispatch<React.SetStateAction<AttributeFilter[]>>,
  binding: EntityBinding = productBinding
) => {
  const addFilter = React.useCallback((path: string, value: string) => {
    const newFilter: AttributeFilter = {
      id: nanoid(),
      path,
      operator: defaultFilterOperator(findAttribute(binding, path), value),
      values: [value],
    };
    setFilters(prev => [...prev, newFilter]);
  }, [setFilters, binding]);

  const clearFilters = React.useCallback(() => setFilters([]), [setFilters]);

  const hasActiveFilters = React.useMemo(
    () => filters.some(filter => filter.values?.length > 0),
    [filters]
  );

  return { addFilter, clearFilters, hasActiveFilters };
};
