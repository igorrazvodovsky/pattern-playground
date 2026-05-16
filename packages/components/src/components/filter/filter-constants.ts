import { FilterType } from './filter-types';

export const DATE_FILTER_TYPES: FilterType[] = [
  FilterType.CREATED_DATE,
  FilterType.UPDATED_DATE,
  FilterType.DUE_DATE,
];

export const SINGLE_VALUE_FILTER_TYPES: FilterType[] = [
  FilterType.STATUS,
  FilterType.ASSIGNEE,
  FilterType.PRIORITY,
];

export const MULTI_VALUE_FILTER_TYPES: FilterType[] = [
  FilterType.LABELS,
];

export const isDateFilter = (filterType: FilterType): boolean => {
  return DATE_FILTER_TYPES.includes(filterType);
};

export const isSingleValueFilter = (filterType: FilterType): boolean => {
  return SINGLE_VALUE_FILTER_TYPES.includes(filterType);
};

export const isMultiValueFilter = (filterType: FilterType): boolean => {
  return MULTI_VALUE_FILTER_TYPES.includes(filterType);
};