import { useId, useRef, type CSSProperties } from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { createPortal } from 'react-dom';
import { Checkbox, Dialog, RadioGroup, Select, Toast, Tooltip } from 'radix-ui';
import { shadcnComponents } from '@json-render/shadcn';
import clsx from 'clsx';
import {
  Archive,
  ArrowLeft,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleX,
  Crown,
  ExternalLink,
  FolderOpen,
  Globe,
  History,
  Info,
  Link,
  LoaderCircle,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
  Undo2,
  UserMinus,
  X,
} from 'lucide-react';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames, type purposes } from '../catalog';
import { captureOpener, focusDemoIfOpenerGone, type Opener } from './dialog-focus';
import { useFieldError } from './field-validation';
import { submitForm } from './form-submit';
import { useFocusHandoff } from './focus-handoff';
import { useFocusOnShow } from './focus-on-show';
import { scopedPortal } from './shadcn-portal';
import type { Send } from './shadcn-parts';
import { RuleBuilder, type RuleTree } from './shadcn-rule-builder';
import { Section, Sections } from './shadcn-sections';
import { Timeline, TimelineEntry } from './shadcn-timeline';
import { useDisclosureState } from './disclosure-state';
import { useToastList } from './toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from './mark-tracing';
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
  back: ArrowLeft,
  cancel: X,
  delete: Trash2,
  'delete-confirm': Trash2,
  external: ExternalLink,
  generated: Sparkles,
  guide: BookOpen,
  history: History,
  link: Link,
  notifications: Bell,
  open: FolderOpen,
  publish: Globe,
  'remove-person': UserMinus,
  restore: Undo2,
  search: Search,
  transfer: Crown,
};

// Each purpose's icon and colour. Danger is shadcn's destructive; the others
// take the tints the kit's Alert gives its success, warning and info types.
type Purpose = (typeof purposes)[number];
const purposeIcons: Record<Purpose, typeof X> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
};
const purposeText: Record<Purpose, string> = {
  info: 'text-blue-700 dark:text-blue-300',
  success: 'text-green-700 dark:text-green-300',
  warning: 'text-yellow-700 dark:text-yellow-300',
  danger: 'text-destructive',
};
const purposeSurface: Record<Purpose, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
  success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
  danger: 'bg-card text-destructive',
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

// A highlighted run of text, in Text and in a message's marked runs.
const markClass = 'rounded-sm bg-yellow-200/70 px-1 text-foreground dark:bg-yellow-800/60';

// shadcn/ui Label, and the field error shadcn's Form shows beneath a control.
// The error is an alert so that it is read out when a submit sets it.
const label = 'flex items-center gap-2 text-sm leading-none font-medium select-none';
const fieldError = (id: string, message: string) => (
  <p id={id} role="alert" className="text-sm text-destructive">
    <span className="sr-only">Error:</span> {message}
  </p>
);
const invalidRing = 'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40';

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

    // The kit's Card has no CardAction or CardFooter, and its title is plain
    // text, so a card with a suffix or actions, or one that opens, is built
    // from shadcn's card classes: the suffix in the header's action column,
    // the actions in the footer at the end. shadcn has no card that opens; the
    // title button's ::after covers the card, the suffix and actions sit above
    // it, and focus is shown on the cover so the whole card is marked. The
    // button takes focus when it appears, if `focusOnShow` (focus-on-show.ts).
    Card: ({ props, children, slots, emit, ...context }) => {
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      if (!props.opens && !slots?.suffix && !slots?.actions) {
        return <KitCard {...context} emit={emit} props={{ title: props.title ?? null, description: null, maxWidth: null, centered: null, className: null }}>{children}</KitCard>;
      }
      const above = props.opens && 'relative z-10';
      return (
        <div className={clsx('flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm', props.opens && 'relative')}>
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
            {props.title && (
              <div className="leading-none font-semibold">
                {props.opens ? (
                  <button
                    ref={openRef}
                    type="button"
                    className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                    onClick={() => emit('open')}
                  >
                    {props.title}
                  </button>
                ) : (
                  props.title
                )}
              </div>
            )}
            {slots?.suffix && (
              <div data-slot="card-action" className={clsx('col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end', above)}>
                {slots.suffix}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3 px-6">{children}</div>
          {slots?.actions && <div className={clsx('flex items-center justify-end gap-2 px-6', above)}>{slots.actions}</div>}
        </div>
      );
    },

    Text: ({ props, children }) => {
      const text = props.highlight ? (
        <mark className={markClass}>{props.text}</mark>
      ) : (
        props.text
      );
      const Icon = props.purpose ? purposeIcons[props.purpose] : null;
      return (
        <p
          className={clsx(
            props.size === 'small' ? 'text-xs' : props.size === 'large' ? 'text-2xl font-semibold tracking-tight' : 'text-sm',
            props.purpose
              ? ['flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0', purposeText[props.purpose], props.size !== 'large' && 'font-medium']
              : props.muted && 'text-muted-foreground',
          )}
          role={props.status ? 'status' : undefined}
        >
          {Icon && <Icon aria-hidden="true" />}
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    // shadcn/ui Alert's layout and its icon column, without the kit's
    // role="alert": a callout is part of the content and is not announced.
    Callout: ({ props, slots }) => {
      const Icon = purposeIcons[props.purpose ?? 'info'];
      return (
        <div
          className={clsx(
            'relative grid w-full grid-cols-[calc(var(--spacing)*4)_1fr] items-start gap-x-3 gap-y-0.5 rounded-lg border px-4 py-3 text-sm [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
            props.purpose ? purposeSurface[props.purpose] : 'bg-card text-card-foreground',
          )}
        >
          <Icon aria-hidden="true" />
          {props.title && <div className="col-start-2 min-h-4 font-medium tracking-tight">{props.title}</div>}
          <div className="col-start-2">{props.text}</div>
          {slots?.actions && <div className="col-start-2 mt-2 flex gap-2">{slots.actions}</div>}
        </div>
      );
    },

    // shadcn/ui Empty, with its icon media, header and content. Its title is
    // a div, as shadcn publishes it, not a heading.
    EmptyState: ({ props, slots }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      return (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12">
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            {Icon && (
              <div className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6">
                <Icon aria-hidden="true" />
              </div>
            )}
            <div className="text-lg font-medium tracking-tight">{props.title}</div>
            {props.description && <div className="text-sm/relaxed text-muted-foreground">{props.description}</div>}
          </div>
          {slots?.actions && (
            <div className="flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance">
              <div className="flex gap-2">{slots.actions}</div>
            </div>
          )}
        </div>
      );
    },

    Sections: ({ props, children }) => <Sections affordance={props.affordance}>{children}</Sections>,

    Section: ({ props, children }) => <Section title={props.title}>{children}</Section>,

    BulletList: ({ props }) => (
      <ul className="ml-6 list-disc text-sm [&>li]:mt-1">
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    // shadcn/ui has no conversation component. The bubbles follow AI
    // Elements' Message, which is built on shadcn: the actor's messages on the
    // secondary surface at the end of the line, the other side's as plain
    // text. A marked run's note is shadcn/ui Tooltip, over Radix, portalled
    // into the scoped root. Each Message brings the provider, so its marks
    // share one hover delay and a Message renders outside Messages too. A mark
    // with a note is underlined, dotted, as an abbreviation is, and takes focus
    // so that the tooltip opens for actors on a keyboard too. A linked run
    // traces its link (mark-tracing.ts), loses its highlight while another
    // link is traced, and names the runs it is linked to in sr-only text.
    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="flex flex-col gap-4 text-sm">{children}</div>
      </TracingProvider>
    ),

    Message: ({ props }) => {
      const tracing = useMarkTracing(props.parts);
      return (
        <Tooltip.Provider delayDuration={150}>
          <div
            className={clsx(
              'w-fit max-w-[80%]',
              props.from === 'actor' ? 'ml-auto rounded-lg bg-secondary px-4 py-3 text-secondary-foreground' : 'text-foreground',
            )}
          >
            {props.parts.map((part, index) => {
              if (typeof part === 'string') return part;
              const { dimmed, linkedTo, handlers } = tracing(index);
              const className = clsx(
                markClass,
                'transition-colors data-dimmed:bg-transparent dark:data-dimmed:bg-transparent',
                (part.note || part.link) && 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                part.note && 'cursor-help underline decoration-dotted underline-offset-4',
              );
              const mark = (
                <mark key={index} tabIndex={part.note ? 0 : undefined} data-dimmed={dimmed || undefined} {...handlers} className={className}>
                  {part.text}
                  {linkedTo.length > 0 && <span className="sr-only">, linked to: {linkedTo.join('; ')}</span>}
                </mark>
              );
              if (!part.note) return mark;
              return (
                <Tooltip.Root key={index}>
                  <Tooltip.Trigger asChild>{mark}</Tooltip.Trigger>
                  <Tooltip.Portal container={scopedPortal()}>
                    <Tooltip.Content
                      sideOffset={4}
                      className="z-50 w-fit rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background"
                    >
                      {part.note}
                      <Tooltip.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}
          </div>
        </Tooltip.Provider>
      );
    },

    Timeline: ({ props, children }) => <Timeline density={props.density ?? 'normal'}>{children}</Timeline>,

    TimelineEntry: ({ props, children, bindings }) => {
      const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
      return (
        <TimelineEntry
          title={props.title}
          by={props.by ?? null}
          time={props.time ?? null}
          fromActor={props.from === 'actor'}
          pending={props.pending ?? false}
          expandable={props.expandable ?? false}
          open={open}
          onOpenChange={setOpen}
        >
          {children}
        </TimelineEntry>
      );
    },

    List: ({ props, children }) => (
      <ul className={clsx('divide-y rounded-lg bg-card text-card-foreground', !props.borderless && 'border')}>
        {children}
      </ul>
    ),

    // `struck` wraps the whole label, the kit's checkbox included, in a
    // line-through span: the kit renders its own label and takes no class.
    // A bound `checked` reaches the kit's checkbox with the row's bindings.
    // The kit uses `name` as the checkbox's id and its label's `for`, so each
    // row gets its own: two lists of the same rows on one page would otherwise
    // share ids, and a label would tick the other list's row.
    ListItem: ({ props, children, slots, ...context }) => {
      const id = useId();
      return (
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
              ? <KitCheckbox {...context} props={{ label: props.label, name: id, checked: props.checked ?? false, checks: null, validateOn: null }} />
              : props.label}
          </span>
          {children}
          {slots?.suffix && <span className="flex items-center gap-1">{slots.suffix}</span>}
        </li>
      );
    },

    // shadcn has no attention pulse; Tailwind's opacity pulse is the nearest
    // thing the library's vocabulary offers.
    Badge: ({ props, ...context }) => {
      // An attribute is shadcn/ui Badge (secondary) from its published
      // classes, since the kit's Badge takes only text: the label muted
      // before the value.
      if (props.label) {
        return (
          <span className="inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground">
            <span className="text-muted-foreground">{props.label}</span>
            {props.text}
          </span>
        );
      }
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

    // shadcn/ui Badge (secondary), from its published classes rather than
    // the kit's Badge, which takes only text and so cannot hold the remove
    // button. overflow-hidden is dropped: it would clip the button's focus
    // ring. shadcn has no busy state for a badge, so a pending tag spins
    // shadcn Spinner's icon in place of its own. The icon stays hidden from
    // assistive technology, where the label already says the tag is pending,
    // and stops spinning under reduced motion. The remove button hands focus
    // on (focus-handoff.ts) if it unmounts while focused.
    Tag: ({ props, emit }) => {
      const removeRef = useFocusHandoff(props.focusNext);
      const Icon = props.pending ? LoaderCircle : props.icon ? icons[props.icon] : null;
      return (
        <span className="inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground [&>svg]:pointer-events-none [&>svg]:size-3">
          {Icon && <Icon aria-hidden="true" className={clsx(props.pending && 'animate-spin motion-reduce:animate-none')} />}
          <span className={props.pending ? 'text-muted-foreground' : undefined}>{props.label}</span>
          {props.removeLabel && (
            <button
              ref={removeRef}
              type="button"
              aria-label={props.removeLabel}
              onClick={() => emit('remove')}
              className="-mr-1 rounded-sm p-0.5 opacity-70 outline-none hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:size-3"
            >
              <X aria-hidden="true" />
            </button>
          )}
        </span>
      );
    },

    // Hands focus on (focus-handoff.ts) if it unmounts while focused.
    Button: ({ props, emit }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const ref = useFocusHandoff(props.focusNext);
      useFocusOnShow(ref, props.focusOnShow);
      return (
        <button
          ref={ref}
          type={props.submit ? 'submit' : 'button'}
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
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      return (
        <div className="flex flex-col gap-2">
          {!props.hideLabel && <label htmlFor={id} className={label}>{props.label}</label>}
          <input
            id={id}
            type={props.type ?? 'text'}
            aria-label={props.hideLabel ? props.label : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            data-invalid={error ? '' : undefined}
            placeholder={props.placeholder ?? undefined}
            data-autofocus={props.initialFocus || undefined}
            value={value ?? ''}
            onChange={event => setValue(event.target.value)}
            className={clsx(
              'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30',
              invalidRing,
            )}
          />
          {error && fieldError(`${id}-error`, error)}
        </div>
      );
    },

    // shadcn/ui Textarea, which grows with its text (field-sizing: content).
    Textarea: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className={label}>{props.label}</label>
          <textarea
            id={id}
            placeholder={props.placeholder ?? undefined}
            value={value ?? ''}
            onChange={event => setValue(event.target.value)}
            className="flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
          />
        </div>
      );
    },

    // shadcn/ui Select: Radix's listbox, not a native select. An empty value
    // shows the placeholder, which is not an option. The list portals into
    // the scoped root.
    Select: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className={label}>{props.label}</label>
          <Select.Root value={value ?? ''} onValueChange={setValue}>
            <Select.Trigger
              id={id}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              data-invalid={error ? '' : undefined}
              className={clsx(
                "flex h-9 w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                invalidRing,
              )}
            >
              <Select.Value placeholder={props.placeholder ?? undefined} />
              <Select.Icon asChild>
                <ChevronDown aria-hidden="true" className="size-4 opacity-50" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal container={scopedPortal()}>
              <Select.Content
                position="popper"
                sideOffset={4}
                className="relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
              >
                <Select.Viewport className="h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1 p-1">
                  {props.options.map(option => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <span className="absolute right-2 flex size-3.5 items-center justify-center">
                        <Select.ItemIndicator><Check aria-hidden="true" className="size-4" /></Select.ItemIndicator>
                      </span>
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {error && fieldError(`${id}-error`, error)}
        </div>
      );
    },

    // shadcn/ui RadioGroup: Radix's radio group, one tab stop and arrow keys
    // between the options, named by the label above it.
    RadioGroup: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div className="flex flex-col gap-3">
          <div id={id} className={label}>{props.label}</div>
          <RadioGroup.Root aria-labelledby={id} value={value ?? undefined} onValueChange={setValue} className="grid gap-3">
            {props.options.map(option => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroup.Item
                  id={`${id}-${option.value}`}
                  value={option.value}
                  className="aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                >
                  <RadioGroup.Indicator className="relative flex items-center justify-center">
                    <Circle aria-hidden="true" className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
                <label htmlFor={`${id}-${option.value}`} className={clsx(label, 'font-normal')}>{option.label}</label>
              </div>
            ))}
          </RadioGroup.Root>
        </div>
      );
    },

    // shadcn/ui Checkbox: Radix's checkbox button beside a Label.
    Checkbox: ({ props, bindings }) => {
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      const id = useId();
      return (
        <div className="flex items-center gap-3">
          <Checkbox.Root
            id={id}
            checked={checked ?? false}
            onCheckedChange={next => setChecked(next === true)}
            className="peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary"
          >
            <Checkbox.Indicator className="grid place-content-center text-current transition-none">
              <Check aria-hidden="true" className="size-3.5" />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <label htmlFor={id} className={clsx(label, 'font-normal')}>{props.label}</label>
        </div>
      );
    },

    // Submitting runs the spec's checks (form-submit.ts). A form is read
    // most easily at about 36rem, however wide the demo is.
    Form: ({ props, children, emit }) => (
      <form
        className="flex max-w-xl flex-col gap-6"
        aria-label={props.label ?? undefined}
        noValidate
        onSubmit={event => void submitForm(event, emit)}
      >
        {children}
      </form>
    ),

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
