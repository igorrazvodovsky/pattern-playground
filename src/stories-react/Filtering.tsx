import {
  Command,
  CommandEmpty,
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
import { filterViewOptions, filterViewToFilterOptions } from "../components/filter/filter-options";
import type { Filter, FilterOption } from "../components/filter/filter-types";
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import '../components/dropdown/dropdown.ts';
import 'iconify-icon';

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

  const handleDropdownHide = () => {
    setTimeout(() => {
      setSelectedView(null);
      setCommandInput("");
    }, 200);
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
          {!filters.length && "Filter"}
        </button>

        <div className="w-[200px] p-0">
          <AnimateChangeInHeight>
            <Command>
              <CommandInput
                placeholder={selectedView ? selectedView : "Filter..."}
                className="h-9"
                value={commandInput}
                onInputCapture={(e) => {
                  setCommandInput(e.currentTarget.value);
                }}
                ref={commandInputRef}
              />
              <hr />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {selectedView ? (
                  <CommandGroup>
                    {filterViewToFilterOptions[selectedView].map(
                      (filter: FilterOption) => (
                        <CommandItem
                          className="group text-muted-foreground flex gap-2 items-center"
                          key={filter.name}
                          value={filter.name}
                          onSelect={(currentValue) => {
                            setFilters((prev) => [
                              ...prev,
                              {
                                id: nanoid(),
                                type: selectedView,
                                operator:
                                  selectedView === FilterType.DUE_DATE &&
                                  currentValue !== DueDate.IN_THE_PAST
                                    ? FilterOperator.BEFORE
                                    : FilterOperator.IS,
                                value: [currentValue],
                              },
                            ]);
                            setTimeout(() => {
                              setSelectedView(null);
                              setCommandInput("");
                            }, 200);
                            dropdownRef.current?.hide();
                          }}
                        >
                          <Slot slot="prefix">
                            {filter.icon}
                          </Slot>
                          <span className="text-accent-foreground">
                            {filter.name}
                          </span>
                          {filter.label && (
                            <span slot="suffix" className="text-muted-foreground text-xs ml-auto">
                              {filter.label}
                            </span>
                          )}
                        </CommandItem>
                      )
                    )}
                  </CommandGroup>
                ) : (
                  filterViewOptions.map(
                    (group: FilterOption[], index: number) => (
                      <React.Fragment key={index}>
                        <CommandGroup>
                          {group.map((filter: FilterOption) => (
                            <CommandItem
                              className="group text-muted-foreground flex gap-2 items-center"
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
                              <span className="text-accent-foreground">
                                {filter.name}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>

                      </React.Fragment>
                    )
                  )
                )}
              </CommandList>
            </Command>
          </AnimateChangeInHeight>
        </div>
      </pp-dropdown>
    </div>
  );
}