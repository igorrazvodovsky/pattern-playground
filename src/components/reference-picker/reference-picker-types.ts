import type { SearchableParent, SearchableItem } from '../../hooks/useHierarchicalNavigation';

// Reference-specific interfaces that extend the generic hierarchical types
export interface ReferenceCategory extends SearchableParent {
  type: 'user' | 'document' | 'project' | 'file' | 'api';
  icon: string;
  description?: string;
}

export interface ReferenceItem extends SearchableItem {
  type: 'user' | 'document' | 'project' | 'file' | 'api';
  icon: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SelectedReference {
  id: string;
  label: string;
  type: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface ReferencePickerProps {
  /** Reference categories and their items */
  data: ReferenceCategory[];
  
  /** Callback when a reference is selected */
  onSelect: (reference: SelectedReference) => void;
  
  /** Callback when picker is closed */
  onClose?: () => void;
  
  /** Custom placeholder text */
  placeholder?: string;
  
  /** Whether to show the picker */
  open?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Accessibility label */
  ariaLabel?: string;
}

export interface ReferencePickerRef {
  focus: () => void;
  close: () => void;
}