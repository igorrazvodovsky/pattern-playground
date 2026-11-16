import { useState } from 'react';
import { useBoundProp, type ComponentContext } from '@json-render/react';
import { DropdownMenu, Popover } from 'radix-ui';
import { Command } from 'cmdk';
import { Checkmark, Search, Cross, type IconComponent } from 'iconoteka-react';
import type { Catalog, iconNames } from '../../catalog';
import type { FilterEdit } from '../../filter-edit';
import { useGroupFocusHandoff } from '../../behaviour/focus-handoff';
import {
  commandGroup,
  commandInput,
  commandInputGroup,
  commandInputWrapper,
  commandItem,
  commandList,
  commandSearchIcon,
  menuCheckItem,
  menuContent,
  menuIndicator,
  popoverSurface,
} from './parts';
import { cn } from './cn';
import { scopedPortal } from './portal';

// shadcn has no filter chip, so its segments are joined as shadcn's Button
// Group joins sm buttons (radix-nova).
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

const segment =
  'inline-flex h-7 items-center gap-1 px-2.5 text-[0.8rem] font-medium whitespace-nowrap outline-none transition-all select-none focus-visible:relative focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/50';
const pressable =
  'cursor-pointer hover:bg-muted hover:text-foreground data-open:bg-muted data-open:text-foreground';
// A Command item with room for the tick on the right.
const valueItem = cn(commandItem, 'pr-8');

type ValueGlyphData = NonNullable<
  ComponentContext<Catalog, 'FilterTag'>['props']['glyphs']
>[number];
type IconFor = (name: (typeof iconNames)[number]) => IconComponent;

// A value's picture, as shadcn's Avatar draws one: the photo, or the
// initial on a muted disc; an icon stands in the same frame.
function ValueGlyph({ glyph, iconFor }: { glyph: ValueGlyphData; iconFor: IconFor }) {
  const frame =
    'flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-background';
  if (glyph.avatar?.image)
    return <img className={`${frame} object-cover`} src={glyph.avatar.image} alt="" />;
  if (glyph.avatar)
    return (
      <span
        aria-hidden="true"
        className={`${frame} bg-muted text-[0.625rem] text-muted-foreground`}
      >
        {glyph.avatar.name.charAt(0)}
      </span>
    );
  const Icon = glyph.icon ? iconFor(glyph.icon) : null;
  return (
    Icon && (
      <span aria-hidden="true" className={frame}>
        <Icon className="size-3.5 text-muted-foreground" />
      </span>
    )
  );
}

export function FilterTag({
  props,
  bindings,
  emit,
  Glyph,
  iconFor,
}: ComponentContext<Catalog, 'FilterTag'> & { Glyph: IconComponent | null; iconFor: IconFor }) {
  const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
  const {
    group,
    parts: [operatorList, valueList],
  } = useGroupFocusHandoff(props.focusNext, 2);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const send = (edit: FilterEdit) => {
    setEdit(edit);
    void emit('change');
  };
  const pick = (kind: FilterEdit['kind'], value: string) => {
    send({ kind, value });
    setOpen(false);
    setSearch('');
  };
  const unchosen = props.options.filter((option) => !props.values.includes(option));
  const glyphOf = (value: string) =>
    props.glyphs?.find((each) => each.value === value && (each.icon || each.avatar));
  const chosenGlyphs = props.values.flatMap((value) => glyphOf(value) ?? []).slice(0, 3);
  const prefix = (value: string) => {
    const found = glyphOf(value);
    return found && <ValueGlyph glyph={found} iconFor={iconFor} />;
  };

  return (
    <div
      ref={group}
      className="inline-flex items-stretch divide-x overflow-visible rounded-lg border bg-background text-foreground dark:border-input dark:bg-input/30"
    >
      <span className={`${segment} text-muted-foreground [&>svg]:size-3.5`}>
        {Glyph && <Glyph aria-hidden="true" />}
        {props.label}
      </span>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={`${segment} ${pressable}`}>
          {props.operator}
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal container={scopedPortal()}>
          <DropdownMenu.Content
            ref={operatorList}
            align="start"
            sideOffset={4}
            className={menuContent}
          >
            {props.operators.map((operator) => (
              <DropdownMenu.CheckboxItem
                key={operator}
                role="menuitemradio"
                checked={operator === props.operator}
                onSelect={() => send({ kind: 'operator', value: operator })}
                className={menuCheckItem}
              >
                <span className={menuIndicator}>
                  <DropdownMenu.ItemIndicator>
                    <Checkmark aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </span>
                {operator}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch('');
        }}
      >
        <Popover.Trigger className={`${segment} ${pressable}`}>
          {chosenGlyphs.length > 0 && (
            <span className="flex -space-x-1">
              {chosenGlyphs.map((each) => (
                <ValueGlyph key={each.value} glyph={each} iconFor={iconFor} />
              ))}
            </span>
          )}
          {props.values.length === 1 ? props.values[0] : `${props.values.length} selected`}
        </Popover.Trigger>
        <Popover.Portal container={scopedPortal()}>
          <Popover.Content
            ref={valueList}
            align="start"
            sideOffset={4}
            className={cn(popoverSurface, 'w-56 p-0')}
          >
            <Command label={props.label} className="flex flex-col overflow-hidden">
              <div className={commandInputWrapper}>
                <div className={commandInputGroup}>
                  <Search aria-hidden="true" className={commandSearchIcon} />
                  <Command.Input
                    value={search}
                    onValueChange={setSearch}
                    placeholder={props.label}
                    className={commandInput}
                  />
                </div>
              </div>
              <Command.List className={commandList}>
                <Command.Empty className="py-6 text-center text-sm">
                  No results found.
                </Command.Empty>
                <Command.Group className={commandGroup}>
                  {props.values.map((value) => (
                    <Command.Item
                      key={value}
                      value={value}
                      onSelect={() => pick('remove', value)}
                      className={valueItem}
                    >
                      {prefix(value)}
                      {value}
                      <span className={menuIndicator}>
                        <Checkmark aria-hidden="true" />
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
                {unchosen.length > 0 && (
                  <Command.Group className={`${commandGroup} border-t`}>
                    {unchosen.map((value) => (
                      <Command.Item
                        key={value}
                        value={value}
                        onSelect={() => pick('add', value)}
                        className={valueItem}
                      >
                        {prefix(value)}
                        {value}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <button
        type="button"
        aria-label={props.removeLabel ?? 'Clear filter'}
        data-focus-key={props.focusKey ?? undefined}
        onClick={() => void emit('remove')}
        className={cn(segment, pressable, 'px-1.5 text-muted-foreground [&>svg]:size-3.5')}
      >
        <Cross aria-hidden="true" />
      </button>
    </div>
  );
}
