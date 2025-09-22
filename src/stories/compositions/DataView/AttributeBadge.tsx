import React from 'react';
import { getAttributeValue, formatAttributeValue } from './AttributeUtils';
import { getFieldDisplayName } from './DisplayUtils';
import { Product } from '../../data/types';

export interface AttributeBadgeProps {
  product: Product;
  attribute: string;
  showLabel?: boolean;
}

export const AttributeBadge: React.FC<AttributeBadgeProps> = ({
  product,
  attribute,
  showLabel = true
}) => {
  const value = getAttributeValue(product, attribute);
  const formattedValue = formatAttributeValue(value, attribute);
  const label = getFieldDisplayName(attribute);

  return (
    <span className="badge">
      {showLabel && <span className="badge__label">{label}</span>}
      {formattedValue}
    </span>
  );
};