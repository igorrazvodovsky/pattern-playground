import { useId, useRef, type CSSProperties } from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { createPortal } from 'react-dom';
import { Dialog, Toast } from 'radix-ui';
import { shadcnComponents } from '@json-render/shadcn';
import clsx from 'clsx';
import { Archive, Crown, Globe, History, Trash2, Undo2, UserMinus, X } from 'lucide-react';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames } from '../catalog';
import { captureOpener, focusDemoIfOpenerGone, type Opener } from './dialog-focus';
import { scopedPortal } from './shadcn-portal';
import type { Send } from './shadcn-parts';
import { RuleBuilder, type RuleTree } from './shadcn-rule-builder';
import { useToastList } from './toast-list';
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
  archive: Archive,
  cancel: X,
  delete: Trash2,
  'delete-confirm': Trash2,
  history: History,
  publish: Globe,
  'remove-person': UserMinus,
  restore: Undo2,
  transfer: Crown,
};

// shadcn/ui Button (new-york, v4), variants and sizes as published.
const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
const buttonVariant = {
  default: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  primary: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
  plain: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
  danger: 'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
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

    // The kit's Card has no CardAction or CardFooter, so a card with a suffix
    // or actions is built from shadcn's card classes: the suffix in the
    // header's action column, the actions in the footer at the end.
    Card: ({ props, children, slots, ...context }) =>
      slots?.suffix || slots?.actions ? (
        <div className="flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm">
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
            {props.title && <div className="leading-none font-semibold">{props.title}</div>}
            {slots.suffix && (
              <div data-slot="card-action" className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                {slots.suffix}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 px-6">{children}</div>
          {slots.actions && <div className="flex items-center justify-end gap-2 px-6">{slots.actions}</div>}
        </div>
      ) : (
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
          role={props.status ? 'status' : undefined}
        >
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    BulletList: ({ props }) => (
      <ul className="ml-6 list-disc text-sm [&>li]:mt-1">
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    List: ({ props, children }) => (
      <ul className={clsx('divide-y rounded-lg bg-card text-card-foreground', !props.borderless && 'border')}>
        {children}
      </ul>
    ),

    // `struck` wraps the whole label, the kit's checkbox included, in a
    // line-through span: the kit renders its own label and takes no class.
    ListItem: ({ props, children, slots, ...context }) => (
      <li className="flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm">
        <span className={clsx(props.struck && 'text-muted-foreground line-through')}>
          {props.description
            ? (
              <span className="flex flex-col gap-0.5">
                <span>{props.label}</span>
                <span className="text-xs text-muted-foreground">{props.description}</span>
              </span>
            )
            : props.checkbox
            ? <KitCheckbox {...context} props={{ label: props.label, name: props.label, checked: props.checked ?? false, checks: null, validateOn: null }} />
            : props.label}
        </span>
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
          data-autofocus={props.initialFocus || undefined}
          onClick={() => emit('press')}
        >
          {Icon && <Icon aria-hidden="true" fill={props.icon === 'delete-confirm' ? 'currentColor' : 'none'} />}
          {!props.hideLabel && props.label}
        </button>
      );
    },

    // shadcn/ui Input, with a Label above it unless the label is hidden.
    Input: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      const field = (
        <input
          id={id}
          type="text"
          aria-label={props.hideLabel ? props.label : undefined}
          placeholder={props.placeholder ?? undefined}
          data-autofocus={props.initialFocus || undefined}
          value={value ?? ''}
          onChange={event => setValue(event.target.value)}
          className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
        />
      );
      return props.hideLabel ? field : (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className="flex items-center gap-2 text-sm leading-none font-medium select-none">{props.label}</label>
          {field}
        </div>
      );
    },

    // shadcn/ui Dialog: modal, so focus stays inside it and the page behind
    // is out of reach until it closes. An alert behaves as shadcn's
    // AlertDialog does: role="alertdialog", and a click outside does not
    // close it. Focus starts on the element marked data-autofocus, if any.
    // Radix returns focus to its Trigger, and a dialog opened from state has
    // none, so the element that had focus when it opened is recorded and
    // focused again on close (or the demo, if closing removed it; see
    // dialog-focus.ts).
    Dialog: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const opener = useRef<Opener | null>(null);
      return (
        <Dialog.Root open={open ?? false} onOpenChange={setOpen}>
          <Dialog.Portal container={scopedPortal()}>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content
              // Radix links a Dialog.Description itself; without one it wants
              // aria-describedby set to undefined explicitly.
              {...(props.description ? {} : { 'aria-describedby': undefined })}
              role={props.alert ? 'alertdialog' : 'dialog'}
              onInteractOutside={props.alert ? event => event.preventDefault() : undefined}
              onOpenAutoFocus={event => {
                opener.current = captureOpener();
                const marked = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>('[data-autofocus]');
                if (!marked) return;
                event.preventDefault();
                marked.focus();
              }}
              onCloseAutoFocus={event => {
                if (!opener.current) return;
                event.preventDefault();
                if (!focusDemoIfOpenerGone(opener.current)) opener.current.element?.focus();
                opener.current = null;
              }}
              className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 text-sm shadow-lg sm:max-w-lg"
            >
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <Dialog.Title className="text-lg leading-none font-semibold text-foreground">{props.title}</Dialog.Title>
                {props.description && (
                  <Dialog.Description className="text-sm text-muted-foreground">{props.description}</Dialog.Description>
                )}
              </div>
              <div className="flex flex-col gap-4">{children}</div>
              {slots?.actions && (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{slots.actions}</div>
              )}
              <Dialog.Close className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50">
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
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

    // shadcn/ui Toast, the Radix one shadcn shipped before it moved to Sonner:
    // Radix parts and shadcn's classes, as Dialog is built here. Radix pauses
    // the timer while the pointer or focus is on a toast, and a toast can be
    // swiped away. The viewport portals into the scoped root.
    Toasts: ({ props, bindings, emit }) => {
      const { dismiss, press } = useToastList(bindings?.toasts, bindings?.pressed, emit);
      return (
        <Toast.Provider swipeDirection="right" label="Notifications">
          {props.toasts.map(toast => (
            <Toast.Root
              key={toast.id}
              duration={toast.actionLabel ? toastDuration.withAction : toastDuration.plain}
              onOpenChange={open => { if (!open) dismiss(toast.id); }}
              className="group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md border bg-background p-4 pr-8 text-foreground shadow-lg data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
            >
              <Toast.Description className="text-sm">{toast.message}</Toast.Description>
              {toast.actionLabel && (
                <Toast.Action
                  altText={toast.actionLabel}
                  onClick={() => press(toast)}
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors outline-none hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {toast.actionLabel}
                </Toast.Action>
              )}
              <Toast.Close
                aria-label="Close"
                className="absolute top-1 right-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <X aria-hidden="true" className="size-4" />
              </Toast.Close>
            </Toast.Root>
          ))}
          {createPortal(
            <Toast.Viewport className="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 outline-none sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]" />,
            scopedPortal(),
          )}
        </Toast.Provider>
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
