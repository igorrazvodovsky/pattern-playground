import React from 'react';
import { SearchControlsProps } from './types';

export const SearchControls: React.FC<SearchControlsProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const handleInput = (e: any) => {
    // Handle both custom events from clear button and native input events
    let value = '';
    if (e.detail && typeof e.detail.value === 'string') {
      // Custom event from clear button
      value = e.detail.value;
    } else if (e.target && typeof e.target.value === 'string') {
      // Native input event
      value = e.target.value;
    }
    onSearchChange(value);
  };

  return (
    <pp-input
      type="text"
      placeholder="Search"
      value={searchQuery}
      onInput={handleInput}
      clearable
    >
        <iconify-icon slot="prefix" icon="ph:magnifying-glass" aria-hidden="true"></iconify-icon>
    </pp-input>
  );
};