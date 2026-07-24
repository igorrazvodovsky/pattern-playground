import { Icon } from "@iconify/react";
import { Dispatch, SetStateAction } from "react";
import { FilterIcon } from "../../components/filter/filter-options-icons";
import { ProductFilter, ProductFilterCategory, ProductFilterOperator, isProductFilterType } from "./ProductFilterTypes";
import { attributeLabel } from "../../templates/collection-view/AttributeUtils";
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
      filter.id === filterId ? { ...filter, value, operator: operatorForValues(filter, value) } : filter
    );
  };

  // An attribute-path clause states equality until it holds alternatives, so
  // the chip keeps reading as what it matches. Category clauses carry their own
  // operator vocabulary and are left alone.
  const operatorForValues = (filter: ProductFilter, value: string[]): ProductFilterOperator => {
    if (isProductFilterType(filter.type)) return filter.operator;
    if (filter.operator === ProductFilterOperator.IS_NOT) return filter.operator;
    return value.length > 1 ? ProductFilterOperator.IS_ANY_OF : ProductFilterOperator.EQUALS;
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

  const categoryFor = (field: ProductFilter['type']) =>
    filterCategories.find((category) => category.id === field);

  const handleRemoveFilter = (filterId: string) => {
    setFilters((prev) => removeFilterById(prev, filterId));
  };

  return (
    <div className="tags">
      {filters
        .filter((filter) => filter.value?.length > 0)
        .map((filter) => (
          <div key={filter.id} className="tag-group">
            {/* Categories have an icon declared with the facet; an attribute
                path has one only if its data does, so the chip may be text. */}
            <div className="tag">
              {isProductFilterType(filter.type) ? (
                <>
                  <FilterIcon type={filter.type} />
                  {filter.type}
                </>
              ) : (
                <>
                  {categoryFor(filter.type)?.icon && (
                    <Icon icon={categoryFor(filter.type)!.icon!} className="icon" />
                  )}
                  {categoryFor(filter.type)?.name ?? attributeLabel(filter.type)}
                </>
              )}
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
              <Icon icon="ph:x" /><span className="visually-hidden">Clear filter</span>
            </button>
          </div>
        ))}
    </div>
  );
}