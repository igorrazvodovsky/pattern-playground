import { DropdownMenu } from 'radix-ui';
import { Checkmark, Plus, AddInSquare, Cross } from 'iconoteka-react';
import type { RulePart, RuleSlot } from '../../rule-parts';
import { scopedPortal } from './portal';

// The sentence slot (a word that opens a menu) that the shadcn registry's rule
// composites are built from, and the menu and popover classes every part of
// the registry shares.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

// shadcn/ui DropdownMenu content and items (radix-nova), shared by every menu
// in the registry, without the enter and exit animations, which the registry
// leaves out throughout. A checkbox or radio item takes its indicator on the
// right, in `menuIndicator`.
export const menuContent =
  'z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10';
const itemBase =
  "relative flex cursor-default items-center gap-1.5 rounded-md py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
export const menuItem = `${itemBase} px-1.5`;
export const menuCheckItem = `${itemBase} pr-8 pl-1.5`;
export const menuIndicator =
  'pointer-events-none absolute right-2 flex items-center justify-center';

// shadcn/ui Popover content (radix-nova); each use sets its own width.
export const popoverSurface =
  'z-50 flex flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden';

// shadcn/ui Command (radix-nova). The input sits in an Input Group: a muted
// field with the search icon leading. Items mark the active one with
// data-selected rather than focus.
export const commandInputWrapper = 'p-1 pb-0';
export const commandInputGroup =
  'flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input/30 bg-input/30 px-2';
export const commandInput =
  'w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';
export const commandSearchIcon = 'size-4 shrink-0 opacity-50';
export const commandList =
  'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none';
export const commandGroup =
  'overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground';
export const commandItem =
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-selected:*:[svg]:text-foreground";

// shadcn/ui Combobox (radix-nova) as a field: an Input Group with the
// trigger button at its end, and the list in a popover the anchor's width.
// shadcn builds it on Base UI; here cmdk's parts take the same classes, and
// Base UI's data-highlighted is cmdk's data-selected.
export const comboboxInputGroup =
  'group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 dark:bg-input/30';
export const comboboxInput =
  'h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-2.5 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm';
export const comboboxAddonEnd =
  'order-last flex h-auto items-center justify-center gap-2 py-1.5 pr-2 text-sm font-medium text-muted-foreground select-none has-[>button]:mr-[-0.3rem]';
export const comboboxTrigger =
  "flex size-6 items-center justify-center rounded-[calc(var(--radius)-3px)] p-0 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg:not([class*='size-'])]:size-4";
export const comboboxContent =
  'z-50 max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden';
export const comboboxList =
  'no-scrollbar max-h-[min(--spacing(72),calc(var(--radix-popover-content-available-height)-1rem))] scroll-py-1 overflow-y-auto overscroll-contain p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-muted-foreground';
export const comboboxItem =
  "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
export const comboboxIndicator =
  'pointer-events-none absolute right-2 flex size-4 items-center justify-center';
export const comboboxSeparator = '-mx-1 my-1 h-px bg-border';

// The sentence's slots: a choice is underlined wording that opens a menu.
export const slotTrigger =
  'rounded-sm underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-open:bg-muted';
// A ghost icon-xs Button.
const slotIcon =
  'mx-0.5 inline-flex size-6 items-center justify-center rounded-[min(var(--radius-md),10px)] align-middle text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-open:bg-muted data-open:text-foreground';
// An add slot with its wording shown, for a line of its own under a group: a
// ghost sm Button.
const slotAddLabelled =
  'inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-open:bg-muted data-open:text-foreground has-[>svg]:pl-1.5';

export type Send = (kind: 'change' | 'add' | 'remove', slotId: string, value: unknown) => void;

export const SentenceSlot = ({
  slot,
  send,
  labelled,
}: {
  slot: RuleSlot;
  send: Send;
  labelled?: boolean;
}) => {
  if (slot.kind === 'remove') {
    return (
      <button
        type="button"
        className={slotIcon}
        aria-label={slot.name}
        onClick={() => send('remove', slot.id, null)}
      >
        <Cross aria-hidden="true" className="size-3.5" />
      </button>
    );
  }
  const current = slot.value ?? [];
  // An add slot with a single option needs no menu: the button adds it.
  if (slot.kind === 'add' && slot.options?.length === 1) {
    const [only] = slot.options;
    return (
      <button
        type="button"
        className={labelled ? slotAddLabelled : slotIcon}
        aria-label={labelled ? undefined : slot.name}
        onClick={() => send('add', slot.id, only.value)}
      >
        <AddInSquare aria-hidden="true" className="size-3.5" />
        {labelled && slot.label}
      </button>
    );
  }
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={slot.kind === 'add' ? (labelled ? slotAddLabelled : slotIcon) : slotTrigger}
        aria-label={
          slot.kind === 'add' && !labelled
            ? slot.name
            : slot.kind === 'add'
              ? undefined
              : `${slot.name}: ${slot.label}`
        }
      >
        {slot.kind === 'add' ? (
          <>
            <Plus aria-hidden="true" className="size-3.5" />
            {labelled && slot.label}
          </>
        ) : (
          slot.label
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={scopedPortal()}>
        <DropdownMenu.Content className={menuContent} align="start" sideOffset={4}>
          {slot.kind === 'add' ? (
            slot.options?.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                className={menuItem}
                onSelect={() => send('add', slot.id, option.value)}
              >
                {option.label}
              </DropdownMenu.Item>
            ))
          ) : slot.multiple ? (
            slot.options?.map((option) => (
              <DropdownMenu.CheckboxItem
                key={option.value}
                className={menuCheckItem}
                checked={current.includes(option.value)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...current, option.value]
                    : current.filter((v) => v !== option.value);
                  // A slot never goes empty: the sentence would stop being a sentence.
                  if (next.length > 0) send('change', slot.id, next);
                }}
              >
                <span className={menuIndicator}>
                  <DropdownMenu.ItemIndicator>
                    <Checkmark aria-hidden="true" />
                  </DropdownMenu.ItemIndicator>
                </span>
                {option.label}
              </DropdownMenu.CheckboxItem>
            ))
          ) : (
            <DropdownMenu.RadioGroup
              value={current[0]}
              onValueChange={(value) => send('change', slot.id, [value])}
            >
              {slot.options?.map((option) => (
                <DropdownMenu.RadioItem
                  key={option.value}
                  value={option.value}
                  className={menuCheckItem}
                >
                  <span className={menuIndicator}>
                    <DropdownMenu.ItemIndicator>
                      <Checkmark aria-hidden="true" />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  {option.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

/** Fixed words and slots, rendered inline. */
export const Parts = ({ parts, send }: { parts: RulePart[]; send: Send }) => (
  <>
    {parts.map((part, i) =>
      typeof part === 'string' ? (
        <span key={i}>{part}</span>
      ) : (
        <SentenceSlot key={part.id} slot={part} send={send} />
      ),
    )}
  </>
);

// shadcn/ui Tooltip's content and arrow, for a note shown on pointing or focus.
export const tooltipContent =
  'z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background';
export const tooltipArrow =
  'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground';
