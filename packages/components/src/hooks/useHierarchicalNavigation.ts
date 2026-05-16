import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Generic interfaces for hierarchical navigation
export interface SearchableParent {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  children?: SearchableItem[];
}

export interface SearchableItem {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  [key: string]: unknown; // Allow additional properties for specific implementations
}

export interface HierarchicalSearchResults<TParent extends SearchableParent, TChild extends SearchableItem> {
  parents: TParent[];
  children: Array<{ parent: TParent; child: TChild }>;
  contextualItems?: TChild[];
}

export interface HierarchicalNavigationConfig<TParent extends SearchableParent, TChild extends SearchableItem> {
  data: TParent[];
  searchFunction: (
    input: string, 
    data: TParent[], 
    context?: TParent
  ) => HierarchicalSearchResults<TParent, TChild>;
  onSelectParent?: (parent: TParent) => void;
  onSelectChild: (child: TChild, parent?: TParent) => void;
  onClose?: () => void;
  placeholder?: string;
  contextPlaceholder?: (context: TParent) => string;
}

export interface HierarchicalNavigationState<TParent extends SearchableParent> {
  selectedContext: TParent | null;
  searchInput: string;
  mode: 'global' | 'contextual';
}

export interface HierarchicalNavigationActions<TParent extends SearchableParent, TChild extends SearchableItem> {
  selectContext: (context: TParent) => void;
  selectChild: (child: TChild, parent?: TParent) => void;
  clearContext: () => void;
  updateSearch: (query: string) => void;
  handleEscape: () => boolean;
  resetState: () => void;
}

/**
 * Unified hierarchical navigation hook used by Command Menu, Filtering, and References
 * Provides consistent dual-mode operation: global search vs contextual search
 */
export function useHierarchicalNavigation<TParent extends SearchableParent, TChild extends SearchableItem>(
  config: HierarchicalNavigationConfig<TParent, TChild>
): {
  state: HierarchicalNavigationState<TParent>;
  actions: HierarchicalNavigationActions<TParent, TChild>;
  results: HierarchicalSearchResults<TParent, TChild>;
  inputRef: React.RefObject<HTMLInputElement>;
  placeholder: string;
} {
  const [selectedContext, setSelectedContext] = useState<TParent | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine current mode
  const mode = selectedContext ? 'contextual' : 'global';

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);
    
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchInput]);

  const results = useMemo(() => {
    if (selectedContext) {
      const contextualItems = config.searchFunction(debouncedSearchInput, [selectedContext], selectedContext).contextualItems || [];
      return {
        parents: [],
        children: [],
        contextualItems
      };
    } else {
      return config.searchFunction(debouncedSearchInput, config.data);
    }
  }, [debouncedSearchInput, selectedContext, config]);

  const selectContext = useCallback((context: TParent) => {
    setSelectedContext(context);
    setSearchInput("");
    setDebouncedSearchInput("");
    config.onSelectParent?.(context);
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [config]);

  const selectChild = useCallback((child: TChild, parent?: TParent) => {
    config.onSelectChild(child, parent || selectedContext || undefined);
    // Reset state after selection (can be overridden by caller)
    setSelectedContext(null);
    setSearchInput("");
    setDebouncedSearchInput("");
    config.onClose?.();
  }, [config, selectedContext]);

  const clearContext = useCallback(() => {
    setSelectedContext(null);
    setSearchInput("");
    setDebouncedSearchInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const updateSearch = useCallback((query: string) => {
    setSearchInput(query);
    setDebouncedSearchInput(query); // Skip debounce for external updates
  }, []);

  const handleEscape = useCallback(() => {
    if (selectedContext) {
      clearContext();
      return true; // Handled
    }
    return false; // Not handled - let parent handle
  }, [selectedContext, clearContext]);

  const resetState = useCallback(() => {
    setSelectedContext(null);
    setSearchInput("");
    setDebouncedSearchInput("");
  }, []);

  // Determine placeholder text
  const placeholder = useMemo(() => {
    if (selectedContext && config.contextPlaceholder) {
      return config.contextPlaceholder(selectedContext);
    }
    return config.placeholder || "Search...";
  }, [selectedContext, config]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-select context if there's only one category
  useEffect(() => {
    if (config.data.length === 1 && !selectedContext) {
      setSelectedContext(config.data[0]);
    }
  }, [config.data, selectedContext]);

  return {
    state: {
      selectedContext,
      searchInput,
      mode
    },
    actions: {
      selectContext,
      selectChild,
      clearContext,
      updateSearch,
      handleEscape,
      resetState
    },
    results,
    inputRef,
    placeholder
  };
}