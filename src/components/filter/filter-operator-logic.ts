import { FilterType, FilterOperator, DueDate } from "./filter-types";
import { SINGLE_VALUE_FILTER_TYPES, isDateFilter, isSingleValueFilter } from "./filter-constants";

interface FilterOperatorConfig {
  single: FilterOperator[];
  multiple: FilterOperator[];
}

const OPERATOR_CONFIGS: Record<string, FilterOperatorConfig> = {
  singleValue: {
    single: [FilterOperator.IS, FilterOperator.IS_NOT],
    multiple: [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT],
  },
  labels: {
    single: [FilterOperator.INCLUDE, FilterOperator.DO_NOT_INCLUDE],
    multiple: [
      FilterOperator.INCLUDE_ANY_OF,
      FilterOperator.INCLUDE_ALL_OF,
      FilterOperator.EXCLUDE_ALL_OF,
      FilterOperator.EXCLUDE_IF_ANY_OF,
    ],
  },
  date: {
    single: [FilterOperator.IS, FilterOperator.IS_NOT],
    multiple: [FilterOperator.BEFORE, FilterOperator.AFTER],
  },
};

export const filterOperators = ({
  filterType,
  filterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
}): FilterOperator[] => {
  const hasMultipleValues = Array.isArray(filterValues) && filterValues.length > 1;

  // Handle single value filter types (Status, Assignee, Priority)
  if (isSingleValueFilter(filterType)) {
    const config = OPERATOR_CONFIGS.singleValue;
    return hasMultipleValues ? config.multiple : config.single;
  }

  // Handle Labels filter type
  if (filterType === FilterType.LABELS) {
    const config = OPERATOR_CONFIGS.labels;
    return hasMultipleValues ? config.multiple : config.single;
  }

  // Handle Date filter types
  if (isDateFilter(filterType)) {
    const config = OPERATOR_CONFIGS.date;
    // Special case for "in the past" - use IS/IS_NOT operators
    if (filterValues?.includes(DueDate.IN_THE_PAST)) {
      return config.single;
    }
    return config.multiple;
  }

  return [];
};