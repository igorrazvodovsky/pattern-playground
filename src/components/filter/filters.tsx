import { Icon } from "@iconify/react"
import { Dispatch, SetStateAction } from "react";
import { FilterValueDropdown, FilterOperatorDropdown, FilterValueDateDropdown } from "./filter-components";
import { FilterType } from "./filter-types";
import { FilterIcon } from "./filter-options-icons";
import { Filter } from "./filter-types";

export default function Filters({
  filters,
  setFilters,
}: {
  filters: Filter[];
  setFilters: Dispatch<SetStateAction<Filter[]>>;
}) {
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
              setOperator={(operator) => {
                setFilters((prev) =>
                  prev.map((f) => (f.id === filter.id ? { ...f, operator } : f))
                );
              }}
            />
            {filter.type === FilterType.CREATED_DATE ||
            filter.type === FilterType.UPDATED_DATE ||
            filter.type === FilterType.DUE_DATE ? (
              <FilterValueDateDropdown
                filterType={filter.type}
                filterValues={filter.value}
                setFilterValues={(filterValues) => {
                  setFilters((prev) =>
                    prev.map((f) =>
                      f.id === filter.id ? { ...f, value: filterValues } : f
                    )
                  );
                }}
              />
            ) : (
              <FilterValueDropdown
                filterType={filter.type}
                filterValues={filter.value}
                setFilterValues={(filterValues) => {
                  setFilters((prev) =>
                    prev.map((f) =>
                      f.id === filter.id ? { ...f, value: filterValues } : f
                    )
                  );
                }}
              />
            )}
            <button
              onClick={() => {setFilters((prev) => prev.filter((f) => f.id !== filter.id))}}
              className="tag tag-group__remove"
            >
              <Icon icon="ph:x" /><span className="inclusively-hidden">Clear filter</span>
            </button>
          </div>
        ))}
    </div>
  );
}
