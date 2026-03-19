import React from 'react';
import { SortingControlsProps } from './types';
import { getFieldDisplayName } from './utils';

export const SortingControls: React.FC<SortingControlsProps> = ({
  availableFields,
  currentField,
  currentOrder,
  onSortChange
}) => {
  const handleDirectionChange = (order: 'asc' | 'desc') => {
    onSortChange(currentField, order);
  };

  const handleFieldChange = (field: string) => {
    onSortChange(field, currentOrder);
  };

  const getCurrentLabel = () => {
    const fieldLabel = currentField === 'name' ? 'A-Z' : getFieldDisplayName(currentField);
    const orderLabel = currentOrder === 'asc' ? 'Ascending' : 'Descending';
    return `${fieldLabel} (${orderLabel})`;
  };

  return (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        <span className="muted inclusively-hidden">Sorted by {getCurrentLabel()}</span>
        <iconify-icon className="icon" icon="ph:arrows-down-up" aria-hidden="true"></iconify-icon>
      </button>
      <pp-list>
        <pp-list-item
          type="checkbox"
          checked={currentOrder === 'desc'}
          onClick={() => handleDirectionChange('desc')}
        >
          <iconify-icon className="icon" icon="ph:sort-descending" aria-hidden="true"></iconify-icon>
          Descending
        </pp-list-item>
        <pp-list-item
          type="checkbox"
          checked={currentOrder === 'asc'}
          onClick={() => handleDirectionChange('asc')}
        >
          <iconify-icon className="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
          Ascending
        </pp-list-item>
        <hr />
        <pp-list-item
          type="checkbox"
          checked={currentField === 'name'}
          onClick={() => handleFieldChange('name')}
        >
          Alphabetical
        </pp-list-item>
        {availableFields.filter(field => field !== 'name').map(field => (
          <pp-list-item
            key={field}
            type="checkbox"
            checked={currentField === field}
            onClick={() => handleFieldChange(field)}
          >
            {getFieldDisplayName(field)}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};