import type { Dispatch, SetStateAction } from 'react';
import type { EntityBinding } from '@shared/data/bindings';
import { taskBinding, findAttribute, attributeLabelFromBinding } from '@shared/data/bindings';
import {
  FilterValueDropdown,
  FilterOperatorDropdown,
  FilterValueDateDropdown,
} from './filter-components';
import type { Filter } from './filter-types';
import { attributeGlyph } from '../../utility/attribute-icons';
import { updateFilterOperator, updateFilterValue, removeFilterById } from './filter-utils';

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
          const glyph = attributeGlyph(attribute?.icon);
          return (
            <div key={filter.id} className="tag-group">
              <div className="tag">
                {glyph && <iconify-icon icon={glyph} className="icon"></iconify-icon>}
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
                <iconify-icon icon="ik:cross"></iconify-icon>
                <span className="visually-hidden">Clear filter</span>
              </button>
            </div>
          );
        })}
    </div>
  );
}
