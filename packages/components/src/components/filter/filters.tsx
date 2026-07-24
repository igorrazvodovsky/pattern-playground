import { Icon } from "@iconify/react"
import { Dispatch, SetStateAction } from "react";
import type { EntityBinding } from "@shared/data/bindings";
import { taskBinding, findAttribute, attributeLabelFromBinding } from "@shared/data/bindings";
import { FilterValueDropdown, FilterOperatorDropdown, FilterValueDateDropdown } from "./filter-components";
import { Filter } from "./filter-types";
import { updateFilterOperator, updateFilterValue, removeFilterById } from "./filter-utils";

export default function Filters({
  filters,
  setFilters,
  binding = taskBinding,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
  binding?: EntityBinding;
}) {
  const handleOperatorChange = (filterId: string, operator: Filter['operator']) => {
    setFilters((prev) => updateFilterOperator(prev, filterId, operator));
  };

  const handleValueChange = (filterId: string, values: string[]) => {
    setFilters((prev) => updateFilterValue(prev, filterId, values));
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters((prev) => removeFilterById(prev, filterId));
  };

  return (
    <div className="tags">
      {filters
        .filter((filter) => filter.values?.length > 0)
        .map((filter) => {
          const attribute = findAttribute(binding, filter.path);
          return (
            <div key={filter.id} className="tag-group">
              <div className="tag">
                {attribute?.icon && <Icon icon={attribute.icon} className="icon" />}
                {attributeLabelFromBinding(binding, filter.path)}
              </div>
              <FilterOperatorDropdown
                path={filter.path}
                operator={filter.operator}
                filterValues={filter.values}
                setOperator={(operator) => handleOperatorChange(filter.id, operator)}
                binding={binding}
              />
              {attribute?.valueType === 'date' ? (
                <FilterValueDateDropdown
                  path={filter.path}
                  filterValues={filter.values}
                  setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
                />
              ) : (
                <FilterValueDropdown
                  path={filter.path}
                  filterValues={filter.values}
                  setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
                />
              )}
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                className="tag tag-group__remove"
              >
                <Icon icon="ph:x" /><span className="visually-hidden">Clear filter</span>
              </button>
            </div>
          );
        })}
    </div>
  );
}
