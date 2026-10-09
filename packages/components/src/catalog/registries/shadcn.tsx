import type { CSSProperties } from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { Dialog, DropdownMenu } from 'radix-ui';
import { shadcnComponents } from '@json-render/shadcn';
import clsx from 'clsx';
import { Check, History, Plus, Trash2, X } from 'lucide-react';
import { catalog, actionsSuppliedBySpecs, type iconNames } from '../catalog';
import type { RulePart, RuleSlot } from '../../components/rule-sentence';
import sheetUrl from '../shadcn.generated.css?url';

// The catalog rendered with shadcn/ui, through @json-render/shadcn. Where the
// kit's component props line up with a catalog type, the kit renders it (Card,
// Stack, Badge, Checkbox). Where they do not, this file builds the type from
// shadcn's own class lists, which is how shadcn is meant to be used: its
// components are copied into a project, not imported. The kit's wrappers have
// no icon button, no ghost button and no list, and its primitives are not
// exported.
//
// The stylesheet is linked by URL, not imported as a module: Astro hoists CSS
// imported anywhere under a client script into every page's <head>, which
// would load Tailwind on pages that never render a shadcn demo. Callers await
// `stylesheet` before rendering so the first frame is styled.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source. Rebuild the sheet after changing classes:
//   npm run build:shadcn-css

const loadStylesheet = (href: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(`link[data-registry-sheet="shadcn"]`);
    if (existing) return resolve();
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href });
    link.dataset.registrySheet = 'shadcn';
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => reject(new Error(`could not load ${href}`)));
    document.head.append(link);
  });

export const stylesheet = loadStylesheet(sheetUrl);

// Radix portals overlays to <body>, outside the demo and so outside the
// [data-registry="shadcn"] scope the sheet is limited to. Overlays portal into
// a body-level container that carries the scope attribute instead.
let portalRoot: HTMLElement | null = null;
const scopedPortal = () => {
  if (!portalRoot?.isConnected) {
    portalRoot = Object.assign(document.createElement('div'), { className: 'spec-demo-portal' });
    portalRoot.dataset.registry = 'shadcn';
    document.body.append(portalRoot);
  }
  return portalRoot;
};

const { Stack: KitStack, Card: KitCard, Badge: KitBadge, Checkbox: KitCheckbox } = shadcnComponents;

const gap = { none: 'none', s: 'sm', m: 'md', l: 'lg' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;

const icons: Record<(typeof iconNames)[number], typeof X> = {
  cancel: X,
  delete: Trash2,
  'delete-confirm': Trash2,
  history: History,
};

// shadcn/ui Button (new-york, v4), variants and sizes as published.
const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const buttonVariant = {
  default: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  primary: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
  plain: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
} as const;
const buttonSize = { default: 'h-9 px-4 py-2 has-[>svg]:px-3', icon: 'size-9' } as const;

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

type Send = (kind: 'change' | 'add' | 'remove', slotId: string, value: unknown) => void;

const SentenceSlot = ({ slot, send }: { slot: RuleSlot; send: Send }) => {
  if (slot.kind === 'remove') {
    return (
      <button type="button" className={slotIcon} aria-label={slot.name} onClick={() => send('remove', slot.id, null)}>
        <X aria-hidden="true" className="size-3.5" />
      </button>
    );
  }
  const current = slot.value ?? [];
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        className={slot.kind === 'add' ? slotIcon : slotTrigger}
        aria-label={slot.kind === 'add' ? slot.name : `${slot.name}: ${slot.label}`}
      >
        {slot.kind === 'add' ? <Plus aria-hidden="true" className="size-3.5" /> : slot.label}
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

export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children, ...context }) => {
      if (props.align === 'baseline') {
        return <div className="flex flex-row flex-wrap items-baseline gap-2">{children}</div>;
      }
      return (
        <KitStack
          {...context}
          props={{
            direction: props.direction === 'horizontal' ? 'horizontal' : 'vertical',
            gap: gap[props.gap ?? 'm'],
            align: props.align ?? (props.direction === 'horizontal' ? 'center' : 'stretch'),
            justify: null,
            className: null,
          }}
        >
          {children}
        </KitStack>
      );
    },

    Grid: ({ props, children }) => (
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(min(var(--min-column),100%),1fr))] items-start gap-4"
        style={{ '--min-column': columnWidth[props.minColumnWidth ?? 'm'] } as CSSProperties}
      >
        {children}
      </div>
    ),

    Card: ({ props, children, ...context }) => (
      <KitCard {...context} props={{ title: props.title ?? null, description: null, maxWidth: null, centered: null, className: null }}>{children}</KitCard>
    ),

    Text: ({ props, children }) => {
      const text = props.highlight ? (
        <mark className="rounded-sm bg-yellow-200/70 px-1 text-foreground dark:bg-yellow-800/60">{props.text}</mark>
      ) : (
        props.text
      );
      return (
        <p
          className={clsx(
            props.size === 'small' ? 'text-xs' : props.size === 'large' ? 'text-2xl font-semibold tracking-tight' : 'text-sm',
            props.muted && 'text-muted-foreground',
          )}
        >
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    List: ({ props, children }) => (
      <ul className={clsx('divide-y rounded-lg bg-card text-card-foreground', !props.borderless && 'border')}>
        {children}
      </ul>
    ),

    ListItem: ({ props, children, slots, ...context }) => (
      <li className="flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm">
        {props.description
          ? (
            <span className="flex flex-col gap-0.5">
              <span>{props.label}</span>
              <span className="text-xs text-muted-foreground">{props.description}</span>
            </span>
          )
          : props.checkbox
          ? <KitCheckbox {...context} props={{ label: props.label, name: props.label, checked: props.checked ?? false, checks: null, validateOn: null }} />
          : <span>{props.label}</span>}
        {children}
        {slots?.suffix && <span className="flex items-center gap-1">{slots.suffix}</span>}
      </li>
    ),

    // shadcn has no attention pulse; Tailwind's opacity pulse is the nearest
    // thing the library's vocabulary offers.
    Badge: ({ props, ...context }) => {
      const badge = (
        <KitBadge
          {...context}
          props={{
            text: props.text,
            variant: props.tone === 'danger' ? 'destructive' : props.tone === 'accent' ? 'default' : 'secondary',
          }}
        />
      );
      return props.pulse ? <span className="animate-pulse">{badge}</span> : badge;
    },

    Button: ({ props, emit }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      return (
        <button
          type="button"
          className={clsx(
            buttonBase,
            buttonVariant[props.variant ?? 'default'],
            buttonSize[props.hideLabel && Icon ? 'icon' : 'default'],
          )}
          disabled={props.disabled ?? undefined}
          aria-expanded={props.expanded ?? undefined}
          aria-label={props.hideLabel ? props.label : undefined}
          onClick={() => emit('press')}
        >
          {Icon && <Icon aria-hidden="true" fill={props.icon === 'delete-confirm' ? 'currentColor' : 'none'} />}
          {!props.hideLabel && props.label}
        </button>
      );
    },

    // shadcn/ui Sheet (side="right"), non-modal so the actor keeps editing the
    // rule beside it. The kit's Drawer is a bottom sheet (vaul) whose open
    // state is a path prop rather than a binding.
    Drawer: ({ props, children, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      return (
        <Dialog.Root open={open ?? false} onOpenChange={setOpen} modal={false}>
          <Dialog.Portal container={scopedPortal()}>
            <Dialog.Content
              aria-describedby={undefined}
              onInteractOutside={event => event.preventDefault()}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l bg-background shadow-lg sm:max-w-sm"
            >
              <div className="flex flex-col gap-1.5 p-4">
                <Dialog.Title className="font-semibold text-foreground">{props.title}</Dialog.Title>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm">{children}</div>
              <Dialog.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      );
    },

    // Built for this registry: the kit has nothing like it. Plain inline text
    // with menu triggers, where the project's version is a read-only Tiptap
    // document; the contract (parts in, edits out) is the same.
    RuleSentence: ({ props, bindings, emit }) => {
      const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
      const send: Send = (kind, slotId, value) => {
        setEdit({ kind, slotId, value });
        emit(kind);
      };
      return (
        <p role="group" aria-label={props.label} className="text-base leading-8">
          {(props.parts as RulePart[]).map((part, i) =>
            typeof part === 'string'
              ? <span key={i}>{part}</span>
              : <SentenceSlot key={part.id} slot={part} send={send} />,
          )}
        </p>
      );
    },
  },
  actions: actionsSuppliedBySpecs,
});
