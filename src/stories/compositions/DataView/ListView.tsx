import React from 'react';
import { CardViewProps } from './types';
import { getAttributeValue, formatAttributeValue } from './utils';

export const ListView: React.FC<CardViewProps> = ({ products, selectedAttributes }) => {
  return (
    <section className="cards cards--list">
      {products.map((product) => (
        <div key={product.id}>
          <article className="card">
            <span className="label">{product.name}</span>
            <span className="card__attributes badges">
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
            </span>
          </article>
        </div>
      ))}
    </section>
  );
};