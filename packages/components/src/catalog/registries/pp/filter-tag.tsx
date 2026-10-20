import { useBoundProp, type ComponentContext } from '@json-render/react';
import type { Catalog, iconNames } from '../../catalog';
import type { FilterEdit } from '../../filter-edit';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../../components/combobox';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import { useDropdownState } from '../../../components/filter/hooks/use-dropdown-state';
import { useGroupFocusHandoff } from '../../behaviour/focus-handoff';
import '../../../jsx-types';

type Glyph = NonNullable<ComponentContext<Catalog, 'FilterTag'>['props']['glyphs']>[number];

// A value's picture: the person's photo or initial, or its icon in the same
// round frame, so that several overlap as an avatar group.
function ValueGlyph({
  glyph,
  iconFor,
  slot,
}: {
  glyph: Glyph;
  iconFor: (name: (typeof iconNames)[number]) => string;
  slot?: string;
}) {
  if (glyph.avatar?.image)
    return (
      <img className="avatar" data-size="xsmall" slot={slot} src={glyph.avatar.image} alt="" />
    );
  return (
    <span className="avatar" data-size="xsmall" slot={slot} aria-hidden="true">
      {glyph.avatar
        ? glyph.avatar.name.charAt(0)
        : glyph.icon && <iconify-icon icon={iconFor(glyph.icon)} />}
    </span>
  );
}

export function FilterTag({
  props,
  bindings,
  emit,
  glyph,
  iconFor,
}: ComponentContext<Catalog, 'FilterTag'> & {
  glyph: string | null;
  iconFor: (name: (typeof iconNames)[number]) => string;
}) {
  const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
  const { group } = useGroupFocusHandoff(props.focusNext);
  const {
    commandInput,
    setCommandInput,
    commandInputRef,
    dropdownRef,
    handleDropdownShow,
    handleDropdownHide,
    clearInputAndHide,
  } = useDropdownState();
  const send = (edit: FilterEdit) => {
    setEdit(edit);
    void emit('change');
  };
  const pick = (kind: FilterEdit['kind'], value: string) => {
    send({ kind, value });
    clearInputAndHide();
  };
  const unchosen = props.options.filter((option) => !props.values.includes(option));
  const glyphOf = (value: string) =>
    props.glyphs?.find((each) => each.value === value && (each.icon || each.avatar));
  const chosenGlyphs = props.values.flatMap((value) => glyphOf(value) ?? []).slice(0, 3);
  const prefix = (value: string) => {
    const found = glyphOf(value);
    return found && <ValueGlyph glyph={found} iconFor={iconFor} slot="prefix" />;
  };

  return (
    <div ref={group} className="tag-group">
      <div className="tag">
        {glyph && <iconify-icon className="icon" icon={glyph} aria-hidden="true" />}
        {props.label}
      </div>

      <pp-dropdown placement="bottom-start">
        <button type="button" data-slot="trigger" className="tag">
          {props.operator}
        </button>
        <pp-popup>
          <pp-list>
            {props.operators.map((operator) => (
              <pp-list-item
                key={operator}
                type="radio"
                checked={operator === props.operator}
                onClick={() => send({ kind: 'operator', value: operator })}
              >
                {operator}
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
                <ValueGlyph key={each.value} glyph={each} iconFor={iconFor} />
              ))}
            </span>
          )}
          {props.values.length === 1 ? props.values[0] : `${props.values.length} selected`}
        </button>
        <pp-popup>
          <div>
            <AnimateChangeInHeight>
              <Combobox>
                <ComboboxInput
                  placeholder={props.label}
                  value={commandInput}
                  onInputCapture={(event) => setCommandInput(event.currentTarget.value)}
                  ref={commandInputRef}
                />
                <ComboboxList>
                  <ComboboxEmpty>No results found.</ComboboxEmpty>
                  <ComboboxGroup>
                    {props.values.map((value) => (
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

      <button type="button" className="tag tag-group__remove" onClick={() => void emit('remove')}>
        <iconify-icon icon="ik:cross" aria-hidden="true" />
        <span className="visually-hidden">{props.removeLabel ?? 'Clear filter'}</span>
      </button>
    </div>
  );
}
