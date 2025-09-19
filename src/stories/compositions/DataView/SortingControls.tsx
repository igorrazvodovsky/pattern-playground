import React from 'react';
import { SortingControlsProps } from './types';
import { getFieldDisplayName } from './utils';

export const SortingControls: React.FC<SortingControlsProps> = ({
  availableFields,
  currentField,
  currentOrder,
  onSortChange
}) => {
  const handleFieldChange = (field: string) => {
    onSortChange(field, currentOrder);
  };

  const handleOrderToggle = () => {
    onSortChange(currentField, currentOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="button-group">
      <pp-dropdown>
        <button className="button" is="pp-button" slot="trigger">
          <span className="muted">Sort by</span> {currentField === 'name' ? 'A→Z' : getFieldDisplayName(currentField)}
          <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
        </button>
        <pp-list>
          <pp-list-item
            type="checkbox"
            checked={currentField === 'name'}
            onInput={() => handleFieldChange('name')}
          >
            Alphabetical
          </pp-list-item>
          {availableFields.filter(field => field !== 'name').map(field => (
            <pp-list-item
              key={field}
              type="checkbox"
              checked={currentField === field}
              onInput={() => handleFieldChange(field)}
            >
              {getFieldDisplayName(field)}
            </pp-list-item>
          ))}
        </pp-list>
      </pp-dropdown>
      <button
        className="button"
        is="pp-button"
        onClick={handleOrderToggle}
        title={`Sort ${currentOrder === 'asc' ? 'descending' : 'ascending'}`}
      >
        <iconify-icon
          className="icon"
          icon={currentOrder === 'asc' ? 'ph:sort-ascending' : 'ph:sort-descending'}
          aria-hidden="true"
        ></iconify-icon>
      </button>
    </div>
  );
};