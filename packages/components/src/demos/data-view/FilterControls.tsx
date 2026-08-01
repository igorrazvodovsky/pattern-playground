import React from 'react';
import { Icon } from '@iconify/react';
import { nanoid } from 'nanoid';
import {
  Combobox,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../../components/combobox";
import {
  AIFallbackHandler,
  useAICommand,
  type AICommandResult,
  type AIComboboxItem
} from "../../components/command-menu";
import { AnimateChangeInHeight } from "../../components/filter/animate-change-in-height";
import { useHierarchicalNavigation } from '../../hooks/useHierarchicalNavigation';
import {
  createSortedSearchFunction,
  sortByRelevance
} from '../../utility/hierarchical-search';
import type { AttributeFilter, FilterOperator } from '@shared/data/bindings';
import { FilterCategory } from './FilterCategories';
import { useFilterState } from './hooks/useFilterState';
import { useDropdownState } from './hooks/useDropdownState';
import { generateProductFilterSuggestions } from './aiFilterAdapter';
import { DROPDOWN_CLOSE_DELAY, MIN_AI_TRIGGER_LENGTH } from './constants';

// Import required web components
import '../../components/dropdown/dropdown.ts';
import 'iconify-icon';
import '../../jsx-types';

export interface FilterControlsProps {
  filters: AttributeFilter[];
  setFilters: React.Dispatch<React.SetStateAction<AttributeFilter[]>>;
  filterCategories: FilterCategory[];
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
    onSelectChild: (filterValue: { path: string; value: string }) => {
      addFilter(filterValue.path, filterValue.value);
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
    ) as Record<string, string[]>,
    [filterCategories]
  );

  const handleAIRequest = React.useCallback(async (prompt: string) => {
    return await generateProductFilterSuggestions(
      prompt,
      filterCategories.map(category => category.id),
      availableValues
    );
  }, [filterCategories, availableValues]);

  const { aiState, handleAIRequest: handleAICommandRequest, handleApplyAIResult, handleEditPrompt, clearResultsIfInputChanged } = useAICommand({
    onAIRequest: handleAIRequest
  });

  const handleApplyAIFilters = React.useCallback((result: AICommandResult) => {
    const newFilters = result.suggestedItems.map((item: AIComboboxItem) => {
      if (!item.metadata) throw new Error('Invalid AI command item: missing metadata');
      return {
        id: nanoid(),
        path: item.metadata.path as string,
        operator: item.metadata.operator as FilterOperator,
        values: item.metadata.values as string[]
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
          <span className="visually-hidden">Clear filters</span>
        </button>
      )}
      <pp-dropdown ref={dropdownRef} placement="bottom-start">
        <button data-slot="trigger" className="button">
          <Icon icon="ph:funnel-simple" className="icon" />
          <span className="visually-hidden">Filter</span>
        </button>

        <pp-popup>
          <div>
            <AnimateChangeInHeight>
              <Combobox shouldFilter={false} onEscape={actions.handleEscape}>
                <ComboboxInput
                  placeholder={placeholder}
                  value={state.searchInput}
                  onValueChange={actions.updateSearch}
                  ref={inputRef}
                />
                <ComboboxList>
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
                    <ComboboxGroup>
                      {results.contextualItems?.map((filterValue) => (
                        <ComboboxItem key={filterValue.id} onSelect={() => actions.selectChild(filterValue)}>
                          {filterValue.icon && <iconify-icon icon={filterValue.icon} slot="prefix" />}
                          <span>{filterValue.name}</span>
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  ) : (
                    <>
                      {results.parents.length > 0 && (
                        <ComboboxGroup>
                          {results.parents.map((filterType) => (
                            <ComboboxItem key={filterType.id} onSelect={() => actions.selectContext(filterType)}>
                              {filterType.icon && <iconify-icon icon={filterType.icon} slot="prefix" />}
                              {filterType.name}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      )}

                      {results.children.length > 0 && (
                        <ComboboxGroup>
                          {results.children.map(({ parent, child }) => (
                            <ComboboxItem key={`${parent.id}-${child.id}`} onSelect={() => actions.selectChild(child, parent)}>
                              {child.icon && <iconify-icon icon={child.icon} slot="prefix" />}
                              <span>{child.name}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      )}
                    </>
                  )}
                </ComboboxList>
              </Combobox>
            </AnimateChangeInHeight>
          </div>
        </pp-popup>
      </pp-dropdown>
    </div>
  );
};
