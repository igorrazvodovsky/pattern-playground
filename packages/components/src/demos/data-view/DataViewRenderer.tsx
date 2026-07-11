import React from 'react';
import { ViewMode, AttributeSelection } from './types';
import { Product } from '@shared/data/types';
import { CardView } from './CardView';
import { ListView } from './ListView';
import { TableView } from './TableView';
import { getAttributeValue, formatAttributeValue } from './AttributeUtils';

export interface DataViewRendererProps {
  viewMode: ViewMode;
  products: Product[];
  selectedAttributes: AttributeSelection;
  /** Attribute path to cluster items by; null renders the flat view. */
  groupBy?: string | null;
}

const renderView = (
  viewMode: ViewMode,
  products: Product[],
  selectedAttributes: AttributeSelection
) => {
  switch (viewMode) {
    case 'card':
      return <CardView products={products} selectedAttributes={selectedAttributes} />;
    case 'list':
      return <ListView products={products} selectedAttributes={selectedAttributes} />;
    case 'table':
      return <TableView products={products} selectedAttributes={selectedAttributes} />;
    default:
      return <CardView products={products} selectedAttributes={selectedAttributes} />;
  }
};

const groupProducts = (products: Product[], groupBy: string): Map<string, Product[]> => {
  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const value = getAttributeValue(product, groupBy);
    const label = formatAttributeValue(value, groupBy);
    const group = groups.get(label);
    if (group) {
      group.push(product);
    } else {
      groups.set(label, [product]);
    }
  }
  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
};

export const DataViewRenderer: React.FC<DataViewRendererProps> = ({
  viewMode,
  products,
  selectedAttributes,
  groupBy = null
}) => {
  if (!groupBy) {
    return renderView(viewMode, products, selectedAttributes);
  }

  const groups = groupProducts(products, groupBy);

  return (
    <div className="flow">
      {[...groups.entries()].map(([label, groupedProducts]) => (
        <details key={label} className="layer borderless" open>
          <summary>
            {label} <span className="badge">{groupedProducts.length}</span>
          </summary>
          {renderView(viewMode, groupedProducts, selectedAttributes)}
        </details>
      ))}
    </div>
  );
};
