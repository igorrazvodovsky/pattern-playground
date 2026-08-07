import React from "react";
import type { EntityBinding, FilterOperator } from "@shared/data/bindings";
import { taskBinding, findAttribute, filterOperatorsFor } from "@shared/data/bindings";
import { filterValueOptions, FilterOption } from "./filter-options";
import { AnimateChangeInHeight } from "./animate-change-in-height";
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

export const FilterOperatorDropdown = ({
  path,
  operator,
  filterValues,
  setOperator,
  binding = taskBinding,
}: {
  path: string;
  operator: FilterOperator;
  filterValues: string[];
  setOperator: (operator: FilterOperator) => void;
  binding?: EntityBinding;
}) => {
  const operators = filterOperatorsFor(findAttribute(binding, path), filterValues);

  return (
    <pp-dropdown placement="bottom-start">
      <button data-slot="trigger" className="tag">
        {operator}
      </button>
      <pp-popup>
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
      </pp-popup>
    </pp-dropdown>
  );
};

export const FilterValueDropdown = ({
  path,
  filterValues,
  setFilterValues,
}: {
  path: string;
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

  const options = filterValueOptions[path] ?? [];
  const nonSelectedFilterValues = options.filter(
    (option) => !filterValues.includes(option.name)
  );

  const iconFor = (value: string): string | undefined =>
    options.find((option) => option.name === value)?.icon;

  // Values only get avatars when the data behind them carries icons.
  const hasValueIcons = filterValues.some((value) => iconFor(value));

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
        data-slot="trigger"
        className="tag"
      >
        {hasValueIcons && (
          <span className="avatar-group">
            {filterValues?.slice(0, 3).map((value) => {
              const icon = iconFor(value);
              return icon ? (
                <span key={value} className="avatar" data-size="xsmall">
                  <iconify-icon icon={icon} />
                </span>
              ) : null;
            })}
          </span>
        )}
        {filterValues?.length === 1
          ? filterValues?.[0]
          : `${filterValues?.length} selected`}
      </button>

      <pp-popup>
        <div>
          <AnimateChangeInHeight>
            <Combobox>
              <ComboboxInput
                placeholder={path}
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
                      {iconFor(value) && (
                        <iconify-icon icon={iconFor(value)} slot="prefix" />
                      )}
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
                          {filter.icon && <iconify-icon icon={filter.icon} slot="prefix" />}
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
      </pp-popup>
    </pp-dropdown>
  );
};

export const FilterValueDateDropdown = ({
  path,
  filterValues,
  setFilterValues,
}: {
  path: string;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
}) => {
  const options = filterValueOptions[path] ?? [];
  return (
    <pp-dropdown placement="bottom-start">
      <button data-slot="trigger" className="tag">
        {filterValues?.[0]}
      </button>
      <pp-popup>
        <pp-list>
          {options.map((filter: FilterOption) => (
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
              {filter.icon && <iconify-icon icon={filter.icon} data-slot="prefix"></iconify-icon>}
              {filter.name}
            </pp-list-item>
          ))}
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  );
};
