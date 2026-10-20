import { useState } from 'react';
import { useBoundProp, type ComponentContext } from '@json-render/react';
import { DropdownMenu, Popover } from 'radix-ui';
import { Command } from 'cmdk';
import { Check, Search, X, type LucideIcon } from 'lucide-react';
import type { Catalog } from '../catalog';
import type { FilterEdit } from '../filter-edit';
import { useGroupFocusHandoff } from './focus-handoff';
import { scopedPortal } from './shadcn-portal';

// shadcn has no filter chip, so its segments are joined as shadcn's Button
// Group joins buttons.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

const segment =
  'inline-flex h-7 items-center gap-1 px-2 text-xs font-medium whitespace-nowrap outline-none transition-[color,box-shadow] focus-visible:relative focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-ring/50';
const pressable = 'cursor-pointer hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent';
const menuContent =
  'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md';
const item =
  'relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground';
const indicator = 'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center';

export function FilterTag({ props, bindings, emit, Glyph }: ComponentContext<Catalog, 'FilterTag'> & { Glyph: LucideIcon | null }) {
  const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
  const { group, parts: [operatorList, valueList] } = useGroupFocusHandoff(props.focusNext, 2);
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
  const unchosen = props.options.filter(option => !props.values.includes(option));

  return (
    <div ref={group} className="inline-flex items-stretch divide-x overflow-visible rounded-md border bg-background text-foreground shadow-xs">
      <span className={`${segment} text-muted-foreground [&>svg]:size-3.5`}>
        {Glyph && <Glyph aria-hidden="true" />}
        {props.label}
      </span>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className={`${segment} ${pressable}`}>{props.operator}</DropdownMenu.Trigger>
        <DropdownMenu.Portal container={scopedPortal()}>
          <DropdownMenu.Content ref={operatorList} align="start" sideOffset={4} className={menuContent}>
            {props.operators.map(operator => (
              <DropdownMenu.CheckboxItem
                key={operator}
                role="menuitemradio"
                checked={operator === props.operator}
                onSelect={() => send({ kind: 'operator', value: operator })}
                className={item}
              >
                <span className={indicator}>
                  <DropdownMenu.ItemIndicator>
                    <Check aria-hidden="true" className="size-4" />
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
        onOpenChange={next => {
          setOpen(next);
          if (!next) setSearch('');
        }}
      >
        <Popover.Trigger className={`${segment} ${pressable}`}>
          {props.values.length === 1 ? props.values[0] : `${props.values.length} selected`}
        </Popover.Trigger>
        <Popover.Portal container={scopedPortal()}>
          <Popover.Content ref={valueList} align="start" sideOffset={4} className="z-50 w-56 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-hidden">
            <Command label={props.label} className="flex flex-col overflow-hidden">
              <div className="flex h-9 items-center gap-2 border-b px-3">
                <Search aria-hidden="true" className="size-4 shrink-0 opacity-50" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder={props.label}
                  className="flex h-10 w-full bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground"
                />
              </div>
              <Command.List className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
                <Command.Group className="p-1">
                  {props.values.map(value => (
                    <Command.Item key={value} value={value} onSelect={() => pick('remove', value)} className={item}>
                      <span className={indicator}>
                        <Check aria-hidden="true" className="size-4" />
                      </span>
                      {value}
                    </Command.Item>
                  ))}
                </Command.Group>
                {unchosen.length > 0 && (
                  <Command.Group className="border-t p-1">
                    {unchosen.map(value => (
                      <Command.Item key={value} value={value} onSelect={() => pick('add', value)} className={item}>
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
        onClick={() => void emit('remove')}
        className={`${segment} ${pressable} px-1.5 text-muted-foreground [&>svg]:size-3.5`}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
