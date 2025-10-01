import React from 'react';
import { CardViewProps } from './types';
import { getAttributeValue, formatAttributeValue, isIdentityAttribute } from './AttributeUtils';

export const ListView: React.FC<CardViewProps> = ({ products, selectedAttributes }) => {
  // Filter out identity attributes from badges - they have dedicated UI slots
  const metadataAttributes = Array.from(selectedAttributes).filter(attr => !isIdentityAttribute(attr));

  return (
    <section className="cards cards--list">
      {products.map((product) => (
        <div key={product.id}>
          <article className="card">
            {selectedAttributes.has('name') && (
              <span className="label">{product.name}</span>
            )}
            {selectedAttributes.has('description') && (
              <span className="description">{product.description}</span>
            )}
            {metadataAttributes.length > 0 && (
              <span className="card__attributes badges">
                {metadataAttributes.map((attr) => {
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
            )}
          </article>
        </div>
      ))}
    </section>
  );
};