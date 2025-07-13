import type { BaseItem } from '../item-view/types';

export interface ReferenceCategory {
  id: string;
  label: string;
  items: ReferenceItem[];
}

export interface ReferenceItem {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface SelectedReference extends BaseItem {
  // Inherits id, label, type, metadata from BaseItem
}

// Internal interfaces for ReferencePicker - used internally only
export interface ReferencePickerProps {
  data: ReferenceCategory[];
  query?: string;
  onSelect: (reference: SelectedReference) => void;
  onClose?: () => void;
  open?: boolean;
  mode?: 'global' | 'contextual';
  selectedCategory?: ReferenceCategory | null;
  onCategorySelect?: (category: ReferenceCategory) => void;
  onBack?: () => void;
}

export interface ReferencePickerRef {
  focus: () => void;
  selectFirst: () => void;
  selectLast: () => void;
  selectNext: () => void;
  selectPrevious: () => void;
  getSelectedReference: () => SelectedReference | null;
}