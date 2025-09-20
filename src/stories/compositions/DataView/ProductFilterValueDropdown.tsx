import React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/command-menu/command';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import { useDropdownState } from '../../../components/filter/hooks/use-dropdown-state';
import { ProductFilterType, ProductFilterCategory } from './ProductFilterTypes';
import 'iconify-icon';
import '../../../components/dropdown/dropdown.ts';
import '../../../components/avatar/avatar.ts';

export interface ProductFilterValueDropdownProps {
  filterType: ProductFilterType;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
  filterCategories: ProductFilterCategory[];
}

export const ProductFilterValueDropdown: React.FC<ProductFilterValueDropdownProps> = ({
  filterType,
  filterValues,
  setFilterValues,
  filterCategories,
}) => {
  const {
    commandInput,
    setCommandInput,
    commandInputRef,
    dropdownRef,
    handleDropdownShow,
    handleDropdownHide,
    clearInputAndHide,
  } = useDropdownState();

  const currentCategory = filterCategories.find(category => category.id === filterType);
  const availableValues = currentCategory?.children || [];

  const nonSelectedFilterValues = availableValues.filter(
    (option) => !filterValues.includes(option.value)
  );

  const handleValueRemove = (value: string) => {
    setFilterValues(filterValues.filter((v) => v !== value));
    clearInputAndHide();
  };

  const handleValueAdd = (currentValue: string) => {
    setFilterValues([...filterValues, currentValue]);
    clearInputAndHide();
  };

  const getIconForValue = (value: string) => {
    const valueOption = availableValues.find(option => option.value === value);
    return valueOption?.icon || 'ph:dot';
  };

  const getDisplayName = (value: string) => {
    const valueOption = availableValues.find(option => option.value === value);
    return valueOption?.name || value;
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
          {filterValues?.slice(0, 3).map((value) => (
            <pp-avatar key={value} size="xsmall">
              <iconify-icon icon={getIconForValue(value)} />
            </pp-avatar>
          ))}
        </span>
        {filterValues?.length === 1
          ? getDisplayName(filterValues[0])
          : `${filterValues?.length} selected`}
      </button>

      <div>
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
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filterValues.map((value) => (
                  <CommandItem
                    key={value}
                    checked={true}
                    onSelect={() => handleValueRemove(value)}
                  >
                    <iconify-icon icon={getIconForValue(value)} slot="prefix" />
                    {getDisplayName(value)}
                  </CommandItem>
                ))}
              </CommandGroup>
              {nonSelectedFilterValues?.length > 0 && (
                <>
                  <CommandGroup>
                    {nonSelectedFilterValues.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.name}
                        checked={false}
                        onSelect={() => handleValueAdd(option.value)}
                      >
                        <iconify-icon icon={option.icon} slot="prefix" />
                        <span>
                          {option.name}
                        </span>
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