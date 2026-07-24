import React from 'react';
import { GroupingControlsProps } from './types';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';

export const GroupingControls: React.FC<GroupingControlsProps> = ({
  availableAttributes,
  currentGrouping,
  onGroupingChange
}) => {
  return (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        <iconify-icon className="icon" icon="ph:stack" aria-hidden="true"></iconify-icon>
        {currentGrouping ? (
          <>Grouped by <strong>{attributeLabel(currentGrouping).toLowerCase()}</strong></>
        ) : (
          'Group'
        )}
      </button>
      <pp-list>
        <pp-list-item onClick={() => onGroupingChange(null)}>
          No grouping
        </pp-list-item>
        <hr />
        {availableAttributes.map(attribute => (
          <pp-list-item key={attribute} onClick={() => onGroupingChange(attribute)}>
            {attributeLabel(attribute)}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};
