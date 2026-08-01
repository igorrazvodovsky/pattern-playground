import React from 'react';
import { SearchControlsProps } from './types';

export const SearchControls: React.FC<SearchControlsProps> = ({
  searchQuery,
  onSearchChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <pp-input clearable>
      <iconify-icon data-slot="prefix" icon="ph:magnifying-glass" aria-hidden="true"></iconify-icon>
      <input
        type="text"
        aria-label="Search"
        placeholder="Search"
        value={searchQuery}
        onChange={handleChange}
      />
    </pp-input>
  );
};