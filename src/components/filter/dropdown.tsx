import React, { useRef, useEffect } from 'react';

// Import the custom elements and their dependencies (they self-register when imported)
// The dropdown depends on popup, so we need to import it first
import '../popup/popup.ts';
import '../dropdown/dropdown.ts';
import '../list/list.ts';
import '../list-item/list-item.ts';

// TypeScript declarations for the custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        open?: boolean;
        placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end';
        disabled?: boolean;
        'stay-open-on-select'?: boolean;
        distance?: number;
        skidding?: number;
        hoist?: boolean;
        sync?: 'width' | 'height' | 'both';
      };
      'pp-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'normal' | 'checkbox';
        checked?: boolean;
        value?: string;
        disabled?: boolean;
      };
    }
  }
}

interface DropdownProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'right' | 'right-start' | 'right-end' | 'left' | 'left-start' | 'left-end';
  disabled?: boolean;
  stayOpenOnSelect?: boolean;
  distance?: number;
  skidding?: number;
  hoist?: boolean;
  sync?: 'width' | 'height' | 'both';
}

// Create a context to allow dropdown items to close the dropdown
const DropdownContext = React.createContext<{
  closeDropdown: () => void;
  stayOpenOnSelect: boolean;
} | null>(null);

export const Dropdown: React.FC<DropdownProps> = ({
  children,
  open,
  onOpenChange,
  placement = 'bottom-start',
  disabled = false,
  stayOpenOnSelect = false,
  distance = 4,
  skidding = 0,
  hoist = false,
  sync
}) => {
  const dropdownRef = useRef<HTMLElement>(null);

  const closeDropdown = () => {
    console.log('Manually closing dropdown');
    const dropdown = dropdownRef.current;
    if (dropdown) {
      (dropdown as any).hide();
    }
  };

  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    const handleShow = () => {
      console.log('Dropdown show event');
      onOpenChange?.(true);
    };
    const handleHide = () => {
      console.log('Dropdown hide event');
      onOpenChange?.(false);
    };

    // Also listen for pp-select events for debugging
    const handleSelect = (event: CustomEvent) => {
      console.log('pp-select event received by dropdown', event);
    };

    dropdown.addEventListener('pp-show', handleShow);
    dropdown.addEventListener('pp-hide', handleHide);
    dropdown.addEventListener('pp-select', handleSelect as EventListener);

    return () => {
      dropdown.removeEventListener('pp-show', handleShow);
      dropdown.removeEventListener('pp-hide', handleHide);
      dropdown.removeEventListener('pp-select', handleSelect as EventListener);
    };
  }, [onOpenChange]);

  // Update the open state when prop changes
  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    if (open !== undefined) {
      console.log('Setting dropdown open state to:', open);
      (dropdown as any).open = open;
    }
  }, [open]);

  console.log('Rendering dropdown with stayOpenOnSelect:', stayOpenOnSelect);

  return (
    <DropdownContext.Provider value={{ closeDropdown, stayOpenOnSelect }}>
      {React.createElement('pp-dropdown', {
        ref: dropdownRef,
        placement,
        disabled,
        distance,
        skidding,
        hoist,
        sync
      }, children)}
    </DropdownContext.Provider>
  );
};

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({ children, className }) => {
  return (
    <div slot="trigger" className={className}>
      {children}
    </div>
  );
};

interface DropdownContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export const DropdownContent: React.FC<DropdownContentProps> = ({ children, align }) => {
  return React.createElement('pp-list', {}, children);
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  value?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick, disabled, value }) => {
  const context = React.useContext(DropdownContext);

  const handleNativeClick = (event: React.MouseEvent) => {
    console.log('DropdownItem clicked', { disabled, event });

    if (!disabled) {
      // Call our callback first
      if (onClick) {
        onClick();
      }

      // Then close the dropdown if it should close on select
      if (context && !context.stayOpenOnSelect) {
        context.closeDropdown();
      }
    }
  };

  return React.createElement('pp-list-item', {
    disabled,
    value,
    onClick: handleNativeClick
  }, children);
};