import { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '../command-menu/command';
import { useHierarchicalNavigation, type SearchableParent, type SearchableItem } from '../../hooks/useHierarchicalNavigation';
import { createSortedSearchFunction, sortByRelevance } from '../../utils/unified-hierarchical-search';
import type {
  SelectedReference,
  ReferencePickerProps,
  ReferencePickerRef
} from './types';
import 'iconify-icon';
import '../../jsx-types';

/**
 * Reference Picker using unified hierarchical navigation
 * Uses SearchableParent/SearchableItem directly - no transformation needed!
 */
export const ReferencePicker = forwardRef<ReferencePickerRef, ReferencePickerProps>(({
  data,
  query = '',
  onSelect,
  onClose,
  open = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: _mode = 'global', // Unused but kept for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedCategory: _selectedCategory = null, // Unused but kept for backward compatibility
  onCategorySelect,
  onBack
}, ref) => {

  // Data is already in SearchableParent format - no transformation needed!
  const hierarchicalData = data as SearchableParent[];
  
  // Hierarchical navigation setup
  const { state, actions, results, inputRef } = useHierarchicalNavigation({
    data: hierarchicalData,
    searchFunction: createSortedSearchFunction(
      (categories, query) => sortByRelevance(categories, query),
      (items, query) => sortByRelevance(items, query)
    ),
    onSelectChild: (item: SearchableItem) => {
      const selectedReference: SelectedReference = {
        id: item.id,
        label: item.name, // SearchableItem uses 'name', not 'label'
        type: (item as SearchableItem & { type: string }).type,
        metadata: item.metadata ? structuredClone(item.metadata) : undefined
      };
      onSelect(selectedReference);
    },
    onClose,
    placeholder: "Search references...",
    contextPlaceholder: (category) => `Search in ${category.name}...`
  });
  
  // Update search input when external query changes
  useMemo(() => {
    if (query !== state.searchInput) {
      actions.updateSearch(query);
    }
  }, [query, state.searchInput, actions]);
  
  // Handle category selection
  const handleCategorySelect = useCallback((category: SearchableParent) => {
    actions.selectContext(category);
    onCategorySelect?.(category as SearchableParent); // External callback gets unified format
  }, [actions, onCategorySelect]);

  // Handle escape key with unified behavior
  const handleEscape = useCallback(() => {
    const handled = actions.handleEscape();
    if (!handled) {
      onClose?.();
    }
    if (state.mode === 'contextual') {
      onBack?.();
    }
  }, [actions, onClose, onBack, state.mode]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    selectFirst: () => {},
    selectLast: () => {},
    selectNext: () => {},
    selectPrevious: () => {},
    getSelectedReference: () => null,
  }), [inputRef]);

  // Don't render if not open
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Reference picker"
      data-reference-picker
    >
      <Command
        label="Reference picker"
        shouldFilter={false}
        onEscape={handleEscape}
      >
        <CommandList>
          {state.mode === 'contextual' ? (
            // Contextual mode: show items within selected category
            <>
              {results.contextualItems && results.contextualItems.length > 0 ? (
                <CommandGroup>
                  {results.contextualItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => actions.selectChild(item)}
                    >
                      <iconify-icon
                        icon={item.icon as string}
                        slot="prefix"
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No {state.selectedContext?.name?.toLowerCase() ?? 'items'} found.</CommandEmpty>
              )}
            </>
          ) : (
            // Global mode: show categories and direct item matches
            <>
              {/* Reference Categories */}
              {results.parents.length > 0 && (
                <CommandGroup>
                  {results.parents.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategorySelect(category)}
                    >
                      <iconify-icon
                        icon={category.icon as string}
                        slot="prefix"
                      />
                      {category.name}
                      <iconify-icon
                        icon="ph:caret-right"
                        slot="suffix"
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Direct Item Matches */}
              {results.children.length > 0 && (
                <CommandGroup>
                  {results.children.map(({ parent, child }) => (
                    <CommandItem
                      key={`${parent.id}-${child.id}`}
                      onSelect={() => actions.selectChild(child)}
                    >
                      <iconify-icon
                        icon={child.icon as string}
                        slot="prefix"
                      />
                      {child.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty state */}
              {state.searchInput &&
               results.parents.length === 0 &&
               results.children.length === 0 && (
                <CommandEmpty>No references found for "{state.searchInput}".</CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
});

ReferencePicker.displayName = 'ReferencePicker';