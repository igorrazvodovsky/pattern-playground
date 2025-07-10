import React, { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty
} from '../command-menu/command';
import { useHierarchicalNavigation } from '../../hooks/useHierarchicalNavigation';
import { createSortedSearchFunction, sortByRelevance } from '../../utils/unified-hierarchical-search';
import type {
  ReferenceCategory,
  ReferenceItem,
  ReferencePickerProps,
  ReferencePickerRef,
  SelectedReference
} from './reference-picker-types';
import 'iconify-icon';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        [key: string]: unknown;
        icon?: string;
        className?: string;
        slot?: string;
      };
    }
  }
}

/**
 * Custom Reference Picker that provides consistent hierarchical navigation
 * following the same pattern as Command Menu and Filtering
 */
export const ReferencePicker = forwardRef<ReferencePickerRef, ReferencePickerProps>(({
  data,
  onSelect,
  onClose,
  placeholder = "Search references...",
  open = true,
  className = "",
  ariaLabel = "Reference picker"
}, ref) => {

  // Create sorted search function for references
  const searchFunction = useMemo(() =>
    createSortedSearchFunction<ReferenceCategory, ReferenceItem>(
      // Sort categories by type order
      (categories, query) => {
        const typeOrder = ['user', 'document', 'project', 'file', 'api'];
        const sorted = sortByRelevance(categories, query);
        return sorted.sort((a, b) => {
          if (!query) {
            return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
          }
          return 0; // Keep relevance sorting when searching
        });
      },
      // Sort items by relevance
      (items, query) => sortByRelevance(items, query)
    ),
    []
  );

  // Handle reference selection
  const handleSelectReference = useCallback((item: ReferenceItem, category?: ReferenceCategory) => {
    const selectedReference: SelectedReference = {
      id: item.id,
      label: item.name,
      type: item.type,
      category: category?.name,
      metadata: item.metadata
    };
    onSelect(selectedReference);
  }, [onSelect]);

  // Create context placeholder
  const contextPlaceholder = useCallback((context: ReferenceCategory) => {
    return `Search ${context.name.toLowerCase()}...`;
  }, []);

  // Use hierarchical navigation hook
  const { state, actions, results, inputRef, placeholder: effectivePlaceholder } = useHierarchicalNavigation({
    data,
    searchFunction,
    onSelectChild: handleSelectReference,
    onClose,
    placeholder,
    contextPlaceholder
  });

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    close: () => {
      actions.resetState();
      onClose?.();
    }
  }), [actions, onClose, inputRef]);

  // Don't render if not open
  if (!open) return null;

  return (
    <div
      className={className}
      role="dialog"
      aria-label={ariaLabel}
      data-reference-picker
    >
      <Command
        label="Reference picker"
        shouldFilter={false}
        onEscape={actions.handleEscape}
      >
        <CommandInput
          placeholder={effectivePlaceholder}
          value={state.searchInput}
          onInputCapture={(e) => {
            actions.updateSearch(e.currentTarget.value);
          }}
          ref={inputRef}
        />

        <CommandList>
          {state.mode === 'contextual' ? (
            // Contextual mode: show items within selected category
            <>
              {results.contextualItems && results.contextualItems.length > 0 ? (
                <CommandGroup>
                  {results.contextualItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => actions.selectChild(item, state.selectedContext || undefined)}
                    >
                      <iconify-icon
                        icon={item.icon}
                        slot="prefix"
                      />
                      <div>
                        <div>{item.name}</div>
                        {/* {item.description && (
                          <div>{item.description}</div>
                        )} */}
                      </div>
                      {/* <div slot="suffix">
                        {item.type}
                      </div> */}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No {state.selectedContext?.name.toLowerCase()} found.</CommandEmpty>
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
                      value={category.id}
                      onSelect={(currentValue) => {
                        const selectedCategory = results.parents.find(p => p.id === currentValue);
                        if (selectedCategory) {
                          actions.selectContext(selectedCategory);
                        }
                      }}
                    >
                      <iconify-icon
                        icon={category.icon}
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
                <CommandGroup heading="Items">
                  {results.children.map(({ parent, child }) => (
                    <CommandItem
                      key={`${parent.id}-${child.id}`}
                      onSelect={() => actions.selectChild(child, parent)}
                    >
                      <iconify-icon
                        icon={child.icon}
                        slot="prefix"
                      />
                      <div>
                        <div>{child.name}</div>
                        <div>{parent.name} → {child.name}</div>
                        {child.description && (
                          <div>{child.description}</div>
                        )}
                      </div>
                      <div slot="suffix">
                        {child.type}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty state */}
              {results.parents.length === 0 && results.children.length === 0 && state.searchInput && (
                <CommandEmpty>No references found.</CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
});

ReferencePicker.displayName = 'ReferencePicker';