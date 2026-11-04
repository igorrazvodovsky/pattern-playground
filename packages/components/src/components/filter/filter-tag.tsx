import type { Ref } from 'react';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../combobox';
import { AnimateChangeInHeight } from './animate-change-in-height';
import { useDropdownState } from './hooks/use-dropdown-state';
import '../../jsx-types';

/** A change the actor makes to the condition, short of removing it. */
export interface FilterChange {
  kind: 'operator' | 'add' | 'remove';
  value: string;
}

/** A value's picture: an icon, or a person's photo or initial. */
export interface FilterGlyph {
  value: string;
  icon?: string | null;
  avatar?: { name: string; image?: string | null } | null;
}

export interface FilterTagProps {
  /** The attribute the condition is on. */
  label: string;
  /** The attribute's icon, as an iconify name. */
  icon?: string | null;
  operator: string;
  operators: string[];
  /** The chosen values. */
  values: string[];
  /** Every value the actor can choose from. */
  options: string[];
  glyphs?: FilterGlyph[] | null;
  removeLabel?: string | null;
  /** Set on the remove button as `data-focus-key`, for a host that hands focus to it. */
  focusKey?: string | null;
  onChange: (change: FilterChange) => void;
  onRemove: () => void;
  ref?: Ref<HTMLDivElement>;
}

// Several overlap as an avatar group, so an icon takes the same round frame.
function ValueGlyph({ glyph, slot }: { glyph: FilterGlyph; slot?: string }) {
  if (glyph.avatar?.image)
    return (
      <img className="avatar" data-size="xsmall" slot={slot} src={glyph.avatar.image} alt="" />
    );
  return (
    <span className="avatar" data-size="xsmall" slot={slot} aria-hidden="true">
      {glyph.avatar
        ? glyph.avatar.name.charAt(0)
        : glyph.icon && <iconify-icon icon={glyph.icon} />}
    </span>
  );
}

/** One condition of a filter, edited in place: attribute, operator, values, remove. */
export function FilterTag({
  label,
  icon,
  operator,
  operators,
  values,
  options,
  glyphs,
  removeLabel,
  focusKey,
  onChange,
  onRemove,
  ref,
}: FilterTagProps) {
  const {
    commandInput,
    setCommandInput,
    commandInputRef,
    dropdownRef,
    handleDropdownShow,
    handleDropdownHide,
    clearInputAndHide,
  } = useDropdownState();
  const pick = (kind: FilterChange['kind'], value: string) => {
    onChange({ kind, value });
    clearInputAndHide();
  };
  const unchosen = options.filter((option) => !values.includes(option));
  const glyphOf = (value: string) =>
    glyphs?.find((each) => each.value === value && (each.icon || each.avatar));
  const chosenGlyphs = values.flatMap((value) => glyphOf(value) ?? []).slice(0, 3);
  const prefix = (value: string) => {
    const found = glyphOf(value);
    return found && <ValueGlyph glyph={found} slot="prefix" />;
  };

  return (
    <div ref={ref} className="tag-group">
      <div className="tag">
        {icon && <iconify-icon className="icon" icon={icon} aria-hidden="true" />}
        {label}
      </div>

      <pp-dropdown placement="bottom-start">
        <button type="button" data-slot="trigger" className="tag">
          {operator}
        </button>
        <pp-popup>
          <pp-list>
            {operators.map((each) => (
              <pp-list-item
                key={each}
                type="radio"
                checked={each === operator}
                onClick={() => onChange({ kind: 'operator', value: each })}
              >
                {each}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-popup>
      </pp-dropdown>

      <pp-dropdown
        ref={dropdownRef}
        placement="bottom-start"
        onPp-show={handleDropdownShow}
        onPp-hide={handleDropdownHide}
      >
        <button type="button" data-slot="trigger" className="tag">
          {chosenGlyphs.length > 0 && (
            <span className="avatar-group">
              {chosenGlyphs.map((each) => (
                <ValueGlyph key={each.value} glyph={each} />
              ))}
            </span>
          )}
          {values.length === 1 ? values[0] : `${values.length} selected`}
        </button>
        <pp-popup>
          <div>
            <AnimateChangeInHeight>
              <Combobox>
                <ComboboxInput
                  placeholder={label}
                  value={commandInput}
                  onInputCapture={(event) => setCommandInput(event.currentTarget.value)}
                  ref={commandInputRef}
                />
                <ComboboxList>
                  <ComboboxEmpty>No results found.</ComboboxEmpty>
                  <ComboboxGroup>
                    {values.map((value) => (
                      <ComboboxItem
                        key={value}
                        value={value}
                        checked
                        onSelect={() => pick('remove', value)}
                      >
                        {prefix(value)}
                        {value}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  {unchosen.length > 0 && (
                    <ComboboxGroup>
                      {unchosen.map((value) => (
                        <ComboboxItem
                          key={value}
                          value={value}
                          checked={false}
                          onSelect={() => pick('add', value)}
                        >
                          {prefix(value)}
                          <span>{value}</span>
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  )}
                </ComboboxList>
              </Combobox>
            </AnimateChangeInHeight>
          </div>
        </pp-popup>
      </pp-dropdown>

      <button
        type="button"
        className="tag tag-group__remove"
        data-focus-key={focusKey ?? undefined}
        onClick={onRemove}
      >
        <iconify-icon icon="ik:cross" aria-hidden="true" />
        <span className="visually-hidden">{removeLabel ?? 'Clear filter'}</span>
      </button>
    </div>
  );
}
