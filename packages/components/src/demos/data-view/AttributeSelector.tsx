import React from 'react';
import { AttributeSelectorProps } from './types';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';

export const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  availableAttributes,
  selectedAttributes,
  onAttributeToggle
}) => {
  return (
    <pp-dropdown>
      <button className="button" data-slot="trigger">
        <iconify-icon className="icon" icon="ph:eye"></iconify-icon>
        <span className="muted visually-hidden">Attributes</span>
        {/* {selectedAttributes.size} */}
        {/* <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon> */}
      </button>
      <pp-popup>
        <pp-list>
          {availableAttributes.map((attribute) => (
            <pp-list-item
              key={attribute}
              type="checkbox"
              checked={selectedAttributes.has(attribute)}
              onClick={() => onAttributeToggle(attribute)}
            >
              {attributeLabel(attribute)}
            </pp-list-item>
          ))}
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  );
};