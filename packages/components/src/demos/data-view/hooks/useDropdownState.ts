import React from 'react';

export const useDropdownState = (dropdownRef: React.RefObject<{ hide: () => void }>, closeDelay: number = 200) => {
  const hideDropdownWithDelay = React.useCallback(() => {
    setTimeout(() => dropdownRef.current?.hide(), closeDelay);
  }, [dropdownRef, closeDelay]);

  return { hideDropdownWithDelay };
};