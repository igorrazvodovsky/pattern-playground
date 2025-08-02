import type { SearchableParent, SearchableItem } from '../hooks/useHierarchicalNavigation';

/**
 * Base types for hierarchical navigation
 * Provides common interfaces that can be extended by specific systems
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
  // Command-specific properties can be added here
}

// Filter-specific extensions
export interface FilterParent extends HierarchicalParent {
  filterType: string; // FilterType enum
}

export interface FilterChild extends HierarchicalChild {
  filterType: string; // FilterType enum
  value: string;
}

// Reference-specific extensions
export interface ReferenceParent extends HierarchicalParent {
  type: 'user' | 'document' | 'project' | 'file' | 'api';
}

export interface ReferenceChild extends HierarchicalChild {
  type: 'user' | 'document' | 'project' | 'file' | 'api';
}

// Common result structure for all hierarchical systems
export interface HierarchicalResults<TParent extends HierarchicalParent, TChild extends HierarchicalChild> {
  parents: TParent[];
  children: Array<{ parent: TParent; child: TChild }>;
  contextualItems?: TChild[];
}

// Common state structure for all hierarchical systems
export interface HierarchicalState<TParent extends HierarchicalParent> {
  selectedContext: TParent | null;
  searchInput: string;
  mode: 'global' | 'contextual';
}

// Common actions interface for all hierarchical systems
export interface HierarchicalActions<TParent extends HierarchicalParent, TChild extends HierarchicalChild> {
  selectContext: (context: TParent) => void;
  selectChild: (child: TChild, parent?: TParent) => void;
  clearContext: () => void;
  updateSearch: (query: string) => void;
  handleEscape: () => boolean;
  resetState: () => void;
}

// Search function type for hierarchical systems
export type HierarchicalSearchFunction<TParent extends HierarchicalParent, TChild extends HierarchicalChild> = (
  input: string,
  data: TParent[],
  context?: TParent
) => HierarchicalResults<TParent, TChild>;

// Configuration interface for hierarchical navigation
export interface HierarchicalNavigationConfig<TParent extends HierarchicalParent, TChild extends HierarchicalChild> {
  data: TParent[];
  searchFunction: HierarchicalSearchFunction<TParent, TChild>;
  onSelectParent?: (parent: TParent) => void;
  onSelectChild: (child: TChild, parent?: TParent) => void;
  onClose?: () => void;
  placeholder?: string;
  contextPlaceholder?: (context: TParent) => string;
}