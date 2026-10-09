import type { CSSProperties } from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { Dialog } from 'radix-ui';
import { shadcnComponents } from '@json-render/shadcn';
import clsx from 'clsx';
import { History, Trash2, X } from 'lucide-react';
import { catalog, actionsSuppliedBySpecs, type iconNames } from '../catalog';
import { scopedPortal } from './shadcn-portal';
import type { Send } from './shadcn-parts';
import { RuleBuilder, type RuleTree } from './shadcn-rule-builder';
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
// Every class used here, in shadcn-parts.tsx and in the composites beside it
// must be visible to Tailwind: catalog/shadcn.css lists them as sources.
// Rebuild the sheet after changing classes:
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

    // Built for this registry: the kit has nothing like it, and the catalog
    // can name the composite but not assemble it. The tree arrives as data and
    // edits leave as { kind, slotId, value } on the bound path, then an event.
    RuleBuilder: ({ props, bindings, emit }) => {
      const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
      const send: Send = (kind, slotId, value) => {
        setEdit({ kind, slotId, value });
        emit(kind);
      };
      return <RuleBuilder label={props.label} tree={props.tree as RuleTree} send={send} />;
    },
  },
  actions: actionsSuppliedBySpecs,
});
