import React from 'react';
import { CardViewProps } from './types';
import { AttributeBadge } from './AttributeBadge';
import { isIdentityAttribute } from './AttributeUtils';

export const CardView: React.FC<CardViewProps> = ({ products, selectedAttributes }) => {
  // Filter out identity attributes from badges - they have dedicated UI slots
  const metadataAttributes = Array.from(selectedAttributes).filter(attr => !isIdentityAttribute(attr));

  return (
    <ul className="cards cards--grid layout-grid">
      {products.map((product) => (
        <li key={product.id}>
          <article className="card">
            {selectedAttributes.has('name') && (
              <h4 className="label">{product.name}</h4>
            )}
            {selectedAttributes.has('description') && (
              <p className="description">{product.description}</p>
            )}
            {metadataAttributes.length > 0 && (
              <div className="card__attributes badges">
                {metadataAttributes.map((attr) => (
                  <AttributeBadge
                    key={attr}
                    product={product}
                    attribute={attr}
                    showLabel={false}
                  />
                ))}
              </div>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
};