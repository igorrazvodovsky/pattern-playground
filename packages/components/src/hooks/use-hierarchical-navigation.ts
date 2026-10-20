import { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect } from 'react';

import type {
  SearchableParent,
  SearchableItem,
  HierarchicalSearchResults,
} from '../utility/hierarchical-search';

export type { SearchableParent, SearchableItem, HierarchicalSearchResults };

export interface HierarchicalNavigationConfig<
  TParent extends SearchableParent,
  TChild extends SearchableItem,
> {
  data: TParent[];
  searchFunction: (
    input: string,
    data: TParent[],
    context?: TParent,
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

export interface HierarchicalNavigationActions<
  TParent extends SearchableParent,
  TChild extends SearchableItem,
> {
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
export function useHierarchicalNavigation<
  TParent extends SearchableParent,
  TChild extends SearchableItem,
>(
  config: HierarchicalNavigationConfig<TParent, TChild>,
): {
  state: HierarchicalNavigationState<TParent>;
  actions: HierarchicalNavigationActions<TParent, TChild>;
  results: HierarchicalSearchResults<TParent, TChild>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
} {
  const [selectedContext, setSelectedContext] = useState<TParent | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Callers build `config` inline, so its identity changes on every render.
  // The search re-runs only when the query, the context or the data change,
  // and the actions read the latest config when they run.
  const configRef = useRef(config);
  useLayoutEffect(() => {
    configRef.current = config;
  });
  const { data } = config;

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
    const { searchFunction } = configRef.current;
    if (selectedContext) {
      const contextualItems =
        searchFunction(debouncedSearchInput, [selectedContext], selectedContext).contextualItems ||
        [];
      return {
        parents: [],
        children: [],
        contextualItems,
      };
    } else {
      return searchFunction(debouncedSearchInput, data);
    }
  }, [debouncedSearchInput, selectedContext, data]);

  const selectContext = useCallback((context: TParent) => {
    setSelectedContext(context);
    setSearchInput('');
    setDebouncedSearchInput('');
    configRef.current.onSelectParent?.(context);
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const selectChild = useCallback(
    (child: TChild, parent?: TParent) => {
      configRef.current.onSelectChild(child, parent || selectedContext || undefined);
      // Reset state after selection (can be overridden by caller)
      setSelectedContext(null);
      setSearchInput('');
      setDebouncedSearchInput('');
      configRef.current.onClose?.();
    },
    [selectedContext],
  );

  const clearContext = useCallback(() => {
    setSelectedContext(null);
    setSearchInput('');
    setDebouncedSearchInput('');
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
    setSearchInput('');
    setDebouncedSearchInput('');
  }, []);

  const placeholder =
    selectedContext && config.contextPlaceholder
      ? config.contextPlaceholder(selectedContext)
      : config.placeholder || 'Search...';

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-select context if there's only one category
  useEffect(() => {
    if (data.length === 1 && !selectedContext) {
      setSelectedContext(data[0]);
    }
  }, [data, selectedContext]);

  return {
    state: {
      selectedContext,
      searchInput,
      mode,
    },
    actions: {
      selectContext,
      selectChild,
      clearContext,
      updateSearch,
      handleEscape,
      resetState,
    },
    results,
    inputRef,
    placeholder,
  };
}
