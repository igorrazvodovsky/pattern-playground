import * as React from "react";
import { nanoid } from "nanoid";
import { Icon } from '@iconify/react';
// Removed unused Slot import

// Component imports
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
import Filters from "../../../components/filter/filters";

// Type imports
import {
  DueDate,
  FilterOperator,
  FilterType,
} from "../../../components/filter/filter-types";
import type { Filter } from "../../../components/filter/filter-types";
import { useHierarchicalNavigation } from '../../../hooks/useHierarchicalNavigation';
import {
  createSortedSearchFunction,
  sortByRelevance
} from '../../../utils/unified-hierarchical-search';

// AI functionality
import { generateFilterSuggestions } from "../../../components/filter/adapters/ai-filter-adapter";

// Unified data
import { filterCategories } from "../../shared-data";

// Styles
import '../../../components/dropdown/dropdown.ts';
import 'iconify-icon';
import '../../../jsx-types';

// Constants
const DROPDOWN_CLOSE_DELAY = 200;
const MIN_AI_TRIGGER_LENGTH = 3;

// No custom types needed - using unified SearchableParent/SearchableItem!


// Utility function for operator selection
const getFilterOperator = (filterType: FilterType, value: string): FilterOperator => {
  return filterType === FilterType.DUE_DATE && value !== DueDate.IN_THE_PAST
    ? FilterOperator.BEFORE
    : FilterOperator.IS;
};

// No more transformation needed - use unified data directly!

// Custom hooks
const useFilterState = (initialFilters: Filter[] = []) => {
  const [filters, setFilters] = React.useState<Filter[]>(initialFilters);

  const addFilter = React.useCallback((filterType: FilterType, value: string) => {
    const newFilter: Filter = {
      id: nanoid(),
      type: filterType,
      operator: getFilterOperator(filterType, value),
      value: [value],
    };
    setFilters(prev => [...prev, newFilter]);
  }, []);

  const clearFilters = React.useCallback(() => setFilters([]), []);

  const hasActiveFilters = React.useMemo(
    () => filters.some(filter => filter.value?.length > 0),
    [filters]
  );

  return { filters, setFilters, addFilter, clearFilters, hasActiveFilters };
};

const useDropdownState = (dropdownRef: React.RefObject<{ hide: () => void }>) => {
  const hideDropdownWithDelay = React.useCallback(() => {
    setTimeout(() => dropdownRef.current?.hide(), DROPDOWN_CLOSE_DELAY);
  }, [dropdownRef]);

  return { hideDropdownWithDelay };
};


export function FilteringDemo({
  initialFilters = [],
}: {
  initialFilters?: Filter[];
} = {}) {
  const dropdownRef = React.useRef<{ hide: () => void } | null>(null);

  // State management
  const { filters, setFilters, addFilter, clearFilters, hasActiveFilters } = useFilterState(initialFilters);
  const { hideDropdownWithDelay } = useDropdownState(dropdownRef);

  // Hierarchical navigation setup - no transformation needed!
  const { state, actions, results, inputRef, placeholder } = useHierarchicalNavigation({
    data: filterCategories,
    searchFunction: createSortedSearchFunction(
      (types, query) => sortByRelevance(types, query),
      (values, query) => sortByRelevance(values, query)
    ),
    onSelectChild: (filterValue: { filterType: FilterType; value: string }) => {
      addFilter(filterValue.filterType, filterValue.value);
      hideDropdownWithDelay();
    },
    placeholder: "Filter...",
    contextPlaceholder: (type) => type.name
  });

  // AI integration - use unified filter data
  const availableValues = React.useMemo(() =>
    Object.fromEntries(
      filterCategories.map(category => [
        category.id,
        category.children?.map(child => child.value) || []
      ])
    ) as Record<FilterType, string[]>,
    []
  );

  const handleAIRequest = React.useCallback(async (prompt: string) => {
    return await generateFilterSuggestions(prompt, Object.values(FilterType), availableValues);
  }, [availableValues]);

  const { aiState, handleAIRequest: handleAICommandRequest, handleApplyAIResult, handleEditPrompt, clearResultsIfInputChanged } = useAICommand({
    onAIRequest: handleAIRequest
  });

  const handleApplyAIFilters = React.useCallback((result: AICommandResult) => {
    const newFilters = result.suggestedItems.map((item: AICommandItem) => {
      if (!item.metadata) throw new Error('Invalid AI command item: missing metadata');
      return {
        id: nanoid(),
        type: item.metadata.type as FilterType,
        operator: item.metadata.operator as FilterOperator,
        value: item.metadata.value as string[]
      };
    });

    setFilters(prev => [...prev, ...newFilters]);
    handleApplyAIResult(result);
    hideDropdownWithDelay();
  }, [handleApplyAIResult, hideDropdownWithDelay, setFilters]);

  // Trigger AI when searching globally
  React.useEffect(() => {
    if (state.searchInput && state.mode === 'global' && state.searchInput.length >= MIN_AI_TRIGGER_LENGTH) {
      handleAICommandRequest(state.searchInput);
    }
  }, [state.searchInput, state.mode, handleAICommandRequest]);

  return (
    <div className="flex">
      <Filters filters={filters} setFilters={setFilters} />
      {hasActiveFilters && (
        <button
          className="button"
          onClick={clearFilters}
        >
          <Icon icon="ph:x" className="icon" />
          <span className="inclusively-hidden">Clear</span>
        </button>
      )}
      <pp-dropdown ref={dropdownRef} placement="bottom-start">
        <button slot="trigger" className="button">
          <Icon icon="ph:funnel-simple" className="icon" />
          <span className={filters.length ? "inclusively-hidden" : ""}>Filter</span>
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
                <AIFallbackHandler
                  searchInput={state.searchInput}
                  aiState={aiState}
                  onAIRequest={handleAICommandRequest}
                  onApplyAIResult={handleApplyAIFilters}
                  onEditPrompt={handleEditPrompt}
                  onInputChange={clearResultsIfInputChanged}
                  onClose={hideDropdownWithDelay}
                />

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
}