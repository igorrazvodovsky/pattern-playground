import { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '../command-menu/command';
import { useHierarchicalNavigation, type SearchableParent, type SearchableItem } from '../../hooks/useHierarchicalNavigation';
import { createSortedSearchFunction, sortByRelevance } from '../../utils/hierarchical-search';
import type {
  SelectedReference,
  ReferencePickerProps,
  ReferencePickerRef
} from './types';
import 'iconify-icon';
import '../../jsx-types';

export const ReferencePicker = forwardRef<ReferencePickerRef, ReferencePickerProps>(({
  data,
  query = '',
  onSelect,
  onClose,
  open = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: _mode = 'global',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedCategory: _selectedCategory = null,
  onCategorySelect,
  onBack
}, ref) => {

  const hierarchicalData = data as SearchableParent[];
  
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
  
  useMemo(() => {
    if (query !== state.searchInput) {
      actions.updateSearch(query);
    }
  }, [query, state.searchInput, actions]);
  
  const handleCategorySelect = useCallback((category: SearchableParent) => {
    actions.selectContext(category);
    onCategorySelect?.(category as SearchableParent);
  }, [actions, onCategorySelect]);

  const handleEscape = useCallback(() => {
    const handled = actions.handleEscape();
    if (!handled) {
      onClose?.();
    }
    if (state.mode === 'contextual') {
      onBack?.();
    }
  }, [actions, onClose, onBack, state.mode]);

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
            <>
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

              {state.searchInput &&
               state.searchInput.length >= 2 &&
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