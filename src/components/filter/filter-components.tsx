import React from "react";
import { FilterType, FilterOperator, FilterOption } from "./filter-types";
import { filterOperators, filterViewToFilterOptions } from "./filter-options";
import { FilterIcon } from "./filter-options-icons";
import { AnimateChangeInHeight } from "./animate-change-in-height";
import { Slot } from "@radix-ui/react-slot";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../combobox";
import { useDropdownState } from "./hooks/use-dropdown-state";
import 'iconify-icon';
import '../dropdown/dropdown.ts';
import '../list/list.ts';
import '../list-item/list-item.ts';
import '../avatar/avatar.ts'

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
  const {
    commandInput,
    setComboboxInput,
    commandInputRef,
    dropdownRef,
    handleDropdownShow,
    handleDropdownHide,
    clearInputAndHide,
  } = useDropdownState();

  const nonSelectedFilterValues = filterViewToFilterOptions[filterType]?.filter(
    (filter) => !filterValues.includes(filter.name)
  );

  const handleValueRemove = (value: string) => {
    setFilterValues(filterValues.filter((v) => v !== value));
    clearInputAndHide();
  };

  const handleValueAdd = (currentValue: string) => {
    setFilterValues([...filterValues, currentValue]);
    clearInputAndHide();
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
        <span className="avatar-group">
          {filterType !== FilterType.PRIORITY && (
            filterValues?.slice(0, 3).map((value) => (
              <pp-avatar key={value} size="xsmall">
                <FilterIcon type={value as FilterType} />
              </pp-avatar>
            ))
          )}
        </span>
        {filterValues?.length === 1
          ? filterValues?.[0]
          : `${filterValues?.length} selected`}
      </button>

      <div>
        <AnimateChangeInHeight>
          <Combobox>
            <ComboboxInput
              placeholder={filterType}
              className="h-9"
              value={commandInput}
              onInputCapture={(e) => {
                setComboboxInput(e.currentTarget.value);
              }}
              ref={commandInputRef}
            />
            <ComboboxList>
              <ComboboxEmpty>No results found.</ComboboxEmpty>
              <ComboboxGroup>
                {filterValues.map((value) => (
                  <ComboboxItem
                    key={value}
                    checked={true}
                    onSelect={() => handleValueRemove(value)}
                  >
                    <FilterIcon type={value as FilterType} slot="prefix" />
                    {value}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
              {nonSelectedFilterValues?.length > 0 && (
                <>
                  <ComboboxGroup>
                    {nonSelectedFilterValues.map((filter: FilterOption) => (
                      <ComboboxItem
                        key={filter.name}
                        value={filter.name}
                        checked={false}
                        onSelect={(currentValue: string) => handleValueAdd(currentValue)}
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
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </>
              )}
            </ComboboxList>
          </Combobox>
        </AnimateChangeInHeight>
      </div>
    </pp-dropdown>
  );
};

export const FilterValueDateDropdown = ({
  filterType,
  filterValues,
  setFilterValues,
}: {
  filterType: FilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
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
            <iconify-icon icon={filter.name} slot="prefix"></iconify-icon>
            {filter.name}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-dropdown>
  );
};

