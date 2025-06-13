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
import {
  createAIFilterService,
  AIState,
  AIFilterResult
} from "../../../services/ai-filter-service";
import { convertToAICommandResult } from "../../../components/filter/adapters/ai-filter-adapter";

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

  // Create AI request handler
  const handleAIRequest = React.useCallback(async (prompt: string) => {
    const result = await aiService.generateFilters({
      prompt,
      availableFilters: Object.values(FilterType),
      availableValues
    });
    return convertToAICommandResult(result);
  }, [aiService, availableValues]);

  // Use AI command hook
  const {
    aiState,
    handleAIRequest: handleAICommandRequest,
    handleApplyAIResult,
    handleEditPrompt
  } = useAICommand({
    onAIRequest: handleAIRequest
  });

  // Memoize global filter items for performance
  const globalFilterItems = React.useMemo(() => createGlobalFilterItems(), []);

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
    setTimeout(() => {
      setSelectedView(null);
      setCommandInput("");
    }, 200);
    dropdownRef.current?.hide();
  }, [handleApplyAIResult]);

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

  // Trigger AI request when input changes
  React.useEffect(() => {
    // Only trigger AI when:
    // 1. There's input text
    // 2. No specific view is selected (global search mode)
    // 3. Input is long enough to be meaningful
    if (commandInput && !selectedView && commandInput.length >= 3) {
      handleAICommandRequest(commandInput);
    }
  }, [commandInput, selectedView, handleAICommandRequest]);

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
                  onAIRequest={handleAICommandRequest}
                  onApplyAIResult={handleApplyAIFilters}
                  onEditPrompt={handleEditPrompt}
                  emptyStateMessage="Start typing to search filters..."
                  noResultsMessage="No filters found"
                  aiProcessingMessage="Analyzing filter request..."
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