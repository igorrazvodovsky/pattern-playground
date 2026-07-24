import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction } from "react";
import type { AttributeFilter, EntityBinding, FilterOperator } from "@shared/data/bindings";
import { productBinding, findAttribute, filterOperatorsFor } from "@shared/data/bindings";
import { attributeLabel } from "../../templates/collection-view/AttributeUtils";
import { FilterCategory } from "./FilterCategories";
import { ProductFilterValueDropdown } from "./ProductFilterValueDropdown";
import { ProductFilterOperatorDropdown } from "./ProductFilterOperatorDropdown";

export interface ProductFiltersProps {
  filters: AttributeFilter[];
  setFilters: Dispatch<SetStateAction<AttributeFilter[]>>;
  filterCategories: FilterCategory[];
  binding?: EntityBinding;
}

export default function ProductFilters({
  filters,
  setFilters,
  filterCategories,
  binding = productBinding,
}: ProductFiltersProps) {
  const updateFilterOperator = (filters: AttributeFilter[], filterId: string, operator: FilterOperator): AttributeFilter[] => {
    return filters.map(filter =>
      filter.id === filterId ? { ...filter, operator } : filter
    );
  };

  // A clause states equality until it holds alternatives, so the chip keeps
  // reading as what it matches: when the current operator falls outside what
  // the table offers for the new value count, take the table's first.
  const operatorForValues = (filter: AttributeFilter, values: string[]): FilterOperator => {
    const offered = filterOperatorsFor(findAttribute(binding, filter.path), values);
    return offered.includes(filter.operator) ? filter.operator : offered[0] ?? filter.operator;
  };

  const updateFilterValue = (filters: AttributeFilter[], filterId: string, values: string[]): AttributeFilter[] => {
    return filters.map(filter =>
      filter.id === filterId ? { ...filter, values, operator: operatorForValues(filter, values) } : filter
    );
  };

  const removeFilterById = (filters: AttributeFilter[], filterId: string): AttributeFilter[] => {
    return filters.filter(filter => filter.id !== filterId);
  };

  const handleOperatorChange = (filterId: string, operator: FilterOperator) => {
    setFilters((prev) => updateFilterOperator(prev, filterId, operator));
  };

  const handleValueChange = (filterId: string, values: string[]) => {
    setFilters((prev) => updateFilterValue(prev, filterId, values));
  };

  const categoryFor = (path: string) =>
    filterCategories.find((category) => category.id === path);

  const handleRemoveFilter = (filterId: string) => {
    setFilters((prev) => removeFilterById(prev, filterId));
  };

  return (
    <div className="tags">
      {filters
        .filter((filter) => filter.values?.length > 0)
        .map((filter) => {
          const icon = categoryFor(filter.path)?.icon ?? findAttribute(binding, filter.path)?.icon;
          return (
            <div key={filter.id} className="tag-group">
              {/* The facet's icon is declared with the binding; a path outside
                  it has one only if its category does, so the chip may be text. */}
              <div className="tag">
                {icon && <Icon icon={icon} className="icon" />}
                {categoryFor(filter.path)?.name ?? attributeLabel(filter.path, binding)}
              </div>
              <ProductFilterOperatorDropdown
                path={filter.path}
                operator={filter.operator}
                filterValues={filter.values}
                setOperator={(operator) => handleOperatorChange(filter.id, operator)}
                binding={binding}
              />
              <ProductFilterValueDropdown
                path={filter.path}
                filterValues={filter.values}
                setFilterValues={(filterValues) => handleValueChange(filter.id, filterValues)}
                filterCategories={filterCategories}
              />
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
