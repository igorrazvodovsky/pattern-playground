import React from "react";
import type { EntityBinding, FilterOperator } from "@shared/data/bindings";
import { productBinding, findAttribute, filterOperatorsFor } from "@shared/data/bindings";
import '../../components/dropdown/dropdown.ts';
import '../../components/list/list.ts';
import '../../components/list-item/list-item.ts';

export interface ProductFilterOperatorDropdownProps {
  path: string;
  operator: FilterOperator;
  filterValues: string[];
  setOperator: (operator: FilterOperator) => void;
  binding?: EntityBinding;
}

export const ProductFilterOperatorDropdown: React.FC<ProductFilterOperatorDropdownProps> = ({
  path,
  operator,
  filterValues,
  setOperator,
  binding = productBinding,
}) => {
  // One operator table for every facet, read off the binding entry's
  // valueType and cardinality; a path outside the binding is matched on the
  // value as displayed, so it gets the plain equality pair.
  const operators = filterOperatorsFor(findAttribute(binding, path), filterValues);

  return (
    <pp-dropdown placement="bottom-start">
      <button slot="trigger" className="tag">
        {operator}
      </button>
      <pp-list>
        {operators.map((op) => (
          <pp-list-item
            key={op}
            type="checkbox"
            checked={op === operator}
            onClick={() => setOperator(op)}
          >
            {op}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};
