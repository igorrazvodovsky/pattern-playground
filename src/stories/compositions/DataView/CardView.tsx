import React from 'react';
import { CardViewProps } from './types';
import { AttributeBadge } from './AttributeBadge';

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
                {Array.from(selectedAttributes).map((attr) => (
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