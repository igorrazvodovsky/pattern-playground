import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction } from "react";
import { FilterIcon } from "../../../components/filter/filter-options-icons";
import { ProductFilter, ProductFilterCategory, ProductFilterOperator } from "./ProductFilterTypes";
import { ProductFilterValueDropdown } from "./ProductFilterValueDropdown";
import { ProductFilterOperatorDropdown } from "./ProductFilterOperatorDropdown";

export interface ProductFiltersProps {
  filters: ProductFilter[];
  setFilters: Dispatch<SetStateAction<ProductFilter[]>>;
  filterCategories: ProductFilterCategory[];
}

export default function ProductFilters({
  filters,
  setFilters,
  filterCategories,
}: ProductFiltersProps) {
  const updateFilterOperator = (filters: ProductFilter[], filterId: string, operator: ProductFilterOperator): ProductFilter[] => {
    return filters.map(filter =>
      filter.id === filterId ? { ...filter, operator } : filter
    );
  };

  const updateFilterValue = (filters: ProductFilter[], filterId: string, value: string[]): ProductFilter[] => {
    return filters.map(filter =>
      filter.id === filterId ? { ...filter, value } : filter
    );
  };

  const removeFilterById = (filters: ProductFilter[], filterId: string): ProductFilter[] => {
    return filters.filter(filter => filter.id !== filterId);
  };

  const handleOperatorChange = (filterId: string, operator: ProductFilterOperator) => {
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
            <ProductFilterOperatorDropdown
              filterType={filter.type}
              operator={filter.operator}
              filterValues={filter.value}
              setOperator={(operator) => handleOperatorChange(filter.id, operator)}
            />
            <ProductFilterValueDropdown
              filterType={filter.type}
              filterValues={filter.value}
              setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
              filterCategories={filterCategories}
            />
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