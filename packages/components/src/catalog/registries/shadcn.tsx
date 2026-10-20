import { Children, Fragment, Suspense, useContext, useId, useRef, useState, type CSSProperties } from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { createPortal } from 'react-dom';
import { Collapsible, Dialog, DropdownMenu, Popover, RadioGroup, Select, Slider, Toast, ToggleGroup, Tooltip } from 'radix-ui';
import { Command } from 'cmdk';
import clsx from 'clsx';
import {
  Archive,
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  ArrowUpNarrowWide,
  AtSign,
  Award,
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  CaseSensitive,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  CircleDashed,
  Columns2,
  CircleX,
  CornerDownLeft,
  DollarSign,
  Crown,
  Eraser,
  Eye,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Group,
  History,
  IdCard,
  Info,
  LayoutGrid,
  Layers,
  Lightbulb,
  Link,
  ListFilter,
  LoaderCircle,
  Maximize2,
  MessageSquare,
  Minus,
  Package,
  PanelRight,
  Paperclip,
  Plus,
  Puzzle,
  Quote,
  Rows3,
  Search,
  SignalHigh,
  SlidersHorizontal,
  Store,
  Table2,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Undo2,
  User,
  UserMinus,
  Users,
  Wrench,
  X,
  Signal,
  SignalLow,
  SignalMedium,
  CircleAlert,
  Contrast,
  CalendarHeart,
  CalendarX,
  ChartColumn,
  ChartPie,
  ClipboardList,
  Clock,
  FlaskConical,
  GraduationCap,
  Megaphone,
  Paintbrush,
  Presentation,
  Recycle,
  Scroll,
  Truck,
  Undo,
} from 'lucide-react';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames, type purposes, type tones } from '../catalog';
import { useCandidateList } from './candidate-list';
import { captureOpener, settleFocus, useReturnFocus, type Opener } from './dialog-focus';
import { useFieldError } from './field-validation';
import { submitForm } from './form-submit';
import { useFocusHandoff, useMenuFocusHandoff } from './focus-handoff';
import { useFocusOnShow } from './focus-on-show';
import { scopedPortal } from './shadcn-portal';
import { CheckboxField } from './shadcn-checkbox';
import { ComposerField } from './composer-field';
import { ShadcnMentionEditor } from './mention-editor-lazy';
import type { Send } from './shadcn-parts';
import { LocationMap } from './shadcn-map';
import { RuleBuilder, type RuleTree } from './shadcn-rule-builder';
import { Subsection, useHeading } from './heading-level';
import { Section, Sections } from './shadcn-sections';
import { Timeline, TimelineEntry } from './shadcn-timeline';
import { useDisclosureOpen, useDisclosureState } from './disclosure-state';
import { BoardAxis } from './board-axis';
import { useDisclosureDrop, useDragRow, useStackDrop } from './drag-drop';
import { MenuMultiple } from './menu-multiple';
import { Crumb, CrumbOverflow, Trail } from './shadcn-crumb';
import { DraggableRow } from './shadcn-draggable-row';
import { FilterTag } from './shadcn-filter-tag';
import { popoverHost, useMayTakeFocus } from './popover-host';
import { usePreview } from './preview';
import { useSplitRoom } from './split-room';
import { useToastList } from './toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from './mark-tracing';
import sheetUrl from '../shadcn.generated.css?url';

// The catalog rendered with shadcn/ui. Every type is built from shadcn's own
// class lists over Radix primitives, which is how shadcn is meant to be used:
// its components are copied into a project, not imported.
//
// The stylesheet is linked by URL, not imported as a module: Astro hoists CSS
// imported anywhere under a client script into every page's <head>, which
// would load Tailwind on pages that never render a shadcn demo. Callers await
// `stylesheet` before rendering so the first frame is styled.
//
// Tailwind scans this file and every registries/shadcn*.tsx beside it
// (catalog/shadcn.css), so a class written elsewhere is not in the sheet.
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

const gap = { none: 'gap-0', s: 'gap-2', m: 'gap-3', l: 'gap-4' } as const;
const align = { start: 'items-start', center: 'items-center', baseline: 'items-baseline', stretch: 'items-stretch' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;

export const icons: Record<(typeof iconNames)[number], typeof X> = {
  archive: Archive,
  ascending: ArrowUpNarrowWide,
  attach: Paperclip,
  back: ArrowLeft,
  cancel: X,
  cards: LayoutGrid,
  clear: Eraser,
  columns: Columns2,
  confirm: Check,
  decrease: TrendingDown,
  delete: Trash2,
  'delete-confirm': Trash2,
  descending: ArrowDownWideNarrow,
  detail: PanelRight,
  document: FileText,
  example: CaseSensitive,
  external: ExternalLink,
  filter: ListFilter,
  full: Maximize2,
  generated: Sparkles,
  group: Group,
  guide: BookOpen,
  history: History,
  'in-place': Rows3,
  increase: TrendingUp,
  link: Link,
  material: Layers,
  mention: AtSign,
  more: Plus,
  move: ArrowLeftRight,
  next: ChevronRight,
  notifications: Bell,
  open: FolderOpen,
  ownership: Crown,
  part: Puzzle,
  people: Users,
  person: User,
  popover: MessageSquare,
  previous: ChevronLeft,
  product: Package,
  project: Folder,
  publish: Globe,
  quote: Quote,
  reasoning: Lightbulb,
  'remove-person': UserMinus,
  restore: Undo2,
  rows: Rows3,
  saved: Bookmark,
  search: Search,
  send: CornerDownLeft,
  service: Wrench,
  settings: SlidersHorizontal,
  show: Eye,
  'side-by-side': Columns2,
  sort: ArrowDownUp,
  suggest: Lightbulb,
  summary: IdCard,
  table: Table2,
  transfer: Crown,
  unchanged: Minus,
  web: Globe,
  // Attribute names from the entity bindings.
  assignee: User,
  availability: Circle,
  category: Tag,
  certifications: Award,
  channels: Store,
  created: CalendarPlus,
  due: Calendar,
  labels: Tag,
  price: DollarSign,
  priority: SignalHigh,
  regions: Globe,
  repairability: Wrench,
  status: CircleDashed,
  updated: CalendarCheck,
  upgradeability: ArrowUp,
  // Values from fixed lists.
  'date-in-3-days': Calendar,
  'date-in-3-months': CalendarX,
  'date-in-a-day': Clock,
  'date-in-a-month': CalendarHeart,
  'date-in-a-week': CalendarCheck,
  'date-past': History,
  'label-advocacy': Megaphone,
  'label-assessment': ChartPie,
  'label-audit': ClipboardList,
  'label-data': ChartColumn,
  'label-design': Paintbrush,
  'label-education': BookOpen,
  'label-innovation': Lightbulb,
  'label-logistics': Truck,
  'label-marketing': Presentation,
  'label-optimization': TrendingUp,
  'label-policy': Scroll,
  'label-recycling': Recycle,
  'label-refurbishment': Wrench,
  'label-research': FlaskConical,
  'label-sourcing': Search,
  'label-take-back': Undo,
  'label-training': GraduationCap,
  'label-waste-reduction': Trash2,
  'priority-high': Signal,
  'priority-low': SignalLow,
  'priority-medium': SignalMedium,
  'priority-urgent': CircleAlert,
  'status-backlog': CircleDashed,
  'status-cancelled': CircleX,
  'status-done': CircleCheck,
  'status-in-progress': Contrast,
  'status-in-review': Eye,
  'status-todo': Circle,
  'unassigned': UserMinus,
};

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

type Tone = (typeof tones)[number];
const badgeFill: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  accent: 'bg-primary text-primary-foreground',
  success: 'bg-green-700 text-white dark:bg-green-800',
  danger: 'bg-destructive text-white dark:bg-destructive/60',
};
const badgeOutline: Record<Tone, string> = {
  neutral: 'text-foreground',
  accent: 'border-primary text-foreground',
  success: purposeText.success,
  danger: purposeText.danger,
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

const markClass = 'rounded-sm bg-yellow-200/70 px-1 text-foreground dark:bg-yellow-800/60';

const label = 'flex items-center gap-2 text-sm leading-none font-medium select-none';
const fieldError = (id: string, message: string) => (
  <p id={id} role="alert" className="text-sm text-destructive">
    <span className="sr-only">Error:</span> {message}
  </p>
);
const invalidRing = 'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40';

export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children, bindings, emit }) => {
      const { ref, over } = useStackDrop(props, bindings, emit);
      const horizontal = props.direction === 'horizontal';
      const Element = props.label ? 'section' : 'div';
      return (
        <Element
          ref={ref}
          aria-label={props.label ?? undefined}
          className={clsx(
            'flex',
            horizontal ? 'flex-row flex-wrap' : 'flex-col',
            gap[props.gap ?? 'm'],
            align[props.align ?? (horizontal ? 'center' : 'stretch')],
            props.dropTarget && 'rounded-lg',
            over && 'outline-2 outline-offset-2 outline-primary outline-dashed',
          )}
        >
          {children}
        </Element>
      );
    },

    Grid: ({ props, children }) => (
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(min(var(--min-column),100%),1fr))] gap-4"
        style={{ '--min-column': columnWidth[props.minColumnWidth ?? 'm'] } as CSSProperties}
      >
        {children}
      </div>
    ),

    // In a card that opens, the title button's ::after covers the card, so
    // the suffix, actions, attribute buttons and detail are raised above it.
    Card: ({ props, children, slots, emit }) => {
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      useFocusHandoff(null, openRef, Boolean(props.opens && props.title));
      const Heading = useHeading();
      const above = props.opens && 'relative z-10';
      const Icon = props.icon ? icons[props.icon] : null;
      const dragRef = useRef<HTMLDivElement>(null);
      const dragging = useDragRow(dragRef, props.dragId, props.dragId != null);
      return (
        <div
          ref={dragRef}
          className={clsx(
            'group/card flex flex-col gap-6 rounded-xl border py-6 text-card-foreground has-data-[slot=stat]:gap-2',
            props.emphasis && props.emphasis !== 'full' ? 'border-dashed bg-transparent' : 'bg-card shadow-sm',
            props.opens && 'relative',
            props.selected && 'border-primary ring-1 ring-primary',
            props.dragId != null && 'cursor-grab',
            dragging && 'opacity-50',
            props.emphasis === 'faint' && 'text-muted-foreground',
          )}
          data-popover-host=""
        >
          {(props.title || slots?.suffix) && (
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
              {props.title && (
                <Heading
                  data-slot="card-title"
                  className={clsx(
                    'leading-none font-semibold group-has-data-[slot=stat]/card:text-sm group-has-data-[slot=stat]/card:leading-snug group-has-data-[slot=stat]/card:font-normal group-has-data-[slot=stat]/card:text-muted-foreground',
                    Icon && 'flex items-center gap-2',
                  )}
                >
                  {Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
                  {props.opens ? (
                    <button
                      ref={openRef}
                      type="button"
                      className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                      aria-pressed={props.selected == null || props.expanded != null ? undefined : props.selected}
                      aria-expanded={props.expanded ?? undefined}
                      onClick={() => emit('open')}
                    >
                      {props.title}
                    </button>
                  ) : (
                    props.title
                  )}
                </Heading>
              )}
              {slots?.suffix && (
                <div data-slot="card-action" className={clsx('col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end', above)}>
                  {slots.suffix}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-1 flex-col gap-3 px-6">
            {slots?.attributes && (
              <div className={clsx('flex flex-wrap items-center gap-2', props.opens && '[&_button]:relative [&_button]:z-10')}>
                {slots.attributes}
              </div>
            )}
            <Subsection>{children}</Subsection>
          </div>
          {slots?.actions && <div className={clsx('flex items-center justify-end gap-2 px-6', above)}>{slots.actions}</div>}
          {props.expanded && slots?.detail && (
            <div className="relative flex flex-col gap-3 border-t px-6 pt-6">
              <Subsection>{slots.detail}</Subsection>
            </div>
          )}
        </div>
      );
    },

    // Each pane is a demo container, so blocks inside lay out for the pane's width.
    Panes: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div
          ref={ref}
          className={room ? 'grid auto-cols-[minmax(0,1fr)] grid-flow-col items-start gap-4' : 'flex flex-col gap-4'}
        >
          {Children.map(children, child => <div className="@container/demo min-w-0 empty:hidden">{child}</div>)}
        </div>
      );
    },

    Split: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div
          ref={ref}
          className={props.split && room ? 'grid grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] items-start gap-4' : 'flex flex-col gap-4'}
        >
          {children}
        </div>
      );
    },

    Text: ({ props, children }) => {
      const text = props.highlight ? (
        <mark className={markClass}>{props.text}</mark>
      ) : (
        props.text
      );
      const purpose = props.pending ? null : props.purpose;
      const Icon = props.pending ? LoaderCircle : purpose ? purposeIcons[purpose] : null;
      if (props.inline) {
        return (
          <span className={clsx(props.muted && 'text-muted-foreground')}>
            {text}
            {children && <> {children}</>}
          </span>
        );
      }
      return (
        <p
          className={clsx(
            props.size === 'small' ? 'text-xs' : props.size === 'large' ? 'text-2xl font-semibold tracking-tight' : 'text-sm',
            (purpose || props.pending) && 'flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0',
            purpose
              ? [purposeText[purpose], props.size !== 'large' && 'font-medium']
              : (props.muted || props.pending) && 'text-muted-foreground',
          )}
          role={props.status ? 'status' : undefined}
        >
          {Icon && <Icon aria-hidden="true" className={clsx(props.pending && 'animate-spin motion-reduce:animate-none')} />}
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    // No role="alert": a callout is part of the content and is not announced.
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

    // shadcn's EmptyTitle is a div; a heading here gives both libraries the
    // same outline.
    EmptyState: ({ props, slots }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const Heading = useHeading();
      return (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12">
          <div className="flex max-w-sm flex-col items-center gap-2 text-center">
            {Icon && (
              <div className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-6">
                <Icon aria-hidden="true" />
              </div>
            )}
            <Heading className="text-lg font-medium tracking-tight">{props.title}</Heading>
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

    Board: ({ props, children }) => (
      <BoardAxis.Provider value={props.axis}>
        <div className={props.axis === 'lanes' ? 'flex items-start gap-3 overflow-x-auto pb-2' : 'flex flex-col gap-3'}>
          {children}
        </div>
      </BoardAxis.Provider>
    ),

    // The drop target is the root, so a closed one still takes the drop on
    // its trigger.
    Disclosure: ({ props, children, bindings, emit }) => {
      const [open, change] = useDisclosureOpen(props.open, bindings?.open, emit);
      const { ref, over } = useDisclosureDrop(props, bindings, emit, open, change);
      const axis = useContext(BoardAxis);
      return (
        <Collapsible.Root
          ref={ref}
          open={open}
          onOpenChange={change}
          data-slot="collapsible"
          className={clsx(
            'flex flex-col gap-2',
            axis && 'rounded-lg bg-muted/50 p-2',
            axis === 'lanes' && (open ? 'w-72 shrink-0' : 'shrink-0'),
            over && 'ring-2 ring-ring',
          )}
        >
          <Collapsible.Trigger
            data-slot="collapsible-trigger"
            className="flex items-center gap-2 rounded-md px-1 py-2 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 [&[data-state=open]>svg]:rotate-90"
          >
            <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
            {props.title}
            {props.count != null && (
              <span className="inline-flex w-fit shrink-0 items-center justify-center rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground">
                {props.count}
              </span>
            )}
          </Collapsible.Trigger>
          <Collapsible.Content
            data-slot="collapsible-content"
            className={clsx(
              axis === 'lanes' && 'grid gap-2',
              axis === 'sections' && 'grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2',
              !axis && 'flex flex-col gap-4',
              axis && 'empty:min-h-16 empty:rounded-md empty:border empty:border-dashed',
            )}
          >
            {children}
          </Collapsible.Content>
        </Collapsible.Root>
      );
    },

    BulletList: ({ props }) => (
      <ul className="ml-6 list-disc text-sm [&>li]:mt-1">
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    // Stacks below 24rem of demo width, where the pp list does.
    DescriptionList: ({ props }) => props.draggable ? (
      <dl className="grid grid-cols-1 text-sm @sm/demo:grid-cols-[max-content_1fr]">
        {props.items.map(item => <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />)}
      </dl>
    ) : (
      <dl className="grid grid-cols-1 text-sm @sm/demo:grid-cols-[max-content_1fr] [&>dd:not(:last-of-type)]:border-b @sm/demo:[&>dt:not(:last-of-type)]:border-b">
        {props.items.map(item => (
          <Fragment key={item.label}>
            <dt className="pt-2 font-medium text-muted-foreground @sm/demo:py-2 @sm/demo:pr-6">{item.label}</dt>
            <dd className="pb-2 @sm/demo:py-2">{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    ),

    Breadcrumbs: ({ props, bindings, emit }) => {
      const [, setPicked] = useBoundProp(props.picked, bindings?.picked);
      const pick = (id: string) => {
        setPicked(id);
        emit('pick');
      };
      const [first, ...middle] = props.items;
      return (
        <Trail label={props.label}>
          {first && <Crumb key={first.id} label={first.label} stage="first" onPick={() => pick(first.id)} />}
          {first && <CrumbOverflow items={props.items} middle={middle.length > 0} onPick={pick} />}
          {middle.map(item => (
            <Crumb key={item.id} label={item.label} stage="middle" onPick={() => pick(item.id)} />
          ))}
          <li className="inline-flex min-w-0 items-center gap-1.5">
            <span role="link" aria-disabled="true" aria-current="page" className="font-normal text-foreground group-data-[collapsed=all]/trail:truncate">
              {props.current}
            </span>
            {props.note && <span className="text-xs">{props.note}</span>}
          </li>
        </Trail>
      );
    },

    // The scroll container takes focus so a wide table scrolls from the keyboard.
    Table: ({ props, children }) => (
      <div
        role="region"
        aria-label={props.label}
        tabIndex={0}
        className="relative w-full overflow-x-auto rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <table className="w-full text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              {props.columns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'h-10 px-2 align-middle font-medium whitespace-nowrap text-foreground',
                    column.align === 'end' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
        </table>
      </div>
    ),

    TableRow: ({ children }) => <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>,

    TableCell: ({ props, children }) => (
      <td className={clsx('p-2 align-middle whitespace-nowrap', props.align === 'end' && 'text-right')}>
        {props.text}
        {children}
      </td>
    ),

    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="flex flex-col gap-4 text-sm">{children}</div>
      </TracingProvider>
    ),

    // Each Message brings the tooltip provider, so a Message renders outside
    // Messages too.
    Message: ({ props, children }) => {
      const tracing = useMarkTracing(props.parts);
      return (
        <Tooltip.Provider delayDuration={150}>
          <div
            className={clsx(
              'w-fit max-w-[80%]',
              props.from === 'actor' && 'ml-auto',
              props.from === 'actor' && props.parts.length > 0 ? 'rounded-lg bg-secondary px-4 py-3 text-secondary-foreground' : 'text-foreground',
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
            {children}
          </div>
        </Tooltip.Provider>
      );
    },

    Composer: ({ props, slots, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return (
        <div className="flex flex-col gap-1 rounded-xl border border-input bg-background p-2 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
          {slots?.field ? (
            <ComposerField value>{slots.field}</ComposerField>
          ) : (
            <input
              aria-label={props.label ?? undefined}
              placeholder={props.placeholder ?? undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
              className="h-9 w-full min-w-0 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
          )}
          {(slots?.actions || slots?.send) && (
            <div className="flex gap-1">
              {slots.actions}
              {slots.send && <span className="ml-auto">{slots.send}</span>}
            </div>
          )}
        </div>
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

    // An unbound checkbox still ticks on a press, but only in the row.
    ListItem: ({ props, children, slots, bindings }) => {
      const [bound, setBound] = useBoundProp(props.checked, bindings?.checked);
      const [local, setLocal] = useState(Boolean(props.checked));
      const checked = bindings?.checked ? (bound ?? false) : local;
      const Icon = props.icon ? icons[props.icon] : null;
      const glyph = Icon && <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />;
      return (
        <li className="flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm">
          <span className={clsx(glyph && !props.checkbox && 'flex items-center gap-2', props.struck && 'text-muted-foreground line-through')}>
            {!props.checkbox && glyph}
            {props.description
              ? (
                <span className="flex flex-col gap-0.5">
                  <span>{props.label}</span>
                  <span className="text-xs text-muted-foreground">{props.description}</span>
                </span>
              )
              : props.checkbox
              ? <CheckboxField label={props.label} icon={glyph} checked={checked} onChange={bindings?.checked ? setBound : setLocal} />
              : props.label}
          </span>
          {children}
          {slots?.suffix && <span className="flex items-center gap-1">{slots.suffix}</span>}
        </li>
      );
    },

    ItemGroup: ({ props, children }) => (
      <div role="list" aria-label={props.label ?? undefined} data-slot="item-group" className="group/item-group flex flex-col">
        {children}
      </div>
    ),

    // Each item draws its own separator, hidden on the first: a repeat
    // reaches the group as one child, so the group cannot place them. As on
    // a Card, the title button's ::after covers the row.
    Item: ({ props, slots, emit }) => {
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      useFocusHandoff(null, openRef, Boolean(props.opens));
      const Heading = useHeading();
      const detail = props.expanded && slots?.detail;
      return (
        <div role="listitem" className="group/row" onPointerEnter={() => emit('focus')} onPointerLeave={() => emit('blur')}>
          <div data-slot="item-separator" role="none" className="h-px shrink-0 bg-border group-first/row:hidden" />
          <div
            data-slot="item"
            data-popover-host=""
            className={clsx(
              'group/item flex flex-wrap items-center gap-4 rounded-md border p-4 text-sm transition-colors duration-100',
              props.opens && 'relative',
              props.opens && !detail && 'hover:bg-accent/50',
              props.focused && 'bg-accent/50',
              props.selected ? 'border-primary ring-1 ring-primary' : 'border-transparent',
            )}
          >
            <div data-slot="item-content" className="flex flex-1 flex-col gap-1">
              <Heading data-slot="item-title" className="flex w-fit items-center gap-2 text-sm leading-snug font-medium">
                {props.opens ? (
                  <button
                    ref={openRef}
                    type="button"
                    className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-md focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
                    aria-pressed={props.selected == null || props.expanded != null ? undefined : props.selected}
                    aria-expanded={props.expanded ?? undefined}
                    onClick={() => emit('open')}
                    onFocus={() => emit('focus')}
                    onBlur={() => emit('blur')}
                  >
                    {props.title}
                  </button>
                ) : (
                  props.title
                )}
                {slots?.titleSuffix}
              </Heading>
              {props.description && (
                <p data-slot="item-description" className="text-sm leading-normal font-normal text-balance text-muted-foreground">
                  {props.description}
                </p>
              )}
              {slots?.attributes && (
                <div className={clsx('flex flex-wrap items-center gap-2', props.opens && '[&_button]:relative [&_button]:z-10')}>
                  {slots.attributes}
                </div>
              )}
            </div>
            {slots?.suffix && (
              <div data-slot="item-actions" className={clsx('flex items-center gap-2', props.opens && 'relative z-10')}>
                {slots.suffix}
              </div>
            )}
            {detail && (
              <div data-slot="item-footer" className="relative flex basis-full flex-col gap-3 border-t pt-4">
                <Subsection>{slots.detail}</Subsection>
              </div>
            )}
          </div>
        </div>
      );
    },

    Stat: ({ props }) => (
      <div data-slot="stat" className="flex flex-col text-sm">
        <p className={clsx('text-3xl font-semibold tabular-nums', props.alert && 'text-destructive')}>
          {props.value}
          {props.unit && <span className="text-sm font-normal text-muted-foreground"> {props.unit}</span>}
        </p>
        {(props.verdict || props.detail) && (
          <div className="mt-3 flex flex-col gap-1">
            {props.verdict && <p className="font-medium">{props.verdict}</p>}
            {props.detail && <p className="text-muted-foreground">{props.detail}</p>}
          </div>
        )}
      </div>
    ),

    Badge: ({ props, emit }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const tone = props.tone ?? 'neutral';
      const Root = props.pressable ? 'button' : 'span';
      return (
        <Root
          type={props.pressable ? 'button' : undefined}
          onClick={props.pressable ? () => void emit('press') : undefined}
          className={clsx(
            props.pressable && 'cursor-pointer outline-none transition-[color,box-shadow] hover:opacity-90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'inline-flex w-fit shrink-0 items-center justify-center gap-1 border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3',
            props.pill ? 'rounded-full' : 'rounded-md',
            Icon ? ['border-border', badgeOutline[tone]] : ['border-transparent', badgeFill[tone]],
            props.pulse && 'animate-pulse',
          )}
        >
          {props.label && <span className="opacity-70">{props.label}</span>}
          {Icon && <Icon aria-hidden="true" />}
          {props.text}
        </Root>
      );
    },

    // The Badge classes without overflow-hidden, which would clip the remove
    // button's focus ring.
    Tag: ({ props, emit }) => {
      const removeRef = useFocusHandoff(props.focusNext);
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      const Icon = props.pending ? LoaderCircle : props.icon ? icons[props.icon] : null;
      const Root = props.opens ? 'button' : 'span';
      return (
        <Root
          ref={props.opens ? openRef : undefined}
          type={props.opens ? 'button' : undefined}
          onClick={props.opens ? () => emit('open') : undefined}
          className={clsx(
            'inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground [&>svg]:pointer-events-none [&>svg]:size-3',
            props.opens && 'cursor-pointer outline-none transition-[color,box-shadow] hover:bg-secondary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        >
          {Icon && <Icon aria-hidden="true" className={clsx(props.pending && 'animate-spin motion-reduce:animate-none')} />}
          <span className={props.pending ? 'text-muted-foreground' : undefined}>{props.label}</span>
          {props.removeLabel && !props.opens && (
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
        </Root>
      );
    },

    FilterTag: context => (
      <FilterTag {...context} Glyph={context.props.icon ? icons[context.props.icon] : null} iconFor={name => icons[name]} />
    ),

    Map: ({ props, bindings, emit }) => {
      const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
      const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
      return (
        <LocationMap
          label={props.label}
          locations={props.locations}
          selected={selected ?? null}
          onSelect={id => {
            setSelected(id);
            emit('select');
          }}
          focused={focused ?? null}
          onFocusChange={setFocused}
        />
      );
    },

    // A Popover with HoverCard's surface, so preview.ts sets the open and
    // close timing rather than HoverCard.
    Reference: ({ props, children, slots, bindings, emit }) => {
      const [shown, setShown] = useBoundProp(props.preview, bindings?.preview);
      const { triggerRef, contentRef, trigger, content, close } = usePreview(shown ?? false, setShown, props.expanded ?? false);
      const Heading = useHeading();
      const Glyph = props.icon ? icons[props.icon] : null;
      return (
        <Popover.Root open={shown ?? false} onOpenChange={open => !open && close()}>
          <Popover.Anchor asChild>
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={props.expanded ?? false}
              {...trigger}
              onClick={() => {
                close();
                emit('open');
              }}
              className="cursor-pointer rounded-sm bg-primary/10 px-1 font-medium text-primary outline-none hover:bg-primary/15 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {props.label}
            </button>
          </Popover.Anchor>
          <Popover.Portal container={scopedPortal()}>
            <Popover.Content
              ref={contentRef}
              aria-label={props.label}
              align="start"
              sideOffset={8}
              onOpenAutoFocus={event => event.preventDefault()}
              onCloseAutoFocus={event => event.preventDefault()}
              // The reference is the anchor, not a Radix trigger, so focus
              // moving back to it would count as leaving.
              onFocusOutside={event => {
                if (triggerRef.current?.contains(event.target as Node)) event.preventDefault();
              }}
              {...content}
              className="z-50 w-72 rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <Heading className={clsx('leading-none font-semibold', Glyph && 'flex items-center gap-2')}>
                    {Glyph && <Glyph aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
                    {props.label}
                  </Heading>
                  <Subsection>{children}</Subsection>
                </div>
                {slots?.suffix && <div className="-mt-2 -mr-2 flex shrink-0 gap-1">{slots.suffix}</div>}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      );
    },

    // Anchored to its host (popover-host.ts), found from a hidden marker and
    // given to Radix as a virtual anchor.
    Popover: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const marker = useRef<HTMLSpanElement>(null);
      const anchor = useRef({ getBoundingClientRect: () => popoverHost(marker.current)?.getBoundingClientRect() ?? new DOMRect() });
      const opener = useRef<Opener | null>(null);
      const mayTakeFocus = useMayTakeFocus();
      const Heading = useHeading();
      return (
        <Popover.Root open={open ?? false} onOpenChange={setOpen}>
          <span ref={marker} hidden />
          <Popover.Anchor virtualRef={anchor} />
          <Popover.Portal container={scopedPortal()}>
            <Popover.Content
              aria-label={props.title}
              align="start"
              sideOffset={8}
              onOpenAutoFocus={event => {
                opener.current = captureOpener();
                if (!mayTakeFocus(marker.current)) event.preventDefault();
              }}
              onCloseAutoFocus={event => {
                event.preventDefault();
                const active = document.activeElement;
                if (!active || active === document.body) settleFocus(null, opener.current);
                opener.current = null;
              }}
              className="z-50 w-80 max-w-[calc(100vw-2rem)] rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md outline-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-3">
                  <Heading className="leading-none font-semibold">{props.title}</Heading>
                  <Subsection>{children}</Subsection>
                </div>
                {slots?.suffix && <div className="-mt-2 -mr-2 flex shrink-0 gap-1">{slots.suffix}</div>}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      );
    },

    Menu: ({ props, children }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const { trigger, list, closed } = useMenuFocusHandoff(props.focusNext);
      return (
        <DropdownMenu.Root onOpenChange={open => !open && closed()}>
          <DropdownMenu.Trigger
            ref={trigger}
            aria-label={props.label}
            title={props.label}
            className={clsx(buttonBase, buttonVariant.plain, buttonSize[Icon ? 'icon' : 'default'])}
          >
            {Icon ? <Icon aria-hidden="true" /> : props.label}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal container={scopedPortal()}>
            <DropdownMenu.Content
              ref={list}
              align={props.align ?? 'start'}
              sideOffset={4}
              className="z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            >
              <MenuMultiple value={props.multiple ?? false}>{children}</MenuMultiple>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      );
    },

    // A checkbox item in the role of a radio item: Radix's radio items take
    // their state from a group value, and here each item says for itself
    // whether it is the one in force.
    MenuItem: ({ props, emit }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const multiple = useContext(MenuMultiple);
      return (
        <DropdownMenu.CheckboxItem
          role={multiple ? undefined : 'menuitemradio'}
          checked={props.checked ?? false}
          disabled={props.disabled ?? undefined}
          onSelect={event => {
            if (multiple) event.preventDefault();
            void emit('press');
          }}
          className="relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
            <DropdownMenu.ItemIndicator>
              {multiple ? <Check aria-hidden="true" className="size-4" /> : <Circle aria-hidden="true" className="size-2 fill-current" />}
            </DropdownMenu.ItemIndicator>
          </span>
          {Icon && <Icon aria-hidden="true" className="text-muted-foreground" />}
          {props.label}
        </DropdownMenu.CheckboxItem>
      );
    },

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

    // cmdk's filtering is off: the spec decides which candidates show.
    Combobox: ({ props, bindings, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
      const { open, groups, root, label: labelProps, input, list, pick } = useCandidateList(
        props.groups,
        value ?? '',
        setValue,
        () => emit('select'),
        { value: scope, set: setScope },
      );
      return (
        <div className="flex w-full max-w-sm flex-col gap-2">
          {!props.hideLabel && <label {...labelProps} className={label}>{props.label}</label>}
          <Command
            label={props.label}
            {...root}
            className="flex w-full flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
          >
            <div className={clsx('flex h-9 items-center gap-2 px-3', open && 'border-b')}>
              <Search aria-hidden="true" className="size-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder={props.placeholder ?? undefined}
                {...input}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground"
              />
            </div>
            {open && (
              <Command.List {...list} className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
                {groups.map((group, index) => (
                  <Command.Group
                    key={group.heading ?? index}
                    heading={group.heading ?? undefined}
                    className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                  >
                    {group.options.map(option => {
                      const Icon = option.icon ? icons[option.icon] : null;
                      return (
                        <Command.Item
                          key={option.value}
                          value={option.value}
                          onSelect={pick}
                          className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                        >
                          {Icon && <Icon aria-hidden="true" className="size-4 text-muted-foreground" />}
                          {option.label}
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                ))}
              </Command.List>
            )}
          </Command>
        </div>
      );
    },

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

    // A pressed toggle takes the primary fill rather than the accent, which
    // is also the surface of the actor's message, so the selection shows there.
    SelectableTags: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div className="flex flex-col gap-3">
          <div id={id} className={props.hideLabel ? 'sr-only' : label}>{props.label}</div>
          <ToggleGroup.Root
            type="multiple"
            aria-labelledby={id}
            value={value ?? []}
            onValueChange={setValue}
            className="flex flex-wrap items-center gap-2"
          >
            {props.options.map(option => (
              <ToggleGroup.Item
                key={option.value}
                value={option.value}
                className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:bg-input/30 dark:data-[state=on]:bg-primary"
              >
                {option.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>
      );
    },

    // A fixed width, so the track holds inside a message bubble that sizes to
    // its content.
    Slider: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const current = value ?? props.min;
      const id = useId();
      return (
        <div className="flex w-64 max-w-full flex-col gap-2">
          <div className="flex justify-between gap-2">
            <span id={id} className={props.hideLabel ? 'sr-only' : label}>{props.label}</span>
            <span aria-hidden="true" className="ml-auto text-sm text-muted-foreground">{current}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {props.showBounds && <span aria-hidden="true">{props.min}</span>}
            <Slider.Root
              min={props.min}
              max={props.max}
              step={props.step ?? 1}
              value={[current]}
              onValueChange={([next]) => setValue(next ?? props.min)}
              className="relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50"
            >
              <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
                <Slider.Range className="absolute h-full bg-primary" />
              </Slider.Track>
              <Slider.Thumb
                aria-labelledby={id}
                className="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
              />
            </Slider.Root>
            {props.showBounds && <span aria-hidden="true">{props.max}</span>}
          </div>
        </div>
      );
    },

    Checkbox: ({ props, bindings }) => {
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      return <CheckboxField label={props.label} checked={checked ?? false} onChange={setChecked} />;
    },

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

    // Radix returns focus to its Trigger, and a dialog opened from state has
    // none, so the element that had focus when it opened is recorded and
    // focused again on close.
    Dialog: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const opener = useRef<Opener | null>(null);
      const returnTarget = useReturnFocus(props.returnFocus);
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
              // Radix calls this a task after the dialog unmounts, so a window
              // that replaced it has mounted and taken focus by then.
              onCloseAutoFocus={event => {
                event.preventDefault();
                settleFocus(returnTarget(), opener.current);
                opener.current = null;
              }}
              className="fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 text-sm shadow-lg sm:max-w-lg"
            >
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <div className="flex items-center gap-2 pr-6">
                  <Dialog.Title className="flex-1 text-lg leading-none font-semibold text-foreground">{props.title}</Dialog.Title>
                  {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
                </div>
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
    // rule beside it. shadcn's own Drawer is a bottom sheet.
    Drawer: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const opener = useRef<Opener | null>(null);
      const returnTarget = useReturnFocus(props.returnFocus);
      return (
        <Dialog.Root open={open ?? false} onOpenChange={setOpen} modal={false}>
          <Dialog.Portal container={scopedPortal()}>
            <Dialog.Content
              aria-describedby={undefined}
              onInteractOutside={event => event.preventDefault()}
              onOpenAutoFocus={() => {
                opener.current = captureOpener();
              }}
              onCloseAutoFocus={event => {
                event.preventDefault();
                settleFocus(returnTarget(), opener.current);
                opener.current = null;
              }}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l bg-background shadow-lg sm:max-w-sm"
            >
              <div className="flex items-center gap-2 p-4 pr-10">
                <Dialog.Title className="flex-1 font-semibold text-foreground">{props.title}</Dialog.Title>
                {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
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

    MentionEditor: context => (
      <Suspense fallback={null}>
        <ShadcnMentionEditor {...context} />
      </Suspense>
    ),

    // Built for this registry: shadcn has nothing like it, and the catalog
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
