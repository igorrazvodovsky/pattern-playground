import React from 'react';
import { TableViewProps } from './types';
import { getAttributeValue, formatAttributeValue, isIdentityAttribute } from './AttributeUtils';

export const TableView: React.FC<TableViewProps> = ({ products, selectedAttributes }) => {
  // Separate identity and metadata attributes, maintaining order
  const identityColumns = Array.from(selectedAttributes).filter(attr => isIdentityAttribute(attr));
  const metadataColumns = Array.from(selectedAttributes).filter(attr => !isIdentityAttribute(attr));
  const columns = [...identityColumns, ...metadataColumns];

  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {column.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              {columns.map((column) => {
                const value = getAttributeValue(product, column);
                return (
                  <td key={column} className={column.includes('msrp') || column.includes('leadTime') ? 'pp-table-align-right' : ''}>
                    {formatAttributeValue(value, column)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  );
};