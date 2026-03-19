import React from 'react';
import { AttributeSelectorProps } from './types';

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  availableAttributes,
  selectedAttributes,
  onAttributeToggle
}) => {
  return (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        <iconify-icon className="icon" icon="ph:eye"></iconify-icon>
        <span className="muted inclusively-hidden">Attributes</span>
        {/* {selectedAttributes.size} */}
        {/* <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon> */}
      </button>
      <pp-list>
        {availableAttributes.map((attribute) => (
          <pp-list-item
            key={attribute}
            type="checkbox"
            checked={selectedAttributes.has(attribute)}
            onClick={() => onAttributeToggle(attribute)}
            style={{ cursor: 'pointer' }}
          >
            {attribute.split('.').pop()?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};