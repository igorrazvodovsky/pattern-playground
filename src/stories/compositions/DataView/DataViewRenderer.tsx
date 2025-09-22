import React from 'react';
import { ViewMode, AttributeSelection } from './types';
import { Product } from '../../data/types';
import { CardView } from './CardView';
import { ListView } from './ListView';
import { TableView } from './TableView';

export interface DataViewRendererProps {
  viewMode: ViewMode;
  products: Product[];
  selectedAttributes: AttributeSelection;
}

export const DataViewRenderer: React.FC<DataViewRendererProps> = ({
  viewMode,
  products,
  selectedAttributes
}) => {
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