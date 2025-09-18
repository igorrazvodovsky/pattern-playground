import React from 'react';
import { TableViewProps } from './types';
import { getAttributeValue, formatAttributeValue } from './utils';

export const TableView: React.FC<TableViewProps> = ({ products, selectedAttributes }) => {
  const columns = ['name', 'description', ...Array.from(selectedAttributes)];

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
                let value: unknown;
                if (column === 'name') {
                  value = product.name;
                } else if (column === 'description') {
                  value = product.description;
                } else {
                  value = getAttributeValue(product, column);
                }

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