import * as React from "react";
import { nanoid } from "nanoid";
import { Icon } from '@iconify/react';

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
} from '../../../utils/hierarchical-search';

import { generateFilterSuggestions } from "../../../components/filter/adapters/ai-filter-adapter";

import { filterCategories } from "../../data/index.ts";

import '../../../components/dropdown/dropdown.ts';
import 'iconify-icon';
import '../../../jsx-types';

const DROPDOWN_CLOSE_DELAY = 200;
const MIN_AI_TRIGGER_LENGTH = 3;



const getFilterOperator = (filterType: FilterType, value: string): FilterOperator => {
  return filterType === FilterType.DUE_DATE && value !== DueDate.IN_THE_PAST
    ? FilterOperator.BEFORE
    : FilterOperator.IS;
};


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

  const { filters, setFilters, addFilter, clearFilters, hasActiveFilters } = useFilterState(initialFilters);
  const { hideDropdownWithDelay } = useDropdownState(dropdownRef);

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
    onSelectChild: (filterValue: { filterType: FilterType; value: string }) => {
      addFilter(filterValue.filterType, filterValue.value);
      hideDropdownWithDelay();
    },
    placeholder: "Filter...",
    contextPlaceholder: (type) => type.name
  });

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
}