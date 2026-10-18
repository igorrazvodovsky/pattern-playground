import type { SearchableParent, SearchableItem } from '../utility/hierarchical-search';

/**
 * Item types for hierarchical navigation. The hook's own config, state and
 * result types live with it in hooks/useHierarchicalNavigation.ts.
 */

// Base hierarchical types with common metadata support
export interface HierarchicalParent extends SearchableParent {
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface HierarchicalChild extends SearchableItem {
  type?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// Command-specific extensions
export interface CommandParent extends HierarchicalParent {
  shortcut?: string[];
}

export interface CommandChild extends HierarchicalChild {
  // Command-specific properties
  shortcut?: readonly string[];
}
