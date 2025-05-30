import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "../components/filter/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/filter/popover";
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

export function FilteringDemo({
  initialFilters = [],
}: {
  initialFilters?: Filter[];
} = {}) {
  const [open, setOpen] = React.useState(false);
  const [selectedView, setSelectedView] = React.useState<FilterType | null>(
    null
  );
  const [commandInput, setCommandInput] = React.useState("");
  const commandInputRef = React.useRef<HTMLInputElement>(null);
  const [filters, setFilters] = React.useState<Filter[]>(initialFilters);

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
      <Popover
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setTimeout(() => {
              setSelectedView(null);
              setCommandInput("");
            }, 200);
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="button"
          >
            <Icon icon="ph:funnel-simple" className="icon" />
            {!filters.length ? "Filter" : <span className="inclusively-hidden">Close</span>}

          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
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
                            setOpen(false);
                          }}
                        >
                          {filter.icon}
                          <span className="text-accent-foreground">
                            {filter.name}
                          </span>
                          {filter.label && (
                            <span className="text-muted-foreground text-xs ml-auto">
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
                              {filter.icon}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}