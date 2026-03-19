import React from 'react';
import { SearchControlsProps } from './types';

export const SearchControls: React.FC<SearchControlsProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const handleInput = (e: Event | CustomEvent) => {
    // Handle both custom events from clear button and native input events
    let value = '';
    if ('detail' in e && e.detail && typeof (e.detail as { value?: string }).value === 'string') {
      // Custom event from clear button
      value = (e.detail as { value: string }).value;
    } else if ('target' in e && e.target && typeof (e.target as HTMLInputElement).value === 'string') {
      // Native input event
      value = (e.target as HTMLInputElement).value;
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