import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../components/filter/command";
import { nanoid } from "nanoid";
import * as React from "react";
import { AnimateChangeInHeight } from "../components/filter/animate-change-in-height";
import Filters from "../components/filter/filters";
import {
  DueDate,
  FilterOperator,
  FilterType,
} from "../components/filter/filter-types";
import {
  filterViewToFilterOptions,
  createGlobalFilterItems,
  getFilteredResults,
  type SearchableFilterItem
} from "../components/filter/filter-options";
import type { Filter, FilterOption } from "../components/filter/filter-types";
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import '../components/dropdown/dropdown.ts';
import 'iconify-icon';

// Add these imports for AI functionality
import { AICommandEmpty } from "../components/filter/ai-command-empty";
import {
  createAIFilterService,
  AIState,
  AIFilterResult
} from "../services/ai-filter-service";
import { debounce } from "lodash";

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-dropdown': any;
      'iconify-icon': any;
    }
  }
}

export function FilteringDemo({
  initialFilters = [],
}: {
  initialFilters?: Filter[];
} = {}) {
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(
    null
  );
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>(initialFilters);
  const dropdownRef = React.useRef<any>(null);

  // Add AI-related state
  const [aiState, setAIState] = React.useState<AIState>({
    isProcessing: false,
    hasUnresolvedQuery: false
  });

  // Create AI service instance
  const aiService = React.useMemo(() => createAIFilterService(), []);

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

  // Create a stable AI request function
  const makeAIRequest = React.useCallback(async (prompt: string) => {
    if (prompt.length < 5) return;

    setAIState(prev => ({
      ...prev,
      isProcessing: true,
      error: undefined
    }));

    try {
      const result = await aiService.generateFilters({
        prompt,
        availableFilters: Object.values(FilterType),
        availableValues
      });

      setAIState(prev => ({
        ...prev,
        isProcessing: false,
        result,
        hasUnresolvedQuery: true
      }));
    } catch (error) {
      setAIState(prev => ({
        ...prev,
        isProcessing: false,
        error: (error as Error).message
      }));
    }
  }, [aiService, availableValues]);

  // Debounced AI request function - create once and never recreate
  const debouncedAIRequest = React.useMemo(
    () => debounce(makeAIRequest, 1500),
    [makeAIRequest]
  );

  // Handle AI request
  const handleAIRequest = React.useCallback((prompt: string) => {
    debouncedAIRequest(prompt);
  }, [debouncedAIRequest]);

  // Memoize global filter items for performance
  const globalFilterItems = React.useMemo(() => createGlobalFilterItems(), []);

  // Handle applying AI-generated filters
  const handleApplyAIFilters = React.useCallback((result: AIFilterResult) => {
    setFilters(prev => [...prev, ...result.suggestedFilters]);
    setAIState(prev => ({
      ...prev,
      hasUnresolvedQuery: false,
      result: undefined
    }));

    // Close dropdown and reset input
    setTimeout(() => {
      setSelectedView(null);
      setCommandInput("");
    }, 200);
    dropdownRef.current?.hide();
  }, []);

  // Handle edit prompt action
  const handleEditPrompt = React.useCallback(() => {
    // Keep the command menu open and focus on input for editing
    commandInputRef.current?.focus();
    setAIState(prev => ({
      ...prev,
      hasUnresolvedQuery: false,
      result: undefined
    }));
  }, []);

  // Get filtered results based on current search term and view state
  const filteredResults = React.useMemo(() => {
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

  // Trigger AI request when input changes - SAFE VERSION
  React.useEffect(() => {
    // Only trigger AI when:
    // 1. There's input text
    // 2. No specific view is selected (global search mode)
    // 3. Input is long enough to be meaningful
    if (commandInput && !selectedView && commandInput.length >= 3) {
      debouncedAIRequest(commandInput);
    }

    // Clean up AI state when input is cleared or view is selected
    if (!commandInput || selectedView) {
      setAIState(prev => ({
        ...prev,
        hasUnresolvedQuery: false,
        result: undefined
      }));
    }
  }, [commandInput, selectedView]); // Only these two dependencies - no function dependencies

  const handleDropdownHide = () => {
    setTimeout(() => {
      setSelectedView(null);
      setCommandInput("");
    }, 200);
  };

  const handleFilterValueSelect = (
    filterType: FilterType,
    value: string,
    shouldCloseDropdown: boolean = true
  ) => {
    setFilters((prev) => [
      ...prev,
      {
        id: nanoid(),
        type: filterType,
        operator:
          filterType === FilterType.DUE_DATE && value !== DueDate.IN_THE_PAST
            ? FilterOperator.BEFORE
            : FilterOperator.IS,
        value: [value],
      },
    ]);

    if (shouldCloseDropdown) {
      setTimeout(() => {
        setSelectedView(null);
        setCommandInput("");
      }, 200);
      dropdownRef.current?.hide();
    }
  };

  const handleEscape = () => {
    if (selectedView) {
      setSelectedView(null);
      setCommandInput("");
      commandInputRef.current?.focus();
      return true;
    }
    return false;
  };

  return (
    <div className="flex">
      <Filters filters={filters} setFilters={setFilters} />
      {filters.filter((filter) => filter.value?.length > 0).length > 0 && (
        <button
          className="button"
          onClick={() => setFilters([])}
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
                  onAIRequest={handleAIRequest}
                  onApplyAIFilters={handleApplyAIFilters}
                  onEditPrompt={handleEditPrompt}
                />

                {selectedView ? (
                  // Selected view mode: show options for the selected filter type
                  <CommandGroup>
                    {('viewOptions' in filteredResults && filteredResults.viewOptions) && filteredResults.viewOptions.map((filter: FilterOption) => (
                      <CommandItem
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue) => {
                          handleFilterValueSelect(selectedView, currentValue);
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
                ) : (
                  // Global search mode: show both filter types and filter values
                  <>
                    {/* Filter Types */}
                    {filteredResults.filterTypes.map(
                      (group: FilterOption[], index: number) => (
                        <React.Fragment key={`filter-types-${index}`}>
                          <CommandGroup>
                            {group.map((filter: FilterOption) => (
                              <CommandItem
                                key={filter.name}
                                value={filter.name}
                                onSelect={(currentValue) => {
                                  setSelectedView(currentValue as FilterType);
                                  setCommandInput("");
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

                    {/* Filter Values (Cross-filter search results) */}
                    {filteredResults.filterValues.length > 0 && (
                      <CommandGroup>
                        {filteredResults.filterValues.map((item: SearchableFilterItem) => (
                          <CommandItem
                            key={`${item.type}-${item.value}`}
                            value={`${item.type} ${item.value}`}
                            onSelect={() => {
                              handleFilterValueSelect(item.type, item.value);
                            }}
                          >
                            <Slot slot="prefix">
                              {item.typeIcon}
                            </Slot>
                            <span>
                              {/* {item.type} / */}
                              {item.value}
                            </span>

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