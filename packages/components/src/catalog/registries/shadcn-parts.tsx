import { DropdownMenu } from 'radix-ui';
import { Check, Plus, SquarePlus, X } from 'lucide-react';
import type { RulePart, RuleSlot } from '../rule-parts';
import { scopedPortal } from './shadcn-portal';

// The sentence slot (a word that opens a menu) that the shadcn registry's rule
// composites are built from, with shadcn's menu classes.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

// shadcn/ui DropdownMenu content and item (new-york, v4).
const menuContent =
  'z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md';
const menuItem =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const menuIndicator = 'pointer-events-none absolute left-2 flex size-3.5 items-center justify-center';

// The sentence's slots: a choice is underlined wording that opens a menu.
const slotTrigger =
  'rounded-sm underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent';
const slotIcon =
  'mx-0.5 inline-flex size-6 items-center justify-center rounded-md align-middle text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent';
// An add slot with its wording shown, for a line of its own under a group.
const slotAddLabelled =
  'inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=open]:bg-accent';

export type Send = (kind: 'change' | 'add' | 'remove', slotId: string, value: unknown) => void;

export const SentenceSlot = ({ slot, send, labelled }: { slot: RuleSlot; send: Send; labelled?: boolean }) => {
  if (slot.kind === 'remove') {
    return (
      <button type="button" className={slotIcon} aria-label={slot.name} onClick={() => send('remove', slot.id, null)}>
        <X aria-hidden="true" className="size-3.5" />
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
        <SquarePlus aria-hidden="true" className="size-3.5" />
        {labelled && slot.label}
      </button>
    );
  }
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={slot.kind === 'add' ? (labelled ? slotAddLabelled : slotIcon) : slotTrigger}
        aria-label={slot.kind === 'add' && !labelled ? slot.name : slot.kind === 'add' ? undefined : `${slot.name}: ${slot.label}`}
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
          {slot.kind === 'add'
            ? slot.options?.map(option => (
                <DropdownMenu.Item key={option.value} className={menuItem} onSelect={() => send('add', slot.id, option.value)}>
                  {option.label}
                </DropdownMenu.Item>
              ))
            : slot.multiple
              ? slot.options?.map(option => (
                  <DropdownMenu.CheckboxItem
                    key={option.value}
                    className={menuItem}
                    checked={current.includes(option.value)}
                    onSelect={event => event.preventDefault()}
                    onCheckedChange={checked => {
                      const next = checked ? [...current, option.value] : current.filter(v => v !== option.value);
                      // A slot never goes empty: the sentence would stop being a sentence.
                      if (next.length > 0) send('change', slot.id, next);
                    }}
                  >
                    <span className={menuIndicator}>
                      <DropdownMenu.ItemIndicator><Check aria-hidden="true" /></DropdownMenu.ItemIndicator>
                    </span>
                    {option.label}
                  </DropdownMenu.CheckboxItem>
                ))
              : (
                <DropdownMenu.RadioGroup value={current[0]} onValueChange={value => send('change', slot.id, [value])}>
                  {slot.options?.map(option => (
                    <DropdownMenu.RadioItem key={option.value} value={option.value} className={menuItem}>
                      <span className={menuIndicator}>
                        <DropdownMenu.ItemIndicator><Check aria-hidden="true" /></DropdownMenu.ItemIndicator>
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
      typeof part === 'string' ? <span key={i}>{part}</span> : <SentenceSlot key={part.id} slot={part} send={send} />,
    )}
  </>
);
