import React from 'react';
import { SortingControlsProps } from './types';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';

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
    const fieldLabel = currentField === 'name' ? 'A-Z' : attributeLabel(currentField);
    const orderLabel = currentOrder === 'asc' ? 'Ascending' : 'Descending';
    return `${fieldLabel} (${orderLabel})`;
  };

  return (
    <pp-dropdown>
      <button className="button" data-slot="trigger">
        <span className="muted visually-hidden">Sorted by {getCurrentLabel()}</span>
        <iconify-icon className="icon" icon="ph:arrows-down-up" aria-hidden="true"></iconify-icon>
      </button>
      <pp-popup>
        <pp-list>
          <pp-list-item onClick={() => handleDirectionChange('desc')}>
            <iconify-icon className="icon" icon="ph:sort-descending" aria-hidden="true"></iconify-icon>
            Descending
          </pp-list-item>
          <pp-list-item onClick={() => handleDirectionChange('asc')}>
            <iconify-icon className="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
            Ascending
          </pp-list-item>
          <hr />
          <pp-list-item onClick={() => handleFieldChange('name')}>
            Alphabetical
          </pp-list-item>
          {availableFields.filter(field => field !== 'name').map(field => (
            <pp-list-item key={field} onClick={() => handleFieldChange(field)}>
              {attributeLabel(field)}
            </pp-list-item>
          ))}
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  );
};