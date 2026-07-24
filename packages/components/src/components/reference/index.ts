/**
 * Reference System - Public API
 *
 * This module provides components for creating and managing references in rich text content.
 * Internal components (ReferencePicker) are not exported to keep the API clean.
 * Rendering at every scope goes through the item-view bindings: entity types
 * with a binding of their own (product, project, quote, user) escalate through
 * it; the rest render from the generic 'reference' binding.
 */

// Public components
export { ReferenceEditor } from './ReferenceEditor';
export { Reference, createReferenceSuggestion } from './Reference';

// Public types
export type {
  ReferenceCategory,
  ReferenceItem,
  SelectedReference
} from './types';
