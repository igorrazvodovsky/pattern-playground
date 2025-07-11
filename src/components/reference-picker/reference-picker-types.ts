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
  /** Reference data categories */
  data: ReferenceCategory[];
  /** External query for filtering */
  query?: string;
  /** Callback when reference is selected */
  onSelect: (reference: SelectedReference) => void;
  /** Callback when picker should close */
  onClose?: () => void;
  /** Whether picker is open */
  open?: boolean;
  /** CSS class name */
  className?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Current mode */
  mode?: 'global' | 'contextual';
  /** Selected category for contextual mode */
  selectedCategory?: ReferenceCategory | null;
  /** Callback when category is selected */
  onCategorySelect?: (category: ReferenceCategory) => void;
  /** Callback when going back to global mode */
  onBack?: () => void;
}

export interface ReferencePickerRef {
  focus: () => void;
  close: () => void;
}