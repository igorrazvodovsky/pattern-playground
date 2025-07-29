import { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandEmpty
} from '../command-menu/command';
import type {
  ReferenceCategory,
  ReferenceItem,
  SelectedReference,
  ReferencePickerProps,
  ReferencePickerRef,
  ReferenceMode
} from './types';
import 'iconify-icon';
import '../../jsx-types';


/**
 * Reference Picker that displays filtered references
 * No internal search - filtering is handled externally
 */
export const ReferencePicker = forwardRef<ReferencePickerRef, ReferencePickerProps>(({
  data,
  query = '',
  onSelect,
  onClose,
  open = true,
  mode = 'global',
  selectedCategory = null,
  onCategorySelect,
  onBack
}, ref) => {

  const isSingleCategory = data.length === 1;
  const effectiveMode: ReferenceMode = isSingleCategory ? 'contextual' : mode;
  const effectiveSelectedCategory = isSingleCategory ? data[0] : selectedCategory;

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    if (!query) return data;

    return data
      .filter(category => {
        const searchText = category.label?.toLowerCase() ?? '';
        return searchText.includes(query.toLowerCase());
      })
      .sort((a: ReferenceCategory, b: ReferenceCategory) => {
        const aRelevance = a.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
        const bRelevance = b.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
        return aRelevance - bRelevance;
      });
  }, [data, query]);

  // Filter and sort items within categories
  const filteredItems = useMemo(() => {
    if (effectiveMode === 'contextual' && effectiveSelectedCategory) {
      // Show items from selected category only with nullish coalescing
      const items = effectiveSelectedCategory.items ?? [];
      if (!query) return items;

      // Filter items that match the query
      return items
        .filter(item => {
          const searchText = item.label?.toLowerCase() ?? '';
          return searchText.includes(query.toLowerCase());
        })
        .sort((a: ReferenceItem, b: ReferenceItem) => {
          const aRelevance = a.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
          const bRelevance = b.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
          return aRelevance - bRelevance;
        });
    } else {
      // Show items from all categories
      return data.flatMap(category => {
        const items = category.items ?? [];

        if (!query) {
          // No query - return all items mapped to parent-child structure
          return items.map(child => ({ parent: category, child }));
        } else {
          // Filter items that match the query
          return items
            .filter(item => {
              const searchText = item.label?.toLowerCase() ?? '';
              return searchText.includes(query.toLowerCase());
            })
            .sort((a: ReferenceItem, b: ReferenceItem) => {
              const aRelevance = a.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
              const bRelevance = b.label?.toLowerCase().indexOf(query.toLowerCase()) ?? -1;
              return aRelevance - bRelevance;
            })
            .map((child: ReferenceItem) => ({ parent: category, child }));
        }
      });
    }
  }, [data, query, effectiveMode, effectiveSelectedCategory]);

  const handleSelectReference = useCallback((item: ReferenceItem) => {
    const selectedReference: SelectedReference = {
      id: item.id,
      label: item.label,
      type: item.type,
      metadata: item.metadata ? structuredClone(item.metadata) : undefined
    };
    onSelect(selectedReference);
  }, [onSelect]);

  const handleCategorySelect = useCallback((category: ReferenceCategory) => {
    onCategorySelect?.(category);
  }, [onCategorySelect]);

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
    selectFirst: () => {},
    selectLast: () => {},
    selectNext: () => {},
    selectPrevious: () => {},
    getSelectedReference: () => null,
  }), []);

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
          {effectiveMode === 'contextual' ? (
            // Contextual mode: show items within selected category
            <>
              {filteredItems.length > 0 ? (
                <CommandGroup>
                  {(filteredItems as ReferenceItem[]).map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => handleSelectReference(item)}
                    >
                      <iconify-icon
                        icon={(item.metadata?.icon as string) ?? 'ph:file'}
                        slot="prefix"
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No {effectiveSelectedCategory?.label?.toLowerCase() ?? 'items'} found.</CommandEmpty>
              )}
            </>
          ) : (
            // Global mode: show categories and direct item matches
            <>
              {/* Reference Categories - show when no query or when categories match */}
              {!query && filteredCategories.length > 0 && (
                <CommandGroup>
                  {filteredCategories.map((category: ReferenceCategory) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategorySelect(category)}
                    >
                      <iconify-icon
                        icon={(category.metadata?.icon as string) ?? 'ph:folder'}
                        slot="prefix"
                      />
                      {category.label}
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
                  {filteredCategories.map((category: ReferenceCategory) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategorySelect(category)}
                    >
                      <iconify-icon
                        icon={(category.metadata?.icon as string) ?? 'ph:folder'}
                        slot="prefix"
                      />
                        {category.label}
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
                      onSelect={() => handleSelectReference(child)}
                    >
                      <iconify-icon
                        icon={(child.metadata?.icon as string) ?? 'ph:file'}
                        slot="prefix"
                      />
                      {child.label}
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