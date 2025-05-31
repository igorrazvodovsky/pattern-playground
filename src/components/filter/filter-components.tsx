import { useState, useRef } from "react";
import { FilterType, FilterOperator, FilterOption } from "./filter-types";
import { filterOperators, filterViewToFilterOptions } from "./filter-options";
import { FilterIcon } from "./filter-icon";
import { AnimateChangeInHeight } from "./animate-change-in-height";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command-menu/command";
import { AnimatePresence, motion } from "motion/react";
import 'iconify-icon';
import '../dropdown/dropdown.ts';
import '../list/list.ts';
import '../list-item/list-item.ts';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-dropdown': any;
      'pp-list': any;
      'pp-list-item': any;
    }
  }
}

export const FilterOperatorDropdown = ({
  filterType,
  operator,
  filterValues,
  setOperator,
}: {
  filterType: FilterType;
  operator: FilterOperator;
  filterValues: string[];
  setOperator: (operator: FilterOperator) => void;
}) => {
  const operators = filterOperators({ filterType, filterValues });

  return (
    <pp-dropdown placement="bottom-start">
      <button slot="trigger" className="tag">
        {operator}
      </button>
      <pp-list>
        {operators.map((op) => (
          <pp-list-item
            key={op}
            type="checkbox"
            checked={op === operator}
            onClick={() => setOperator(op)}
          >
            {op}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};

export const FilterValueDropdown = ({
  filterType,
  filterValues,
  setFilterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<any>(null);

  const nonSelectedFilterValues = filterViewToFilterOptions[filterType]?.filter(
    (filter) => !filterValues.includes(filter.name)
  );

  // Close other dropdowns when this one opens
  const handleDropdownShow = () => {
    // Close other dropdowns by dispatching a custom event
    document.querySelectorAll('pp-dropdown').forEach((dropdown) => {
      if (dropdown !== dropdownRef.current && dropdown.open) {
        dropdown.hide();
      }
    });
  };

  const handleDropdownHide = () => {
    setTimeout(() => {
      setCommandInput("");
    }, 200);
  };

  return (
    <pp-dropdown
      ref={dropdownRef}
      placement="bottom-start"
      onPp-show={handleDropdownShow}
      onPp-hide={handleDropdownHide}
    >
      <button
        slot="trigger"
        className="tag"
      >
        {filterType !== FilterType.PRIORITY && (
          <AnimatePresence mode="popLayout">
            {filterValues?.slice(0, 3).map((value) => (
              <motion.div
                key={value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <FilterIcon type={value as FilterType} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {filterValues?.length === 1
          ? filterValues?.[0]
          : `${filterValues?.length} selected`}
      </button>

      <div className="w-[200px] p-0">
        <AnimateChangeInHeight>
          <Command>
            <CommandInput
              placeholder={filterType}
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
              <CommandGroup>
                {filterValues.map((value) => (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      setFilterValues(filterValues.filter((v) => v !== value));
                      setTimeout(() => {
                        setCommandInput("");
                      }, 200);
                      dropdownRef.current?.hide();
                    }}
                  >
                    <input type="checkbox" checked={true} />
                    <FilterIcon type={value as FilterType} />
                    {value}
                  </CommandItem>
                ))}
              </CommandGroup>
              {nonSelectedFilterValues?.length > 0 && (
                <>
                  <hr />
                  <CommandGroup>
                    {nonSelectedFilterValues.map((filter: FilterOption) => (
                      <CommandItem
                        key={filter.name}
                        value={filter.name}
                        onSelect={(currentValue: string) => {
                          setFilterValues([...filterValues, currentValue]);
                          setTimeout(() => {
                            setCommandInput("");
                          }, 200);
                          dropdownRef.current?.hide();
                        }}
                      >
                        <input type="checkbox"
                          checked={false}
                        />
                        {filter.icon}
                        <span>
                          {filter.name}
                        </span>
                        {filter.label && (
                          <span className="text-muted-foreground text-xs ml-auto">
                            {filter.label}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </AnimateChangeInHeight>
      </div>
    </pp-dropdown>
  );
};

export const FilterValueDateCombobox = ({
  filterType,
  filterValues,
  setFilterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);
  return (
    <pp-dropdown placement="bottom-start">
      <button slot="trigger" className="tag">
        {filterValues?.[0]}
      </button>
      <pp-list>
        {filterViewToFilterOptions[filterType].map((filter: FilterOption) => (
          <pp-list-item
            key={filter.name}
            type="checkbox"
            checked={filterValues.includes(filter.name)}
            onClick={() => {
              if (filterValues.includes(filter.name)) {
                setFilterValues(filterValues.filter((v) => v !== filter.name));
              } else {
                setFilterValues([...filterValues, filter.name]);
              }
            }}
          >
            <FilterIcon type={filter.name as FilterType} />
            {filter.name}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};

