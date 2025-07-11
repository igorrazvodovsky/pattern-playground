import React, { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '../command-menu/command';
import { sortByRelevance } from '../../utils/unified-hierarchical-search';
import type {
  ReferenceCategory,
  ReferenceItem,
  SelectedReference,
  ReferencePickerProps,
  ReferencePickerRef
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
 * Simple Reference Picker that displays filtered references
 * No internal search - filtering is handled externally
 */
export const ReferencePicker = forwardRef<ReferencePickerRef, ReferencePickerProps>(({
  data,
  query = '',
  onSelect,
  onClose,
  open = true,
  className = "",
  ariaLabel = "Reference picker",
  mode = 'global',
  selectedCategory = null,
  onCategorySelect,
  onBack
}, ref) => {

  // Auto-select single category mode
  const isSingleCategory = data.length === 1;
  const effectiveMode = isSingleCategory ? 'contextual' : mode;
  const effectiveSelectedCategory = isSingleCategory ? data[0] : selectedCategory;

  // Filter and sort categories based on query
  const filteredCategories = useMemo(() => {
    if (!query) return data;

    // Filter categories that match the query
    const matchingCategories = data.filter(category => {
      const searchText = (category.searchableText || category.name || '').toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    return sortByRelevance(matchingCategories, query);
  }, [data, query]);

  // Filter and sort items within categories
  const filteredItems = useMemo(() => {
    if (effectiveMode === 'contextual' && effectiveSelectedCategory) {
      // Show items from selected category only
      const items = effectiveSelectedCategory.children || [];
      if (!query) return items;

      // Filter items that match the query
      const matchingItems = items.filter(item => {
        const searchText = (item.searchableText || item.name || '').toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

      return sortByRelevance(matchingItems, query);
    } else {
      // Show items from all categories that match query
      const allItems: Array<{ parent: ReferenceCategory; child: ReferenceItem }> = [];
      for (const category of data) {
        const items = category.children || [];

        if (!query) {
          // No query - return all items
          items.forEach(item => {
            allItems.push({ parent: category, child: item });
          });
        } else {
          // Filter items that match the query
          const matchingItems = items.filter(item => {
            const searchText = (item.searchableText || item.name || '').toLowerCase();
            return searchText.includes(query.toLowerCase());
          });

          sortByRelevance(matchingItems, query).forEach(item => {
            allItems.push({ parent: category, child: item });
          });
        }
      }
      return allItems;
    }
  }, [data, query, effectiveMode, effectiveSelectedCategory]);

  // Handle reference selection
  const handleSelectReference = useCallback((item: ReferenceItem, category?: ReferenceCategory) => {
    const selectedReference: SelectedReference = {
      id: item.id,
      label: item.name,
      type: item.type,
      category: category?.name || effectiveSelectedCategory?.name,
      metadata: item.metadata
    };
    onSelect(selectedReference);
  }, [onSelect, effectiveSelectedCategory]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: ReferenceCategory) => {
    onCategorySelect?.(category);
  }, [onCategorySelect]);

  // Handle escape key
  const handleEscape = useCallback(() => {
    if (effectiveMode === 'contextual' && !isSingleCategory) {
      onBack?.();
    } else {
      onClose?.();
    }
  }, [effectiveMode, isSingleCategory, onBack, onClose]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    focus: () => {
      // Focus handled externally by TipTap
    },
    close: () => {
      onClose?.();
    }
  }), [onClose]);

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
        onEscape={handleEscape}
      >
        <CommandList>
          {effectiveMode === 'contextual' ? (
            // Contextual mode: show items within selected category
            <>
              {filteredItems.length > 0 ? (
                <CommandGroup>
                  {(filteredItems as ReferenceItem[]).map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelectReference(item, effectiveSelectedCategory || undefined)}
                    >
                      <iconify-icon
                        icon={item.icon}
                        slot="prefix"
                      />
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No {effectiveSelectedCategory?.name.toLowerCase()} found.</CommandEmpty>
              )}
            </>
          ) : (
            // Global mode: show categories and direct item matches
            <>
              {/* Reference Categories - show when no query or when categories match */}
              {!query && filteredCategories.length > 0 && (
                <CommandGroup>
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategorySelect(category)}
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

              {/* Matching Categories when searching */}
              {query && filteredCategories.length > 0 && (
                <CommandGroup>
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategorySelect(category)}
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
              {query && (filteredItems as Array<{ parent: ReferenceCategory; child: ReferenceItem }>).length > 0 && (
                <CommandGroup>
                  {(filteredItems as Array<{ parent: ReferenceCategory; child: ReferenceItem }>).map(({ parent, child }) => (
                    <CommandItem
                      key={`${parent.id}-${child.id}`}
                      onSelect={() => handleSelectReference(child, parent)}
                    >
                      <iconify-icon
                        icon={child.icon}
                        slot="prefix"
                      />
                      {child.name}
                      {/* {parent.name} */}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Empty state */}
              {query &&
               filteredCategories.length === 0 &&
               (filteredItems as Array<{ parent: ReferenceCategory; child: ReferenceItem }>).length === 0 && (
                <CommandEmpty>No references found for "{query}".</CommandEmpty>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </div>
  );
});

ReferencePicker.displayName = 'ReferencePicker';