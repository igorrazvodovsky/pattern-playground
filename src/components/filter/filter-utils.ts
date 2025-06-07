import { Filter, FilterOperator } from './filter-types';

export const updateFilterById = (
  filters: Filter[],
  filterId: string,
  updates: Partial<Filter>
): Filter[] => {
  return filters.map((f) =>
    f.id === filterId ? { ...f, ...updates } : f
  );
};

export const removeFilterById = (filters: Filter[], filterId: string): Filter[] => {
  return filters.filter((f) => f.id !== filterId);
};

export const updateFilterOperator = (
  filters: Filter[],
  filterId: string,
  operator: FilterOperator
): Filter[] => {
  return updateFilterById(filters, filterId, { operator });
};

export const updateFilterValue = (
  filters: Filter[],
  filterId: string,
  value: string[]
): Filter[] => {
  return updateFilterById(filters, filterId, { value });
};