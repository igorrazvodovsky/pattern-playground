import type { BaseItem } from '../item-view/types';

export const REFERENCE_TYPES = ['user', 'document', 'project', 'task', 'file', 'link'] as const;
export type ReferenceType = typeof REFERENCE_TYPES[number];

export const REFERENCE_MODES = ['global', 'contextual'] as const;
export type ReferenceMode = typeof REFERENCE_MODES[number];

export interface ReferenceCategory {
  id: string;
  label: string;
  items: ReferenceItem[];
  metadata?: Record<`${string}`, unknown>;
}

export interface ReferenceItem {
  id: string;
  label: string;
  type: ReferenceType;
  metadata?: Record<`${string}`, unknown>;
}

export interface SelectedReference extends BaseItem {
  type: ReferenceType;
  // Inherits id, label, metadata from BaseItem with stronger typing
}

// Type guards for runtime type checking
export const isUserReference = (ref: SelectedReference): ref is SelectedReference & { type: 'user' } =>
  ref.type === 'user';

export const isDocumentReference = (ref: SelectedReference): ref is SelectedReference & { type: 'document' } =>
  ref.type === 'document';

// User metadata interface for type-safe access
export interface UserMetadata {
  role?: string;
  email?: string;
  department?: string;
  location?: string;
  joinDate?: string;
  bio?: string;
  skills?: readonly string[];
  projects?: readonly string[];
}

// Internal interfaces for ReferencePicker - used internally only
export interface ReferencePickerProps {
  data: ReferenceCategory[];
  query?: string;
  onSelect: (reference: SelectedReference) => void;
  onClose?: () => void;
  open?: boolean;
  mode?: ReferenceMode;
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