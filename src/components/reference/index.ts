/**
 * Reference System - Public API
 * 
 * This module provides components for creating and managing references in rich text content.
 * Internal components (ReferencePicker, adapters) are not exported to keep the API clean.
 */

// Public components
export { ReferenceEditor } from './ReferenceEditor';
export { Reference, createReferenceSuggestion } from './Reference';
export { referenceContentAdapter } from './ReferenceContentAdapter';

// Public types
export type {
  ReferenceCategory,
  ReferenceItem,
  SelectedReference
} from './types';

/**
 * Internal components (not exported):
 * - ReferencePicker: Used internally by ReferencePickerPopup
 * - Adapters: ReferencePreviewAdapter, ReferenceDetailAdapter, ReferenceFullViewAdapter
 *   Used by referenceContentAdapter for progressive disclosure
 */