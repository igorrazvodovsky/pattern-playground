import { useState, useRef, useCallback } from 'react';

export const useDropdownState = () => {
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<any>(null);

  const handleDropdownShow = useCallback(() => {
    document.querySelectorAll('pp-dropdown').forEach((dropdown) => {
      if (dropdown !== dropdownRef.current && dropdown.open) {
        dropdown.hide();
      }
    });
  }, []);

  const handleDropdownHide = useCallback(() => {
    setTimeout(() => {
      setCommandInput("");
    }, 200);
  }, []);

  const clearInputAndHide = useCallback(() => {
    setTimeout(() => {
      setCommandInput("");
    }, 200);
    dropdownRef.current?.hide();
  }, []);

  return {
    commandInput,
    setCommandInput,
    commandInputRef,
    dropdownRef,
    handleDropdownShow,
    handleDropdownHide,
    clearInputAndHide,
  };
};