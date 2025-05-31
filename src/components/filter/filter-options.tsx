import { FilterType, FilterOperator, Status, Assignee, Labels, Priority, DueDate, FilterOption } from "./filter-types";
import { FilterIcon } from "./filter-options-icons";

export const filterViewOptions: FilterOption[][] = [
  [
    {
      name: FilterType.STATUS,
      icon: <FilterIcon type={ FilterType.STATUS } />,
    },
{
  name: FilterType.ASSIGNEE,
    icon: <FilterIcon type={ FilterType.ASSIGNEE } />,
},
{
  name: FilterType.LABELS,
    icon: <FilterIcon type={ FilterType.LABELS } />,
},
{
  name: FilterType.PRIORITY,
    icon: <FilterIcon type={ FilterType.PRIORITY } />,
},
  ],
[
  {
    name: FilterType.DUE_DATE,
    icon: <FilterIcon type={ FilterType.DUE_DATE } />,
    },
  {
    name: FilterType.CREATED_DATE,
    icon: <FilterIcon type={ FilterType.CREATED_DATE } />,
    },
  {
    name: FilterType.UPDATED_DATE,
    icon: <FilterIcon type={ FilterType.UPDATED_DATE } />,
    },
],
];

export const statusFilterOptions: FilterOption[] = Object.values(Status).map(
  (status) => ({
    name: status,
    icon: <FilterIcon type={ status } />,
  })
);

export const assigneeFilterOptions: FilterOption[] = Object.values(
  Assignee
).map((assignee) => ({
  name: assignee,
  icon: <FilterIcon type={ assignee } />,
}));

export const labelFilterOptions: FilterOption[] = Object.values(Labels).map(
  (label) => ({
    name: label,
    icon: <FilterIcon type={ label } />,
  })
);

export const priorityFilterOptions: FilterOption[] = Object.values(
  Priority
).map((priority) => ({
  name: priority,
  icon: <FilterIcon type={ priority } />,
}));

export const dateFilterOptions: FilterOption[] = Object.values(DueDate).map(
  (date) => ({
    name: date,
    icon: undefined,
  })
);

export const filterViewToFilterOptions: Record<FilterType, FilterOption[]> = {
  [FilterType.STATUS]: statusFilterOptions,
  [FilterType.ASSIGNEE]: assigneeFilterOptions,
  [FilterType.LABELS]: labelFilterOptions,
  [FilterType.PRIORITY]: priorityFilterOptions,
  [FilterType.DUE_DATE]: dateFilterOptions,
  [FilterType.CREATED_DATE]: dateFilterOptions,
  [FilterType.UPDATED_DATE]: dateFilterOptions,
};

export const filterOperators = ({
  filterType,
  filterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
}) => {
  switch (filterType) {
    case FilterType.STATUS:
    case FilterType.ASSIGNEE:
    case FilterType.PRIORITY:
      if (Array.isArray(filterValues) && filterValues.length > 1) {
        return [FilterOperator.IS_ANY_OF, FilterOperator.IS_NOT];
      } else {
        return [FilterOperator.IS, FilterOperator.IS_NOT];
      }
    case FilterType.LABELS:
      if (Array.isArray(filterValues) && filterValues.length > 1) {
        return [
          FilterOperator.INCLUDE_ANY_OF,
          FilterOperator.INCLUDE_ALL_OF,
          FilterOperator.EXCLUDE_ALL_OF,
          FilterOperator.EXCLUDE_IF_ANY_OF,
        ];
      } else {
        return [FilterOperator.INCLUDE, FilterOperator.DO_NOT_INCLUDE];
      }
    case FilterType.DUE_DATE:
    case FilterType.CREATED_DATE:
    case FilterType.UPDATED_DATE:
      if (filterValues?.includes(DueDate.IN_THE_PAST)) {
        return [FilterOperator.IS, FilterOperator.IS_NOT];
      } else {
        return [FilterOperator.BEFORE, FilterOperator.AFTER];
      }
    default:
      return [];
  }
};