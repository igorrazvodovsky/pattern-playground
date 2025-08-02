import { Icon } from "@iconify/react"
import { Dispatch, SetStateAction } from "react";
import { FilterValueDropdown, FilterOperatorDropdown, FilterValueDateDropdown } from "./filter-components";
import { FilterType } from "./filter-types";
import { FilterIcon } from "./filter-options-icons";
import { Filter } from "./filter-types";
import { updateFilterOperator, updateFilterValue, removeFilterById } from "./filter-utils";
import { isDateFilter } from "./filter-constants";

export default function Filters({
  filters,
  setFilters,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
}) {
  const handleOperatorChange = (filterId: string, operator: string) => {
    setFilters((prev) => updateFilterOperator(prev, filterId, operator));
  };

  const handleValueChange = (filterId: string, value: string[]) => {
    setFilters((prev) => updateFilterValue(prev, filterId, value));
  };

  const handleRemoveFilter = (filterId: string) => {
    setFilters((prev) => removeFilterById(prev, filterId));
  };

  return (
    <div className="tags">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => (
          <div key={filter.id} className="tag-group">
            <div className="tag">
              <FilterIcon type={filter.type} />
              {filter.type}
            </div>
            <FilterOperatorDropdown
              filterType={filter.type}
              operator={filter.operator}
              filterValues={filter.value}
              setOperator={(operator) => handleOperatorChange(filter.id, operator)}
            />
            {isDateFilter(filter.type) ? (
              <FilterValueDateDropdown
                filterType={filter.type}
                filterValues={filter.value}
                setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
              />
            ) : (
              <FilterValueDropdown
                filterType={filter.type}
                filterValues={filter.value}
                setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
              />
            )}
            <button
              onClick={() => handleRemoveFilter(filter.id)}
              className="tag tag-group__remove"
            >
              <Icon icon="ph:x" /><span className="inclusively-hidden">Clear filter</span>
            </button>
          </div>
        ))}
    </div>
  );
}
