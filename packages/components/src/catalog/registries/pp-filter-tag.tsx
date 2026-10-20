import { useBoundProp, type ComponentContext } from '@json-render/react';
import type { Catalog } from '../catalog';
import type { FilterEdit } from '../filter-edit';
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
import { useGroupFocusHandoff } from './focus-handoff';
import '../../jsx-types';

export function FilterTag({ props, bindings, emit, glyph }: ComponentContext<Catalog, 'FilterTag'> & { glyph: string | null }) {
  const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
  const { group } = useGroupFocusHandoff(props.focusNext);
  const { commandInput, setCommandInput, commandInputRef, dropdownRef, handleDropdownShow, handleDropdownHide, clearInputAndHide } =
    useDropdownState();
  const send = (edit: FilterEdit) => {
    setEdit(edit);
    void emit('change');
  };
  const pick = (kind: FilterEdit['kind'], value: string) => {
    send({ kind, value });
    clearInputAndHide();
  };
  const unchosen = props.options.filter(option => !props.values.includes(option));

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
            {props.operators.map(operator => (
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

      <pp-dropdown ref={dropdownRef} placement="bottom-start" onPp-show={handleDropdownShow} onPp-hide={handleDropdownHide}>
        <button type="button" data-slot="trigger" className="tag">
          {props.values.length === 1 ? props.values[0] : `${props.values.length} selected`}
        </button>
        <pp-popup>
          <div>
            <AnimateChangeInHeight>
              <Combobox>
                <ComboboxInput
                  placeholder={props.label}
                  value={commandInput}
                  onInputCapture={event => setCommandInput(event.currentTarget.value)}
                  ref={commandInputRef}
                />
                <ComboboxList>
                  <ComboboxEmpty>No results found.</ComboboxEmpty>
                  <ComboboxGroup>
                    {props.values.map(value => (
                      <ComboboxItem key={value} value={value} checked onSelect={() => pick('remove', value)}>
                        {value}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                  {unchosen.length > 0 && (
                    <ComboboxGroup>
                      {unchosen.map(value => (
                        <ComboboxItem key={value} value={value} checked={false} onSelect={() => pick('add', value)}>
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
        <iconify-icon icon="ph:x" aria-hidden="true" />
        <span className="visually-hidden">{props.removeLabel ?? 'Clear filter'}</span>
      </button>
    </div>
  );
}
