import type { BaseItem } from '../item-view/types';

export const REFERENCE_TYPES = ['user', 'document', 'project', 'task', 'file', 'link', 'quote', 'material', 'component', 'product', 'service'] as const;
export type ReferenceType = typeof REFERENCE_TYPES[number];

export const REFERENCE_MODES = ['global', 'contextual'] as const;
export type ReferenceMode = typeof REFERENCE_MODES[number];

export interface ReferenceCategory {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  children?: ReferenceItem[];
  metadata?: Record<string, unknown>;
}

export interface ReferenceItem {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  type: ReferenceType;
  metadata?: Record<string, unknown>;
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

export const isQuoteReference = (ref: SelectedReference): ref is SelectedReference & { type: 'quote' } =>
  ref.type === 'quote';

export const isMaterialReference = (ref: SelectedReference): ref is SelectedReference & { type: 'material' } =>
  ref.type === 'material';

export const isComponentReference = (ref: SelectedReference): ref is SelectedReference & { type: 'component' } =>
  ref.type === 'component';

export const isProductReference = (ref: SelectedReference): ref is SelectedReference & { type: 'product' } =>
  ref.type === 'product';

export const isServiceReference = (ref: SelectedReference): ref is SelectedReference & { type: 'service' } =>
  ref.type === 'service';

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

// Quote metadata interface for type-safe access
export interface QuoteMetadata {
  sourceDocument: string;
  sourceRange: { from: number; to: number };
  createdAt: string;
  createdBy: string;
  selectedText: string;
  plainText?: string;
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