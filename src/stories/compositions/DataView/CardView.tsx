import React from 'react';
import { CardViewProps } from './types';
import { getAttributeValue, formatAttributeValue } from './utils';

export const CardView: React.FC<CardViewProps> = ({ products, selectedAttributes }) => {
  return (
    <ul className="cards cards--grid layout-grid">
      {products.map((product) => (
        <li key={product.id}>
          <article className="card">
            <h4 className="label">{product.name}</h4>
            <p className="description">{product.description}</p>
            {selectedAttributes.size > 0 && (
              <div className="card__attributes badges">
                {Array.from(selectedAttributes).map((attr) => {
                  const value = getAttributeValue(product, attr);
                  const formattedValue = formatAttributeValue(value, attr);
                  return (
                    <span key={attr} className="badge">
                      <span className="badge__label">{attr.split('.').pop()}</span>
                      {formattedValue}
                    </span>
                  );
                })}
              </div>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
};