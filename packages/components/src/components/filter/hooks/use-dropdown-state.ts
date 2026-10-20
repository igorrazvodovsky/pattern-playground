import { useState, useRef, useCallback } from 'react';

type Dropdown = HTMLElement & { open?: boolean; hide(): void };

export const useDropdownState = () => {
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<Dropdown>(null);

  const handleDropdownShow = useCallback(() => {
    document.querySelectorAll<Dropdown>('pp-dropdown').forEach((dropdown) => {
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