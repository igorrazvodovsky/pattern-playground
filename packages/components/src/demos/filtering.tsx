import * as React from "react";
import { nanoid } from "nanoid";
import { Icon } from '@iconify/react';

import {
  Combobox,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../components/combobox";
import {
  AIFallbackHandler,
  useAICommand,
  type AICommandResult,
  type AIComboboxItem
} from "../components/command-menu";
import { AnimateChangeInHeight } from "../components/filter/animate-change-in-height";
import Filters from "../components/filter/filters";

import type { Filter, FilterOperator } from "../components/filter/filter-types";
import { taskFilterCategories, TASK_FILTER_PATHS } from "../components/filter/filter-options";
import { useHierarchicalNavigation } from '../hooks/useHierarchicalNavigation';
import {
  createSortedSearchFunction,
  sortByRelevance
} from '../utility/hierarchical-search';

import { generateFilterSuggestions } from "../components/filter/adapters/ai-filter-adapter";

import { tasks, users, filterPriorities } from "@shared/data";
import {
  taskBinding,
  findAttribute,
  defaultFilterOperator,
  applyFilters,
} from "@shared/data/bindings";
import { EntityCard } from "../templates/collection-view/renderers";

import '../components/dropdown/dropdown.ts';
import 'iconify-icon';
import '../jsx-types';

const DROPDOWN_CLOSE_DELAY = 200;
const MIN_AI_TRIGGER_LENGTH = 3;


const useFilterState = (initialFilters: Filter[] = []) => {
  const [filters, setFilters] = React.useState<Filter[]>(initialFilters);

  const addFilter = React.useCallback((path: string, value: string) => {
    const newFilter: Filter = {
      id: nanoid(),
      path,
      operator: defaultFilterOperator(findAttribute(taskBinding, path), value),
      values: [value],
    };
    setFilters(prev => [...prev, newFilter]);
  }, []);

  const clearFilters = React.useCallback(() => setFilters([]), []);

  const hasActiveFilters = React.useMemo(
    () => filters.some(filter => filter.values?.length > 0),
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


// Defaults built from the data the facets read, so the chips always name
// values the collection actually carries.
const defaultFilters: Filter[] = [
  {
    id: 'default-status',
    path: 'status.label',
    operator: 'is any of',
    values: ['Todo', 'In Progress'],
  },
  {
    id: 'default-priority',
    path: 'priority.label',
    operator: 'is any of',
    values: filterPriorities.slice(0, 2).map((priority) => priority.value),
  },
  {
    id: 'default-assignee',
    path: 'assignee.name',
    operator: 'is any of',
    values: users.slice(1, 3).map((user) => user.name),
  },
];

export function FilteringDemo({
  initialFilters = defaultFilters,
  onFilterChange,
}: {
  initialFilters?: Filter[];
  onFilterChange?: (filters: Filter[]) => void;
} = {}) {
  const dropdownRef = React.useRef<{ hide: () => void } | null>(null);

  const { filters, setFilters, addFilter, clearFilters, hasActiveFilters } = useFilterState(initialFilters);

  React.useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);
  const { hideDropdownWithDelay } = useDropdownState(dropdownRef);

  const { state, actions, results, inputRef, placeholder } = useHierarchicalNavigation({
    data: taskFilterCategories,
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
    placeholder: "Filter...",
    contextPlaceholder: (type) => type.name
  });

  // The clauses evaluate: the same matcher every bound entity filters with,
  // over the task binding.
  const visibleTasks = React.useMemo(
    () => applyFilters(tasks, filters, taskBinding),
    [filters]
  );

  const availableValues = React.useMemo(() =>
    Object.fromEntries(
      taskFilterCategories.map(category => [
        category.id,
        category.children?.map(child => child.value) || []
      ])
    ) as Record<string, string[]>,
    []
  );

  const handleAIRequest = React.useCallback(async (prompt: string) => {
    return await generateFilterSuggestions(prompt, TASK_FILTER_PATHS, availableValues);
  }, [availableValues]);

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
    <div className="flow">
      <div className="flex">
        <Filters filters={filters} setFilters={setFilters} />
        {hasActiveFilters && (
          <button
            className="button"
            onClick={clearFilters}
          >
            <Icon icon="ph:x" className="icon" />
            <span className="visually-hidden">Clear</span>
          </button>
        )}
        <pp-dropdown ref={dropdownRef} placement="bottom-start">
          <button slot="trigger" className="button">
            <Icon icon="ph:funnel-simple" className="icon" />
            <span className={filters.length ? "visually-hidden" : ""}>Filter</span>
          </button>

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
                          <iconify-icon icon={filterValue.icon} slot="prefix" />
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
                              <iconify-icon icon={filterType.icon} slot="prefix" />
                              {filterType.name}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      )}

                      {results.children.length > 0 && (
                        <ComboboxGroup>
                          {results.children.map(({ parent, child }) => (
                            <ComboboxItem key={`${parent.id}-${child.id}`} onSelect={() => actions.selectChild(child, parent)}>
                              <iconify-icon icon={child.icon} slot="prefix" />
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
        </pp-dropdown>
      </div>

      {visibleTasks.length > 0 && (
        <section className="cards cards--list">
          {visibleTasks.map((task) => (
            <div key={task.id}>
              <EntityCard
                item={task}
                binding={taskBinding}
                shownAttributes={['title', 'status.label', 'assignee.name', 'dueDate']}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
