import React from 'react';
import { Icon } from '@iconify/react';
import { nanoid } from 'nanoid';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  AIFallbackHandler,
  useAICommand,
  type AICommandResult,
  type AICommandItem
} from "../../../components/command-menu";
import { AnimateChangeInHeight } from "../../../components/filter/animate-change-in-height";
import { useHierarchicalNavigation } from '../../../hooks/useHierarchicalNavigation';
import {
  createSortedSearchFunction,
  sortByRelevance
} from '../../../utility/hierarchical-search';
import {
  ProductFilterType,
  ProductFilterOperator,
  ProductFilter,
  ProductFilterCategory
} from './FilterTypes';
import { useFilterState } from './hooks/useFilterState';
import { useDropdownState } from './hooks/useDropdownState';
import { generateProductFilterSuggestions } from './aiFilterAdapter';
import { DROPDOWN_CLOSE_DELAY, MIN_AI_TRIGGER_LENGTH } from './constants';

// Import required web components
import '../../../components/dropdown/dropdown.ts';
import 'iconify-icon';
import '../../../jsx-types';

export interface FilterControlsProps {
  filters: ProductFilter[];
  setFilters: React.Dispatch<React.SetStateAction<ProductFilter[]>>;
  filterCategories: ProductFilterCategory[];
}


export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  setFilters,
  filterCategories
}) => {
  const dropdownRef = React.useRef<{ hide: () => void } | null>(null);

  const { addFilter, clearFilters, hasActiveFilters } = useFilterState(filters, setFilters);
  const { hideDropdownWithDelay } = useDropdownState(dropdownRef, DROPDOWN_CLOSE_DELAY);

  const { state, actions, results, inputRef, placeholder } = useHierarchicalNavigation({
    data: filterCategories,
    searchFunction: createSortedSearchFunction(
      (types, query) => sortByRelevance(types, query, {
        threshold: 0.05,
        minMatchCharLength: 2,
        includeChildrenOnParentMatch: false
      }),
      (values, query) => sortByRelevance(values, query, {
        threshold: 0.05,
        minMatchCharLength: 2,
        includeChildrenOnParentMatch: false
      }),
      {
        threshold: 0.05,
        minMatchCharLength: 2,
        includeChildrenOnParentMatch: false
      }
    ),
    onSelectChild: (filterValue: { filterType: ProductFilterType; value: string }) => {
      addFilter(filterValue.filterType, filterValue.value);
      hideDropdownWithDelay();
    },
    placeholder: "Filter products...",
    contextPlaceholder: (type) => type.name
  });

  const availableValues = React.useMemo(() =>
    Object.fromEntries(
      filterCategories.map(category => [
        category.id,
        category.children?.map(child => child.value) || []
      ])
    ) as Record<ProductFilterType, string[]>,
    [filterCategories]
  );

  const handleAIRequest = React.useCallback(async (prompt: string) => {
    return await generateProductFilterSuggestions(prompt, Object.values(ProductFilterType), availableValues);
  }, [availableValues]);

  const { aiState, handleAIRequest: handleAICommandRequest, handleApplyAIResult, handleEditPrompt, clearResultsIfInputChanged } = useAICommand({
    onAIRequest: handleAIRequest
  });

  const handleApplyAIFilters = React.useCallback((result: AICommandResult) => {
    const newFilters = result.suggestedItems.map((item: AICommandItem) => {
      if (!item.metadata) throw new Error('Invalid AI command item: missing metadata');
      return {
        id: nanoid(),
        type: item.metadata.type as ProductFilterType,
        operator: item.metadata.operator as ProductFilterOperator,
        value: item.metadata.value as string[]
      };
    });

    setFilters(prev => [...prev, ...newFilters]);
    handleApplyAIResult(result);
    hideDropdownWithDelay();
  }, [handleApplyAIResult, hideDropdownWithDelay, setFilters]);

  const hasResults = React.useMemo(() => {
    return results.parents.length > 0 || results.children.length > 0;
  }, [results.parents.length, results.children.length]);

  React.useEffect(() => {
    if (state.searchInput && state.mode === 'global' && state.searchInput.length >= MIN_AI_TRIGGER_LENGTH && !hasResults) {
      handleAICommandRequest(state.searchInput);
    }
  }, [state.searchInput, state.mode, hasResults, handleAICommandRequest]);

  return (
    <div className="flex">
      {hasActiveFilters && (
        <button
          className="button"
          onClick={clearFilters}
        >
          <Icon icon="ph:x" className="icon" />
          <span className="inclusively-hidden">Clear filters</span>
        </button>
      )}
      <pp-dropdown ref={dropdownRef} placement="bottom-start">
        <button slot="trigger" className="button">
          <Icon icon="ph:funnel-simple" className="icon" />
          <span className="inclusively-hidden">Filter</span>
        </button>

        <div>
          <AnimateChangeInHeight>
            <Command shouldFilter={false} onEscape={actions.handleEscape}>
              <CommandInput
                placeholder={placeholder}
                value={state.searchInput}
                onValueChange={actions.updateSearch}
                ref={inputRef}
              />
              <CommandList>
                {!hasResults && state.searchInput.length >= 2 && (
                  <AIFallbackHandler
                    searchInput={state.searchInput}
                    aiState={aiState}
                    onAIRequest={handleAICommandRequest}
                    onApplyAIResult={handleApplyAIFilters}
                    onEditPrompt={handleEditPrompt}
                    onInputChange={clearResultsIfInputChanged}
                    onClose={hideDropdownWithDelay}
                  />
                )}

                {state.mode === 'contextual' ? (
                  <CommandGroup>
                    {results.contextualItems?.map((filterValue) => (
                      <CommandItem key={filterValue.id} onSelect={() => actions.selectChild(filterValue)}>
                        <iconify-icon icon={filterValue.icon} slot="prefix" />
                        <span>{filterValue.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <>
                    {results.parents.length > 0 && (
                      <CommandGroup>
                        {results.parents.map((filterType) => (
                          <CommandItem key={filterType.id} onSelect={() => actions.selectContext(filterType)}>
                            <iconify-icon icon={filterType.icon} slot="prefix" />
                            {filterType.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {results.children.length > 0 && (
                      <CommandGroup>
                        {results.children.map(({ parent, child }) => (
                          <CommandItem key={`${parent.id}-${child.id}`} onSelect={() => actions.selectChild(child, parent)}>
                            <iconify-icon icon={child.icon} slot="prefix" />
                            <span>{child.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </div>
      </pp-dropdown>
    </div>
  );
};