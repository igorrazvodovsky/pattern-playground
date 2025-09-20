import React from "react";
import { ProductFilterType, ProductFilterOperator } from "./ProductFilterTypes";
import '../../../components/dropdown/dropdown.ts';
import '../../../components/list/list.ts';
import '../../../components/list-item/list-item.ts';

export interface ProductFilterOperatorDropdownProps {
  filterType: ProductFilterType;
  operator: ProductFilterOperator;
  filterValues: string[];
  setOperator: (operator: ProductFilterOperator) => void;
}

// Define which operators are available for each product filter type
const getProductFilterOperators = (filterType: ProductFilterType, filterValues: string[]): ProductFilterOperator[] => {
  const hasMultipleValues = Array.isArray(filterValues) && filterValues.length > 1;

  switch (filterType) {
    case ProductFilterType.CATEGORY:
    case ProductFilterType.AVAILABILITY_STATUS:
    case ProductFilterType.REPAIRABILITY:
    case ProductFilterType.UPGRADEABILITY:
      // Single value filters - can be "is" or "is not", and "is any of" for multiple values
      return hasMultipleValues
        ? [ProductFilterOperator.IS_ANY_OF, ProductFilterOperator.IS_NOT]
        : [ProductFilterOperator.IS, ProductFilterOperator.IS_NOT];

    case ProductFilterType.CERTIFICATIONS:
    case ProductFilterType.REGIONS:
    case ProductFilterType.CHANNELS:
      // Multi-value filters - can include/exclude
      return hasMultipleValues
        ? [
            ProductFilterOperator.INCLUDE,
            ProductFilterOperator.DO_NOT_INCLUDE,
          ]
        : [ProductFilterOperator.INCLUDE, ProductFilterOperator.DO_NOT_INCLUDE];

    case ProductFilterType.PRICE_RANGE:
      // Numeric filters - can be less than, greater than, between
      return [
        ProductFilterOperator.IS,
        ProductFilterOperator.LESS_THAN,
        ProductFilterOperator.GREATER_THAN,
        ProductFilterOperator.BETWEEN
      ];

    default:
      return [ProductFilterOperator.IS, ProductFilterOperator.IS_NOT];
  }
};

export const ProductFilterOperatorDropdown: React.FC<ProductFilterOperatorDropdownProps> = ({
  filterType,
  operator,
  filterValues,
  setOperator,
}) => {
  const operators = getProductFilterOperators(filterType, filterValues);

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