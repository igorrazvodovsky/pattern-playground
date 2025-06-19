import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  AICommandEmpty,
  useAICommand,
  type AICommandResult,
  type AICommandItem
} from "../../../components/command-menu";
import { nanoid } from "nanoid";
import * as React from "react";
import { AnimateChangeInHeight } from "../../../components/filter/animate-change-in-height";
import Filters from "../../../components/filter/filters";
import {
  DueDate,
  FilterOperator,
  FilterType,
} from "../../../components/filter/filter-types";
import {
  filterViewToFilterOptions,
  createGlobalFilterItems,
  getFilteredResults,
  type SearchableFilterItem
} from "../../../components/filter/filter-options";
import type { Filter, FilterOption } from "../../../components/filter/filter-types";
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import '../../../components/dropdown/dropdown.ts';
import 'iconify-icon';

// Add these imports for AI functionality
import { generateFilterSuggestions } from "../../../components/filter/adapters/ai-filter-adapter";

// Constants
const DROPDOWN_CLOSE_DELAY = 200;
const MIN_AI_TRIGGER_LENGTH = 3;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-dropdown': {
        [key: string]: any;
        ref?: React.Ref<any>;
        placement?: string;
        open?: boolean;
        'onPp-show'?: () => void;
        'onPp-hide'?: () => void;
        children?: React.ReactNode;
      };
      'iconify-icon': {
        [key: string]: any;
        icon?: string;
        className?: string;
        slot?: string;
      };
    }
  }
}

// Utility function for operator selection
const getFilterOperator = (filterType: FilterType, value: string): FilterOperator => {
  return filterType === FilterType.DUE_DATE && value !== DueDate.IN_THE_PAST
    ? FilterOperator.BEFORE
    : FilterOperator.IS;
};

// Custom hook for managing filter state
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

  const clearFilters = React.useCallback(() => {
    setFilters([]);
  }, []);

  const hasActiveFilters = React.useMemo(
    () => filters.some(filter => filter.value?.length > 0),
    [filters]
  );

  return {
    filters,
    setFilters,
    addFilter,
    clearFilters,
    hasActiveFilters
  };
};

// Custom hook for dropdown state management
const useDropdownState = (dropdownRef: React.RefObject<any>) => {
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(null);
  const [commandInput, setCommandInput] = React.useState("");

  const resetState = React.useCallback(() => {
    setSelectedView(null);
    setCommandInput("");
  }, []);

  const hideDropdownWithDelay = React.useCallback(() => {
    setTimeout(() => {
      resetState();
    }, DROPDOWN_CLOSE_DELAY);
    dropdownRef.current?.hide();
  }, [resetState]);

  const handleDropdownHide = React.useCallback(() => {
    setTimeout(() => {
      resetState();
    }, DROPDOWN_CLOSE_DELAY);
  }, [resetState]);

  return {
    selectedView,
    setSelectedView,
    commandInput,
    setCommandInput,
    resetState,
    hideDropdownWithDelay,
    handleDropdownHide
  };
};

// Custom hook for filtered results
const useFilteredResults = (
  commandInput: string,
  selectedView: FilterType | null,
  globalFilterItems: any[]
) => {
  return React.useMemo(() => {
    if (selectedView) {
      // When a view is selected, search within that view's options only
      const viewOptions = filterViewToFilterOptions[selectedView];
      if (!commandInput.trim()) {
        return { filterTypes: [], filterValues: [], viewOptions };
      }
      const filteredViewOptions = viewOptions.filter(option =>
        option.name.toLowerCase().includes(commandInput.toLowerCase())
      );
      return { filterTypes: [], filterValues: [], viewOptions: filteredViewOptions };
    } else {
      // When no view is selected, use global search
      return getFilteredResults(commandInput, globalFilterItems);
    }
  }, [commandInput, selectedView, globalFilterItems]);
};

// Component for rendering filter type options
const FilterTypeOptions: React.FC<{
  filteredResults: any;
  onSelectView: (view: FilterType) => void;
  onClearInput: () => void;
  commandInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ filteredResults, onSelectView, onClearInput, commandInputRef }) => (
  <>
    {filteredResults.filterTypes.map(
      (group: FilterOption[], index: number) => (
        <React.Fragment key={`filter-types-${index}`}>
          <CommandGroup>
            {group.map((filter: FilterOption) => (
              <CommandItem
                key={filter.name}
                value={filter.name}
                onSelect={(currentValue) => {
                  onSelectView(currentValue as FilterType);
                  onClearInput();
                  commandInputRef.current?.focus();
                }}
              >
                <Slot slot="prefix">
                  {filter.icon}
                </Slot>
                {filter.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </React.Fragment>
      )
    )}
  </>
);

// Component for rendering filter value options
const FilterValueOptions: React.FC<{
  filteredResults: any;
  onSelectValue: (type: FilterType, value: string) => void;
}> = ({ filteredResults, onSelectValue }) => (
  <>
    {filteredResults.filterValues.length > 0 && (
      <CommandGroup>
        {filteredResults.filterValues.map((item: SearchableFilterItem) => (
          <CommandItem
            key={`${item.type}-${item.value}`}
            value={`${item.type} ${item.value}`}
            onSelect={() => {
              onSelectValue(item.type, item.value);
            }}
          >
            <Slot slot="prefix">
              {item.typeIcon}
            </Slot>
            <span>
              {item.value}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    )}
  </>
);

// Component for rendering selected view options
const SelectedViewOptions: React.FC<{
  filteredResults: any;
  selectedView: FilterType;
  onSelectValue: (type: FilterType, value: string) => void;
}> = ({ filteredResults, selectedView, onSelectValue }) => (
  <CommandGroup>
    {('viewOptions' in filteredResults && filteredResults.viewOptions) &&
     filteredResults.viewOptions.map((filter: FilterOption) => (
      <CommandItem
        key={filter.name}
        value={filter.name}
        onSelect={(currentValue) => {
          onSelectValue(selectedView, currentValue);
        }}
      >
        <Slot slot="prefix">
          {filter.icon}
        </Slot>
        <span>
          {filter.name}
        </span>
        {filter.label && (
          <span slot="suffix">
            {filter.label}
          </span>
        )}
      </CommandItem>
    ))}
  </CommandGroup>
);

export function FilteringDemo({
  initialFilters = [],
}: {
  initialFilters?: Filter[];
} = {}) {
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<any>(null);

  // Custom hooks for state management
  const { filters, setFilters, addFilter, clearFilters, hasActiveFilters } = useFilterState(initialFilters);
  const {
    selectedView,
    setSelectedView,
    commandInput,
    setCommandInput,
    resetState,
    hideDropdownWithDelay,
    handleDropdownHide
  } = useDropdownState(dropdownRef);

  // Create stable available values mapping
  const availableValues = React.useMemo(() =>
    Object.fromEntries(
      Object.entries(filterViewToFilterOptions).map(([key, options]) => [
        key,
        options.map(option => option.name as string)
      ])
    ) as Record<FilterType, string[]>,
    []
  );

  // Create AI request handler
  const handleAIRequest = React.useCallback(async (prompt: string) => {
    const result = await generateFilterSuggestions(
      prompt,
      Object.values(FilterType),
      availableValues
    );
    return result;
  }, [availableValues]);

  // Use AI command hook
  const {
    aiState,
    handleAIRequest: handleAICommandRequest,
    handleApplyAIResult,
    handleEditPrompt,
    clearResultsIfInputChanged
  } = useAICommand({
    onAIRequest: handleAIRequest
  });

  // Memoize global filter items for performance
  const globalFilterItems = React.useMemo(() => createGlobalFilterItems(), []);

  // Get filtered results
  const filteredResults = useFilteredResults(commandInput, selectedView, globalFilterItems);

  // Handle applying AI-generated filters
  const handleApplyAIFilters = React.useCallback((result: AICommandResult) => {
    // Convert AI command result to filter format and apply filters
    const newFilters = result.suggestedItems.map((item: AICommandItem) => {
      if (!item.metadata) {
        throw new Error('Invalid AI command item: missing metadata');
      }
      return {
        id: nanoid(),
        type: item.metadata.type as FilterType,
        operator: item.metadata.operator as FilterOperator,
        value: item.metadata.value as string[]
      };
    });

    // Apply the filters
    setFilters(prev => [...prev, ...newFilters]);
    handleApplyAIResult(result);

    // Close dropdown and reset input
    hideDropdownWithDelay();
  }, [handleApplyAIResult, hideDropdownWithDelay, setFilters]);

  // Handle closing the command menu (for create new item)
  const handleCloseMenu = React.useCallback(() => {
    hideDropdownWithDelay();
  }, [hideDropdownWithDelay]);

  // Trigger AI request when input changes
  React.useEffect(() => {
    // Only trigger AI when:
    // 1. There's input text
    // 2. No specific view is selected (global search mode)
    // 3. Input is long enough to be meaningful
    if (commandInput && !selectedView && commandInput.length >= MIN_AI_TRIGGER_LENGTH) {
      handleAICommandRequest(commandInput);
    }
  }, [commandInput, selectedView, handleAICommandRequest]);

  const handleFilterValueSelect = React.useCallback((
    filterType: FilterType,
    value: string,
    shouldCloseDropdown: boolean = true
  ) => {
    addFilter(filterType, value);

    if (shouldCloseDropdown) {
      hideDropdownWithDelay();
    }
  }, [addFilter, hideDropdownWithDelay]);

  const handleEscape = React.useCallback(() => {
    if (selectedView) {
      resetState();
      commandInputRef.current?.focus();
      return true;
    }
    return false;
  }, [selectedView, resetState]);

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
      <pp-dropdown
        ref={dropdownRef}
        placement="bottom-start"
        onPp-hide={handleDropdownHide}
      >
        <button
          slot="trigger"
          className="button"
        >
          <Icon icon="ph:funnel-simple" className="icon" />
          <span className={filters.length ? "inclusively-hidden" : ""}>Filter</span>
        </button>

        <div>
          <AnimateChangeInHeight>
            <Command shouldFilter={false} onEscape={handleEscape}>
              <CommandInput
                placeholder={selectedView ? selectedView : "Filter..."}
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <CommandList>
                <AICommandEmpty
                  searchInput={commandInput}
                  aiState={aiState}
                  onAIRequest={handleAICommandRequest}
                  onApplyAIResult={handleApplyAIFilters}
                  onEditPrompt={handleEditPrompt}
                  onInputChange={clearResultsIfInputChanged}
                  onClose={handleCloseMenu}
                />

                {selectedView ? (
                  // Selected view mode: show options for the selected filter type
                  <SelectedViewOptions
                    filteredResults={filteredResults}
                    selectedView={selectedView}
                    onSelectValue={handleFilterValueSelect}
                  />
                ) : (
                  // Global search mode: show both filter types and filter values
                  <>
                    <FilterTypeOptions
                      filteredResults={filteredResults}
                      onSelectView={setSelectedView}
                      onClearInput={() => setCommandInput("")}
                      commandInputRef={commandInputRef}
                    />
                    <FilterValueOptions
                      filteredResults={filteredResults}
                      onSelectValue={handleFilterValueSelect}
                    />
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