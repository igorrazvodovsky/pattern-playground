import React from 'react';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../components/combobox';
import { AnimateChangeInHeight } from '../../components/filter/animate-change-in-height';
import { useDropdownState } from '../../components/filter/hooks/use-dropdown-state';
import { FilterCategory } from './FilterCategories';
import 'iconify-icon';
import '../../components/dropdown/dropdown.ts';

export interface ProductFilterValueDropdownProps {
  path: string;
  filterValues: string[];
  setFilterValues: (filterValues: string[]) => void;
  filterCategories: FilterCategory[];
}

export const ProductFilterValueDropdown: React.FC<ProductFilterValueDropdownProps> = ({
  path,
  filterValues,
  setFilterValues,
  filterCategories,
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

  const currentCategory = filterCategories.find(category => category.id === path);
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

  const getIconForValue = (value: string): string | undefined =>
    availableValues.find(option => option.value === value)?.icon;

  // Values only get avatars when the data behind them carries icons; otherwise
  // the trigger is the value text alone.
  const hasValueIcons = filterValues.some((value) => getIconForValue(value));

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
        data-slot="trigger"
        className="tag"
      >
        {hasValueIcons && (
          <span className="avatar-group">
            {filterValues?.slice(0, 3).map((value) => {
              const icon = getIconForValue(value);
              return icon ? (
                <pp-avatar key={value} size="xsmall">
                  <iconify-icon icon={icon} />
                </pp-avatar>
              ) : null;
            })}
          </span>
        )}
        {filterValues?.length === 1
          ? getDisplayName(filterValues[0])
          : `${filterValues?.length} selected`}
      </button>

      <pp-popup>
        <div>
          <AnimateChangeInHeight>
            <Combobox>
              <ComboboxInput
                placeholder={currentCategory?.name ?? path}
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
                      {getIconForValue(value) && (
                        <iconify-icon icon={getIconForValue(value)} slot="prefix" />
                      )}
                      {getDisplayName(value)}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
                {nonSelectedFilterValues?.length > 0 && (
                  <>
                    <ComboboxGroup>
                      {nonSelectedFilterValues.map((option) => (
                        <ComboboxItem
                          key={option.value}
                          value={option.name}
                          checked={false}
                          onSelect={() => handleValueAdd(option.value)}
                        >
                          {option.icon && <iconify-icon icon={option.icon} slot="prefix" />}
                          <span>
                            {option.name}
                          </span>
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
