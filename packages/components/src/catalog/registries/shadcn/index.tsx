import {
  Children,
  Fragment,
  Suspense,
  useContext,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { defineRegistry, useBoundProp } from '@json-render/react';
import { createPortal } from 'react-dom';
import {
  Collapsible,
  Dialog,
  DropdownMenu,
  Popover,
  RadioGroup,
  Select,
  Slider,
  Toast,
  ToggleGroup,
  Tooltip,
} from 'radix-ui';
import { Command } from 'cmdk';
import { cn } from './cn';
import {
  Archives,
  SwapVertical,
  SortHighToLow,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUp,
  SortLowToHigh,
  At,
  Verified,
  Bell,
  BookOpen,
  Bookmark,
  Calendar,
  CalendarAvailable,
  CalendarAdd,
  TextFormat,
  Checkmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckmarkInCircle,
  CircleDotted,
  Columns,
  CrossInCircle,
  CarriageReturn,
  Dollar,
  Crown,
  Eraser,
  Eye,
  OpenInNewWindow,
  DocText,
  Folder,
  FolderOpened,
  Globe,
  Layers,
  History,
  Id,
  Information,
  Grid,
  LightBulb,
  Link,
  Filter,
  Loader75,
  MaximizeDiagonal,
  Message,
  Minus,
  Cardboard,
  Clip,
  Plus,
  Puzzle,
  QuotationMarks,
  ViewList,
  Search,
  Signal3,
  Sliders,
  Shop,
  Spreadsheet,
  Sparkles,
  Tag,
  Trash,
  TrendDown,
  TrendUp,
  Warning,
  RotateCcw,
  User,
  RemoveUser,
  Group,
  Wrench,
  Cross,
  Signal1,
  Signal2,
  Alert,
  CircleHalfLeft,
  CalendarPersonal,
  CalendarBusy,
  BarChart,
  ChartPie,
  Clipboard,
  Time,
  TestTube,
  College,
  Megaphone,
  Freehand,
  Presentation,
  Recycle,
  Scroll,
  TruckDelivery,
  ArrowHookLeftUp,
  Copy,
  Pen,
  RotateCw,
  Route,
  type IconComponent,
} from 'iconoteka-react';
import { catalog, toastDuration, type iconNames, type purposes, type tones } from '../../catalog';
import { useCandidateList } from '../../behaviour/candidate-list';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import {
  captureOpener,
  settleFocus,
  useReturnFocus,
  type Opener,
} from '../../behaviour/dialog-focus';
import { errorPrefix, useBoundField, useField, type FieldErrorProps } from '../../behaviour/field';
import { submitForm } from '../../behaviour/form-submit';
import { useFocusHandoff, useMenuFocusHandoff } from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { usePressableTitle } from '../../behaviour/pressable-title';
import { scopedPortal } from './portal';
import { CheckboxField } from './checkbox';
import { CodeField } from './code-input';
import { ComposerField } from './composer-field';
import { ShadcnMentionEditor } from './mention-editor-lazy';
import {
  comboboxAddonEnd,
  comboboxContent,
  comboboxIndicator,
  comboboxInput,
  comboboxInputGroup,
  comboboxItem,
  comboboxList,
  comboboxSeparator,
  comboboxTrigger,
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
  tooltipArrow,
  tooltipContent,
  type Send,
} from './parts';
import { LocationMap } from './map';
import {
  QuestionnaireForm,
  type QuestionnaireAnswers,
  type QuestionnaireItemDef,
} from './questionnaire';
import { RuleBuilder, type RuleTree } from './rule-builder';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { Section, Sections } from './sections';
import { Timeline, TimelineEntry } from './timeline';
import { Bubble, BubbleContent, Message as ShadcnMessage, MessageContent } from './message';
import { TraceList, TraceStep } from './trace-step';
import { Citation } from './citation';
import { useDisclosureOpen, useDisclosureState } from '../../behaviour/disclosure-state';
import { BoardAxis } from '../../behaviour/board-axis';
import { useDisclosureDrop, useDragRow, useStackDrop } from '../../behaviour/drag-drop';
import { MenuMultiple } from '../../behaviour/menu-multiple';
import { Crumb, CrumbOverflow, Trail } from './crumb';
import { DescriptionRows } from './description-rows';
import { DraggableRow } from './draggable-row';
import { FilterTag } from './filter-tag';
import { popoverHost, useMayTakeFocus } from '../../behaviour/popover-host';
import { usePreview } from '../../../components/item-view/use-preview';
import { useSplitRoom } from '../../behaviour/split-room';
import { useToastList } from '../../behaviour/toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from '../../behaviour/mark-tracing';
import { specItemLayout } from '../../behaviour/item-view';
import { referenceMetadataEntries } from '../../../components/item-view/reference-metadata';
import sheetUrl from '../../shadcn.generated.css?url';

// The catalog rendered with shadcn/ui. Every type is built from shadcn's own
// class lists over Radix primitives, which is how shadcn is meant to be used:
// its components are copied into a project, not imported.
//
// The stylesheet is linked by URL, not imported as a module: Astro hoists CSS
// imported anywhere under a client script into every page's <head>, which
// would load Tailwind on pages that never render a shadcn demo. Callers await
// `stylesheet()` before rendering so the first frame is styled. It checks the
// head on every call: ClientRouter removes head elements the next page's HTML
// lacks, which includes this link, so a sheet loaded on an earlier page is gone
// after a navigation.
//
// Tailwind scans this file and every registries/shadcn*.tsx beside it
// (catalog/shadcn.css), so a class written elsewhere is not in the sheet.
// Rebuild the sheet after changing classes:
//   npm run build:shadcn-css

let loading: Promise<void> | undefined;

export function stylesheet(): Promise<void> {
  const selector = 'link[data-registry-sheet="shadcn"]';
  if (loading && document.head.querySelector(selector)) return loading;
  const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: sheetUrl });
  link.dataset.registrySheet = 'shadcn';
  loading = new Promise<void>((resolve, reject) => {
    link.addEventListener('load', () => resolve());
    link.addEventListener('error', () => {
      link.remove();
      reject(new Error(`could not load ${sheetUrl}`));
    });
  });
  document.head.append(link);
  return loading;
}

const gap = { none: 'gap-0', s: 'gap-2', m: 'gap-3', l: 'gap-4' } as const;
const align = {
  start: 'items-start',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
} as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;

export const icons: Record<(typeof iconNames)[number], IconComponent> = {
  'archive': Archives,
  'ascending': SortLowToHigh,
  'attach': Clip,
  'back': ArrowLeft,
  'cancel': Cross,
  'cards': Grid,
  'clear': Eraser,
  'columns': Columns,
  'confirm': Checkmark,
  'copy': Copy,
  'edit': Pen,
  'decrease': TrendDown,
  'delete': Trash,
  'delete-confirm': Trash,
  'descending': SortHighToLow,
  'detail': Columns,
  'document': DocText,
  'example': TextFormat,
  'external': OpenInNewWindow,
  'filter': Filter,
  'full': MaximizeDiagonal,
  'generated': Sparkles,
  'group': Layers,
  'guide': BookOpen,
  'history': History,
  'in-place': ViewList,
  'increase': TrendUp,
  'link': Link,
  'material': Layers,
  'mention': At,
  'more': Plus,
  'move': ArrowLeftRight,
  'next': ChevronRight,
  'notifications': Bell,
  'open': FolderOpened,
  'ownership': Crown,
  'part': Puzzle,
  'people': Group,
  'person': User,
  'plan': Route,
  'popover': Message,
  'previous': ChevronLeft,
  'product': Cardboard,
  'project': Folder,
  'publish': Globe,
  'quote': QuotationMarks,
  'reasoning': LightBulb,
  'regenerate': RotateCw,
  'remove-person': RemoveUser,
  'restore': RotateCcw,
  'rows': ViewList,
  'saved': Bookmark,
  'search': Search,
  'send': CarriageReturn,
  'service': Wrench,
  'settings': Sliders,
  'show': Eye,
  'side-by-side': Columns,
  'sort': SwapVertical,
  'suggest': LightBulb,
  'summary': Id,
  'table': Spreadsheet,
  'transfer': Crown,
  'unchanged': Minus,
  'web': Globe,
  // Attribute names from the entity bindings.
  'assignee': User,
  'availability': Circle,
  'category': Tag,
  'certifications': Verified,
  'channels': Shop,
  'created': CalendarAdd,
  'due': Calendar,
  'labels': Tag,
  'price': Dollar,
  'priority': Signal3,
  'regions': Globe,
  'repairability': Wrench,
  'status': CircleDotted,
  'updated': CalendarAvailable,
  'upgradeability': ArrowUp,
  // Values from fixed lists.
  'date-in-3-days': Calendar,
  'date-in-3-months': CalendarBusy,
  'date-in-a-day': Time,
  'date-in-a-month': CalendarPersonal,
  'date-in-a-week': CalendarAvailable,
  'date-past': History,
  'label-advocacy': Megaphone,
  'label-assessment': ChartPie,
  'label-audit': Clipboard,
  'label-data': BarChart,
  'label-design': Freehand,
  'label-education': BookOpen,
  'label-innovation': LightBulb,
  'label-logistics': TruckDelivery,
  'label-marketing': Presentation,
  'label-optimization': TrendUp,
  'label-policy': Scroll,
  'label-recycling': Recycle,
  'label-refurbishment': Wrench,
  'label-research': TestTube,
  'label-sourcing': Search,
  'label-take-back': ArrowHookLeftUp,
  'label-training': College,
  'label-waste-reduction': Trash,
  'priority-high': Signal3,
  'priority-low': Signal1,
  'priority-medium': Signal2,
  'priority-urgent': Alert,
  'status-backlog': CircleDotted,
  'status-cancelled': CrossInCircle,
  'status-done': CheckmarkInCircle,
  'status-in-progress': CircleHalfLeft,
  'status-in-review': Eye,
  'status-todo': Circle,
  'unassigned': RemoveUser,
};

type Purpose = (typeof purposes)[number];
const purposeIcons: Record<Purpose, IconComponent> = {
  info: Information,
  success: CheckmarkInCircle,
  warning: Warning,
  danger: CrossInCircle,
};
const purposeText: Record<Purpose, string> = {
  info: 'text-blue-700 dark:text-blue-300',
  success: 'text-green-700 dark:text-green-300',
  warning: 'text-yellow-700 dark:text-yellow-300',
  danger: 'text-destructive',
};
const purposeSurface: Record<Purpose, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
  success:
    'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
  warning:
    'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
  danger: 'bg-card text-destructive',
};

type Tone = (typeof tones)[number];
// shadcn/ui Badge (radix-nova). Nova's destructive badge is a tint rather
// than a fill, and success follows it in green.
const badgeFill: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  accent: 'bg-primary text-primary-foreground',
  success: 'bg-green-600/10 text-green-700 dark:bg-green-400/20 dark:text-green-300',
  danger: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
};
const badgeBase =
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!';
const badgeOutline: Record<Tone, string> = {
  neutral: 'text-foreground',
  accent: 'border-primary text-foreground',
  success: purposeText.success,
  danger: purposeText.danger,
};
// A filled badge, or an outlined one, as a Badge with an icon reads. Nova's
// badge is a pill; a badge not asked to be one keeps the corners of Nova's
// controls, so the two still differ.
const badgeClass = (tone: Tone, outline: boolean, pill?: boolean | null) =>
  cn(
    badgeBase,
    pill ? 'rounded-4xl' : 'rounded-md',
    outline ? ['border-border', badgeOutline[tone]] : ['border-transparent', badgeFill[tone]],
  );

// The custom attributes this library can show in an ItemView, keyed
// `type.path` as pp's registered components are.
const customAttributes: Record<string, (item: object) => ReactNode> = {
  'reference.metadata': (item) => <DescriptionRows rows={referenceMetadataEntries(item)} />,
};

// shadcn/ui Button (radix-nova), variants and sizes as published: default is
// shadcn's outline, primary its default, plain its ghost, danger its
// destructive. The link variant is this registry's own, muted until hovered.
// A leading icon carries data-icon="inline-start", which trims the padding.
const buttonBase =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const buttonVariant = {
  default:
    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
  plain:
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
  danger:
    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
  link: 'text-muted-foreground underline underline-offset-4 hover:text-foreground',
} as const;
const buttonSize = {
  'default': 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  'sm': "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
  'icon': 'size-8',
  'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)]',
} as const;
// The close button of a Dialog or a Sheet: a ghost icon-sm Button.
const closeButton = cn(buttonBase, buttonVariant.plain, buttonSize['icon-sm']);

const markClass = 'rounded-sm bg-yellow-200/70 px-1 text-foreground dark:bg-yellow-800/60';

// shadcn/ui Label (radix-nova).
const label =
  'flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50';
const fieldError = (props: FieldErrorProps, message: string) => (
  <p {...props} className="text-sm text-destructive">
    <span className="sr-only">{errorPrefix}</span> {message}
  </p>
);

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
          className={cn(
            'flex',
            horizontal ? 'flex-row flex-wrap' : 'flex-col',
            horizontal && props.justify === 'end' && 'justify-end',
            gap[props.gap ?? 'm'],
            align[props.align ?? (horizontal ? 'center' : 'stretch')],
            props.dropTarget && 'rounded-xl',
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
      const titleButton = usePressableTitle(props, emit);
      const Heading = useHeading();
      const above = props.opens && 'relative z-10';
      const Icon = props.icon ? icons[props.icon] : null;
      const dragRef = useRef<HTMLDivElement>(null);
      const dragging = useDragRow(dragRef, props.dragId, props.dragId != null);
      return (
        <div
          ref={dragRef}
          className={cn(
            'group/card flex flex-col gap-4 rounded-xl py-4 text-sm text-card-foreground has-data-[slot=card-footer]:pb-0 has-data-[slot=stat]:gap-2',
            props.emphasis && props.emphasis !== 'full'
              ? 'border border-dashed bg-transparent'
              : 'bg-card ring-1 ring-foreground/10',
            props.opens && 'relative',
            props.selected && 'ring-2 ring-primary',
            props.dragId != null && 'cursor-grab',
            dragging && 'opacity-50',
            props.emphasis === 'faint' && 'text-muted-foreground',
          )}
          data-popover-host=""
        >
          {(props.title || slots?.suffix) && (
            <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]">
              {props.title && (
                <Heading
                  data-slot="card-title"
                  className={cn(
                    'text-base leading-snug font-medium group-has-data-[slot=stat]/card:text-sm group-has-data-[slot=stat]/card:leading-snug group-has-data-[slot=stat]/card:font-normal group-has-data-[slot=stat]/card:text-muted-foreground',
                    Icon && 'flex items-start gap-2',
                  )}
                >
                  {Icon && (
                    <span className="flex h-lh shrink-0 items-center">
                      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                    </span>
                  )}
                  {props.opens ? (
                    <button
                      {...titleButton}
                      className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-xl hover:underline focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                    >
                      {props.title}
                    </button>
                  ) : (
                    props.title
                  )}
                </Heading>
              )}
              {slots?.suffix && (
                <div
                  data-slot="card-action"
                  className={cn(
                    'col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end',
                    above,
                  )}
                >
                  {slots.suffix}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-1 flex-col gap-3 px-4">
            {slots?.attributes && (
              <div
                className={cn(
                  'flex flex-wrap items-center gap-2',
                  props.opens && '[&_button]:relative [&_button]:z-10',
                )}
              >
                {slots.attributes}
              </div>
            )}
            <Subsection>{children}</Subsection>
          </div>
          {slots?.actions && (
            <div
              data-slot="card-footer"
              className={cn(
                'flex items-center justify-end gap-2 rounded-b-xl border-t bg-muted/50 p-4 not-last:rounded-b-none [&>p]:mr-auto',
                above,
              )}
            >
              {slots.actions}
            </div>
          )}
          {props.expanded && slots?.detail && (
            <div className="relative flex flex-col gap-3 border-t px-4 pt-4 group-has-data-[slot=card-footer]/card:pb-4">
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
          className={
            room
              ? 'grid auto-cols-[minmax(0,1fr)] grid-flow-col items-start gap-4'
              : 'flex flex-col gap-4'
          }
        >
          {Children.map(children, (child) => (
            <div className="@container/demo min-w-0 empty:hidden">{child}</div>
          ))}
        </div>
      );
    },

    Split: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div
          ref={ref}
          className={
            props.split && room
              ? 'grid grid-cols-[minmax(0,3fr)_minmax(16rem,2fr)] items-start gap-4'
              : 'flex flex-col gap-4'
          }
        >
          {children}
        </div>
      );
    },

    Text: ({ props, children }) => {
      const text = props.highlight ? <mark className={markClass}>{props.text}</mark> : props.text;
      const purpose = props.pending ? null : props.purpose;
      const Icon = props.pending ? Loader75 : purpose ? purposeIcons[purpose] : null;
      if (props.inline) {
        return (
          <span className={cn(props.muted && 'text-muted-foreground')}>
            {text}
            {children && <> {children}</>}
          </span>
        );
      }
      return (
        <p
          className={cn(
            props.size === 'small'
              ? 'text-xs'
              : props.size === 'large'
                ? 'text-2xl font-semibold tracking-tight'
                : 'text-sm',
            (purpose || props.pending) && 'flex items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0',
            purpose
              ? [purposeText[purpose], props.size !== 'large' && 'font-medium']
              : (props.muted || props.pending) && 'text-muted-foreground',
          )}
          role={props.status ? 'status' : undefined}
        >
          {Icon && (
            <Icon
              aria-hidden="true"
              className={cn(props.pending && 'animate-spin motion-reduce:animate-none')}
            />
          )}
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
          className={cn(
            'relative grid w-full grid-cols-[auto_1fr] items-start gap-x-2 gap-y-0.5 rounded-lg border px-2.5 py-2 text-left text-sm *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*=size-])]:size-4',
            props.purpose ? purposeSurface[props.purpose] : 'bg-card text-card-foreground',
          )}
        >
          <Icon aria-hidden="true" className="row-span-2" />
          {props.title && <div className="col-start-2 font-medium">{props.title}</div>}
          <div
            className={cn(
              'col-start-2 text-sm text-balance md:text-pretty',
              !props.purpose && 'text-muted-foreground',
            )}
          >
            {props.text}
          </div>
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
        <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance">
          <div className="flex max-w-sm flex-col items-center gap-2">
            {Icon && (
              <div className="mb-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                <Icon aria-hidden="true" />
              </div>
            )}
            <Heading className="text-sm font-medium tracking-tight">{props.title}</Heading>
            {props.description && (
              <div className="text-sm/relaxed text-muted-foreground">{props.description}</div>
            )}
          </div>
          {slots?.actions && (
            <div className="flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance">
              <div className="flex gap-2">{slots.actions}</div>
            </div>
          )}
        </div>
      );
    },

    Sections: ({ props, children }) => (
      <Sections affordance={props.affordance}>{children}</Sections>
    ),

    Section: ({ props, children }) => <Section title={props.title}>{children}</Section>,

    Board: ({ props, children }) => (
      <BoardAxis.Provider value={props.axis}>
        <div
          className={
            props.axis === 'lanes'
              ? 'flex items-start gap-3 overflow-x-auto pb-2'
              : 'flex flex-col gap-3'
          }
        >
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
          className={cn(
            'flex flex-col gap-2',
            axis && 'rounded-xl bg-muted/50 p-2',
            axis === 'lanes' && (open ? 'w-72 shrink-0' : 'shrink-0'),
            over && 'ring-2 ring-ring',
          )}
        >
          <Collapsible.Trigger
            data-slot="collapsible-trigger"
            className="flex items-center gap-2 rounded-lg px-1 py-2 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 [&[data-state=open]>svg]:rotate-90"
          >
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
            />
            {props.title}
            {props.count != null && (
              <span className={badgeClass('neutral', false)}>{props.count}</span>
            )}
          </Collapsible.Trigger>
          <Collapsible.Content
            data-slot="collapsible-content"
            className={cn(
              axis === 'lanes' && 'grid gap-2',
              axis === 'sections' && 'grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2',
              !axis && 'flex flex-col gap-4',
              axis && 'empty:min-h-16 empty:rounded-lg empty:border empty:border-dashed',
            )}
          >
            {children}
          </Collapsible.Content>
        </Collapsible.Root>
      );
    },

    BulletList: ({ props }) => (
      <ul className="ml-6 list-disc text-sm [&>li]:mt-1">
        {props.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ),

    // Stacks below 24rem of demo width, where the pp list does.
    DescriptionList: ({ props }) =>
      props.draggable ? (
        <dl className="grid grid-cols-1 text-sm @sm/demo:grid-cols-[max-content_1fr]">
          {props.items.map((item) => (
            <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />
          ))}
        </dl>
      ) : (
        <DescriptionRows
          rows={props.items.map((item) => ({
            key: item.label,
            label: item.label,
            text: item.value,
          }))}
        />
      ),

    // Laid out by layoutByRole, as in the pp registry; the slots map onto
    // this library's Badge, Text and DescriptionList markup.
    ItemView: ({ props }) => {
      const { item } = props;
      const layout = specItemLayout(props.type, item, props.scope, props.shownAttributes);
      if (!layout || !item) return null;
      if (props.scope === 'micro') {
        return <span className={badgeClass('neutral', false)}>{layout.title}</span>;
      }
      const line = (entry: { key: string; text: string }, className: string) => (
        <p key={entry.key} className={className}>
          {entry.text}
        </p>
      );
      const badges = layout.badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {layout.badges.map((badge) => (
            <span key={badge.key} className={badgeClass('neutral', false)}>
              {badge.label && <span className="opacity-70">{badge.label}</span>}
              {badge.text}
            </span>
          ))}
        </div>
      );
      // A summary leads with its key figure at body size and ends with its
      // badges, as pp's does; a fuller view leads with the badges.
      const mini = props.scope === 'mini';
      return (
        <div className={cn('flex flex-col', mini ? 'gap-2' : 'gap-4')}>
          {!mini && badges}
          {layout.keyAttributes.map((entry) =>
            line(entry, mini ? 'text-sm font-semibold' : 'text-2xl font-semibold tracking-tight'),
          )}
          {layout.subtitles.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
          {layout.descriptions.map((entry) => line(entry, 'text-sm'))}
          {mini && badges}
          {layout.captions.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
          {layout.rows.length > 0 && <DescriptionRows rows={layout.rows} />}
          {layout.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {layout.tags.map((tag) => (
                <span key={tag.key} className={badgeClass('neutral', true)}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}
          {layout.footers.map((entry) => line(entry, 'text-sm text-muted-foreground'))}
          {layout.customs.map((attribute) => {
            const render = customAttributes[`${props.type}.${attribute.path}`];
            return render ? (
              <Fragment key={attribute.path}>{render(item)}</Fragment>
            ) : (
              <p key={attribute.path} className="spec-demo__unsupported" role="note">
                This library has no component for {attribute.label ?? attribute.path}.
              </p>
            );
          })}
        </div>
      );
    },

    Breadcrumbs: ({ props, bindings, emit }) => {
      const [, setPicked] = useBoundProp(props.picked, bindings?.picked);
      const pick = (id: string) => {
        setPicked(id);
        emit('pick');
      };
      const [first, ...middle] = props.items;
      return (
        <Trail label={props.label}>
          {first && (
            <Crumb key={first.id} label={first.label} stage="first" onPick={() => pick(first.id)} />
          )}
          {first && <CrumbOverflow items={props.items} middle={middle.length > 0} onPick={pick} />}
          {middle.map((item) => (
            <Crumb key={item.id} label={item.label} stage="middle" onPick={() => pick(item.id)} />
          ))}
          <li className="inline-flex min-w-0 items-center gap-1">
            <span
              role="link"
              aria-disabled="true"
              aria-current="page"
              className="font-normal text-foreground group-data-[collapsed=all]/trail:truncate"
            >
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
        className="relative w-full overflow-x-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors">
              {props.columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
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

    TableRow: ({ children }) => (
      <tr className="border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50">
        {children}
      </tr>
    ),

    TableCell: ({ props, children }) => (
      <td
        className={cn('p-2 align-middle whitespace-nowrap', props.align === 'end' && 'text-right')}
      >
        {props.text}
        {children}
      </td>
    ),

    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="flex flex-col gap-4 text-sm">{children}</div>
      </TracingProvider>
    ),

    // AI Elements' Message: the actor's text is a muted Bubble at the end, the
    // other side's reply sits on the Message without one, and the children
    // follow the text. Each Message brings the tooltip provider, so a Message
    // renders outside Messages too.
    Message: ({ props, children, slots }) => {
      const tracing = useMarkTracing(props.parts);
      const actor = props.from === 'actor';
      const runs = props.parts.map((part, index) => {
        if (typeof part === 'string') return part;
        const { dimmed, linkedTo, handlers } = tracing(index);
        const className = cn(
          markClass,
          'transition-colors data-dimmed:bg-transparent dark:data-dimmed:bg-transparent',
          (part.note || part.link) &&
            'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          part.note && 'cursor-help underline decoration-dotted underline-offset-4',
        );
        const mark = (
          <mark
            key={index}
            tabIndex={part.note ? 0 : undefined}
            data-dimmed={dimmed || undefined}
            {...handlers}
            className={className}
          >
            {part.text}
            {linkedTo.length > 0 && (
              <span className="sr-only">, linked to: {linkedTo.join('; ')}</span>
            )}
          </mark>
        );
        if (!part.note) return mark;
        return (
          <Tooltip.Root key={index}>
            <Tooltip.Trigger asChild>{mark}</Tooltip.Trigger>
            <Tooltip.Portal container={scopedPortal()}>
              <Tooltip.Content sideOffset={4} className={tooltipContent}>
                {part.note}
                <Tooltip.Arrow className={tooltipArrow} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        );
      });
      const text =
        props.parts.length === 0 ? null : actor ? (
          <Bubble align="end">
            <BubbleContent>{runs}</BubbleContent>
          </Bubble>
        ) : (
          <p className="leading-relaxed text-foreground">{runs}</p>
        );
      return (
        <Tooltip.Provider delayDuration={150}>
          <ShadcnMessage align={actor ? 'end' : 'start'}>
            <MessageContent>
              {text}
              {children &&
                (actor ? <div className="w-fit max-w-[80%] self-end">{children}</div> : children)}
              {(slots?.status || slots?.actions) && (
                // AI Elements' MessageActions, revealed as chat products
                // reveal them: on hover or focus, and always without hover.
                <div
                  className={cn(
                    // Pulled out by an icon button's inset, so the icons line
                    // up with the edge of the text.
                    '-mt-1.5 flex items-center gap-1 text-muted-foreground',
                    actor ? '-mr-2 self-end' : '-ml-2 self-start',
                  )}
                >
                  {slots.status}
                  {slots.actions && (
                    <div className="flex items-center gap-1 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within/message:opacity-100 [@media(hover:hover)]:group-hover/message:opacity-100">
                      {slots.actions}
                    </div>
                  )}
                </div>
              )}
            </MessageContent>
          </ShadcnMessage>
        </Tooltip.Provider>
      );
    },

    Composer: ({ props, slots, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return (
        <div className="flex flex-col gap-1 rounded-xl border border-input bg-background p-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
          {slots?.field ? (
            <ComposerField value>{slots.field}</ComposerField>
          ) : (
            <input
              aria-label={props.label ?? undefined}
              placeholder={props.placeholder ?? undefined}
              value={value ?? ''}
              onChange={(event) => setValue(event.target.value)}
              className="h-8 w-full min-w-0 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
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

    Timeline: ({ props, children }) => (
      <Timeline density={props.density ?? 'normal'}>{children}</Timeline>
    ),

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

    Trace: ({ children }) => <TraceList>{children}</TraceList>,

    TraceLine: ({ props, children, bindings }) => {
      const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
      return (
        <TraceStep
          title={props.title}
          detail={props.detail ?? null}
          icon={props.icon ? icons[props.icon] : null}
          status={props.status ?? null}
          href={props.href ?? null}
          expandable={props.expandable ?? false}
          open={open}
          onOpenChange={setOpen}
        >
          {children}
        </TraceStep>
      );
    },

    // AI Elements' Checkpoint: the label and its Restore button centred
    // between two rules (pseudo-elements standing in for its separator), the
    // button a small outline pill.
    Marker: ({ props, slots }) => {
      const id = useId();
      return (
        <div
          role="group"
          aria-labelledby={id}
          className="flex w-full min-w-0 items-center gap-2 text-sm text-muted-foreground before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border"
        >
          <span id={id} className="min-w-0 shrink text-center wrap-break-word">
            {props.label}
          </span>
          {slots?.actions && (
            <span className="flex items-center gap-1 empty:hidden [&_button]:h-7 [&_button]:rounded-full [&_button]:px-3 [&_button]:text-xs [&_button]:text-muted-foreground [&_button]:hover:text-foreground">
              {slots.actions}
            </span>
          )}
        </div>
      );
    },

    // AI Elements' CodeBlock, without its highlighting or its header.
    CodeBlock: ({ props }) => (
      <pre
        className="m-0 min-w-0 overflow-x-auto rounded-md border bg-muted/50 p-3 font-mono text-xs text-foreground"
        data-language={props.language ?? undefined}
      >
        <code>{props.code}</code>
      </pre>
    ),

    Citation: ({ props }) => (
      <Citation
        label={props.label}
        title={props.title}
        description={props.description ?? null}
        href={props.href}
      />
    ),

    List: ({ props, children }) => (
      <ul
        className={cn(
          'divide-y rounded-xl bg-card text-card-foreground',
          !props.borderless && 'ring-1 ring-foreground/10',
        )}
      >
        {children}
      </ul>
    ),

    // An unbound checkbox still ticks on a press, but only in the row.
    ListItem: ({ props, children, slots, bindings }) => {
      const [bound, setBound] = useBoundProp(props.checked, bindings?.checked);
      const [local, setLocal] = useState(Boolean(props.checked));
      const checked = bindings?.checked ? (bound ?? false) : local;
      const Icon = props.icon ? icons[props.icon] : null;
      const glyph = Icon && (
        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      );
      return (
        <li className="flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm">
          <span
            className={cn(
              glyph && !props.checkbox && 'flex items-center gap-2',
              props.struck && 'text-muted-foreground line-through',
            )}
          >
            {!props.checkbox && glyph}
            {props.description ? (
              <span className="flex flex-col gap-0.5">
                <span>{props.label}</span>
                <span className="text-xs text-muted-foreground">{props.description}</span>
              </span>
            ) : props.checkbox ? (
              <CheckboxField
                label={props.label}
                icon={glyph}
                checked={checked}
                onChange={bindings?.checked ? setBound : setLocal}
              />
            ) : (
              props.label
            )}
          </span>
          {children}
          {slots?.suffix && <span className="flex items-center gap-1">{slots.suffix}</span>}
        </li>
      );
    },

    ItemGroup: ({ props, children }) => (
      <div
        role="list"
        aria-label={props.label ?? undefined}
        data-slot="item-group"
        className="group/item-group flex flex-col"
      >
        {children}
      </div>
    ),

    // Each item draws its own separator, hidden on the first: a repeat
    // reaches the group as one child, so the group cannot place them. As on
    // a Card, the title button's ::after covers the row.
    Item: ({ props, slots, emit }) => {
      const titleButton = usePressableTitle(props, emit, { focusEvents: true });
      const Heading = useHeading();
      const detail = props.expanded && slots?.detail;
      return (
        <div
          role="listitem"
          className="group/row"
          onPointerEnter={() => emit('focus')}
          onPointerLeave={() => emit('blur')}
        >
          <div
            data-slot="item-separator"
            role="none"
            className="h-px shrink-0 bg-border group-first/row:hidden"
          />
          <div
            data-slot="item"
            data-popover-host=""
            className={cn(
              'group/item flex w-full flex-wrap items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors duration-100 outline-none',
              props.opens && 'relative',
              props.opens && !detail && 'hover:bg-muted',
              props.focused && 'bg-muted',
              props.selected ? 'border-primary ring-1 ring-primary' : 'border-transparent',
            )}
          >
            <div data-slot="item-content" className="flex flex-1 flex-col gap-1">
              <Heading
                data-slot="item-title"
                className="flex w-fit items-center gap-2 text-sm leading-snug font-medium"
              >
                {props.opens ? (
                  <button
                    {...titleButton}
                    className="cursor-pointer text-left underline-offset-4 outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                  >
                    {props.title}
                  </button>
                ) : (
                  props.title
                )}
                {slots?.titleSuffix}
              </Heading>
              {props.description && (
                <p
                  data-slot="item-description"
                  className="text-left text-sm leading-normal font-normal text-balance text-muted-foreground"
                >
                  {props.description}
                </p>
              )}
              {slots?.attributes && (
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-2',
                    props.opens && '[&_button]:relative [&_button]:z-10',
                  )}
                >
                  {slots.attributes}
                </div>
              )}
            </div>
            {slots?.suffix && (
              <div
                data-slot="item-actions"
                className={cn('flex items-center gap-2', props.opens && 'relative z-10')}
              >
                {slots.suffix}
              </div>
            )}
            {detail && (
              <div
                data-slot="item-footer"
                className="relative flex basis-full flex-col gap-3 border-t pt-2.5"
              >
                <Subsection>{slots.detail}</Subsection>
              </div>
            )}
          </div>
        </div>
      );
    },

    Stat: ({ props }) => (
      <div data-slot="stat" className="flex flex-col text-sm">
        <p className={cn('text-3xl font-semibold tabular-nums', props.alert && 'text-destructive')}>
          {props.value}
          {props.unit && (
            <span className="text-sm font-normal text-muted-foreground"> {props.unit}</span>
          )}
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
          className={cn(
            props.pressable &&
              'cursor-pointer outline-none hover:opacity-80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            badgeClass(tone, Boolean(Icon), props.pill),
            props.pulse && 'animate-pulse',
          )}
        >
          {props.label && <span className="opacity-70">{props.label}</span>}
          {Icon && <Icon aria-hidden="true" />}
          {props.text}
        </Root>
      );
    },

    // A pill Badge without overflow-hidden, which would clip the remove
    // button's focus ring.
    Tag: ({ props, emit }) => {
      const removeRef = useFocusHandoff(props.focusNext);
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      const Icon = props.pending ? Loader75 : props.icon ? icons[props.icon] : null;
      const Root = props.opens ? 'button' : 'span';
      return (
        <Root
          ref={props.opens ? openRef : undefined}
          type={props.opens ? 'button' : undefined}
          data-focus-key={(props.opens && props.focusKey) || undefined}
          onClick={props.opens ? () => emit('open') : undefined}
          className={cn(
            badgeClass('neutral', false, true),
            'overflow-visible',
            props.opens &&
              'cursor-pointer outline-none hover:bg-secondary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          )}
        >
          {Icon && (
            <Icon
              aria-hidden="true"
              className={cn(props.pending && 'animate-spin motion-reduce:animate-none')}
            />
          )}
          <span className={props.pending ? 'text-muted-foreground' : undefined}>{props.label}</span>
          {props.removeLabel && !props.opens && (
            <button
              ref={removeRef}
              type="button"
              aria-label={props.removeLabel}
              data-focus-key={props.focusKey ?? undefined}
              onClick={() => emit('remove')}
              className="-mr-1 rounded-full p-0.5 opacity-70 outline-none hover:bg-foreground/10 hover:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:size-3"
            >
              <Cross aria-hidden="true" />
            </button>
          )}
        </Root>
      );
    },

    FilterTag: (context) => (
      <FilterTag
        {...context}
        Glyph={context.props.icon ? icons[context.props.icon] : null}
        iconFor={(name) => icons[name]}
      />
    ),

    Map: ({ props, bindings, emit }) => {
      const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
      const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
      return (
        <LocationMap
          label={props.label}
          locations={props.locations}
          selected={selected ?? null}
          onSelect={(id) => {
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
      const { triggerRef, contentRef, trigger, content, close } = usePreview(
        shown ?? false,
        setShown,
        props.expanded ?? false,
      );
      const Heading = useHeading();
      const Glyph = props.icon ? icons[props.icon] : null;
      return (
        <Popover.Root open={shown ?? false} onOpenChange={(open) => !open && close()}>
          <Popover.Anchor asChild>
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={props.expanded ?? false}
              data-focus-key={props.focusKey ?? undefined}
              {...trigger}
              onClick={() => {
                close();
                emit('open');
              }}
              className="cursor-pointer rounded-sm bg-primary/10 px-1 font-medium text-primary outline-none hover:bg-primary/15 focus-visible:ring-3 focus-visible:ring-ring/50"
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
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              // The reference is the anchor, not a Radix trigger, so focus
              // moving back to it would count as leaving.
              onFocusOutside={(event) => {
                if (triggerRef.current?.contains(event.target as Node)) event.preventDefault();
              }}
              {...content}
              className={cn(popoverSurface, 'w-72')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2.5">
                  <Heading
                    className={cn('leading-snug font-medium', Glyph && 'flex items-center gap-2')}
                  >
                    {Glyph && (
                      <Glyph aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    {props.label}
                  </Heading>
                  <Subsection>{children}</Subsection>
                </div>
                {slots?.suffix && (
                  <div className="-mt-1.5 -mr-1.5 flex shrink-0 gap-1">{slots.suffix}</div>
                )}
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
      const anchor = useRef({
        getBoundingClientRect: () =>
          popoverHost(marker.current)?.getBoundingClientRect() ?? new DOMRect(),
      });
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
              onOpenAutoFocus={(event) => {
                opener.current = captureOpener();
                if (!mayTakeFocus(marker.current)) event.preventDefault();
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                const active = document.activeElement;
                if (!active || active === document.body) settleFocus(null, opener.current);
                opener.current = null;
              }}
              className={cn(popoverSurface, 'w-80 max-w-[calc(100vw-2rem)]')}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2.5">
                  <Heading className="leading-snug font-medium">{props.title}</Heading>
                  <Subsection>{children}</Subsection>
                </div>
                {slots?.suffix && (
                  <div className="-mt-1.5 -mr-1.5 flex shrink-0 gap-1">{slots.suffix}</div>
                )}
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
        <DropdownMenu.Root onOpenChange={(open) => !open && closed()}>
          <DropdownMenu.Trigger
            ref={trigger}
            aria-label={props.label}
            title={props.label}
            data-focus-key={props.focusKey ?? undefined}
            className={cn(buttonBase, buttonVariant.plain, buttonSize[Icon ? 'icon' : 'default'])}
          >
            {Icon ? <Icon aria-hidden="true" /> : props.label}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal container={scopedPortal()}>
            <DropdownMenu.Content
              ref={list}
              align={props.align ?? 'start'}
              sideOffset={4}
              className={menuContent}
            >
              <MenuMultiple value={props.multiple ?? false}>{children}</MenuMultiple>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      );
    },

    // A checkbox item in the role of a radio item: Radix's radio items take
    // their state from a group value, and here each item says for itself
    // whether it is the one in force. Nova ticks both kinds on the right.
    MenuItem: ({ props, emit }) => {
      const Icon = props.icon ? icons[props.icon] : null;
      const multiple = useContext(MenuMultiple);
      return (
        <DropdownMenu.CheckboxItem
          role={multiple ? undefined : 'menuitemradio'}
          checked={props.checked ?? false}
          disabled={props.disabled ?? undefined}
          onSelect={(event) => {
            if (multiple) event.preventDefault();
            void emit('press');
          }}
          className={menuCheckItem}
        >
          {Icon && <Icon aria-hidden="true" className="text-muted-foreground" />}
          {props.label}
          <span className={menuIndicator}>
            <DropdownMenu.ItemIndicator>
              <Checkmark aria-hidden="true" />
            </DropdownMenu.ItemIndicator>
          </span>
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
          data-focus-key={props.focusKey ?? undefined}
          className={cn(
            buttonBase,
            buttonVariant[props.variant ?? 'default'],
            props.variant === 'link'
              ? 'h-auto self-start p-0 align-baseline'
              : buttonSize[props.hideLabel && Icon ? 'icon' : 'default'],
          )}
          disabled={props.disabled ?? undefined}
          aria-expanded={props.expanded ?? undefined}
          aria-label={props.hideLabel ? props.label : undefined}
          data-autofocus={props.initialFocus || undefined}
          onClick={() => emit('press')}
        >
          {Icon && (
            <Icon
              aria-hidden="true"
              data-icon={props.hideLabel ? undefined : 'inline-start'}
              fill={props.icon === 'delete-confirm' ? 'currentColor' : 'none'}
            />
          )}
          {!props.hideLabel && props.label}
        </button>
      );
    },

    Input: ({ props, bindings }) => {
      const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
      return (
        <div className="flex flex-col gap-2">
          {!props.hideLabel && (
            <label htmlFor={id} className={label}>
              {props.label}
            </label>
          )}
          <input
            {...control}
            type={props.type ?? 'text'}
            aria-label={props.hideLabel ? props.label : undefined}
            aria-invalid={error ? true : undefined}
            placeholder={props.placeholder ?? undefined}
            data-autofocus={props.initialFocus || undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
          />
          {error && fieldError(errorProps, error)}
        </div>
      );
    },

    CodeInput: ({ props, bindings, slots, emit }) => {
      const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={id} className={label}>
              {props.label}
            </label>
            {slots?.action}
          </div>
          <CodeField
            control={control}
            length={props.length}
            groups={props.groups}
            value={value}
            onChange={setValue}
            onComplete={() => emit('complete')}
            invalid={Boolean(error)}
            initialFocus={props.initialFocus ?? undefined}
          />
          {error && fieldError(errorProps, error)}
        </div>
      );
    },

    // shadcn/ui Tooltip on a ghost icon Button, as Claude marks a note beside
    // the buttons that close its message editor.
    InfoTip: ({ props }) => (
      <Tooltip.Provider delayDuration={150}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              aria-label={props.label}
              className={cn(
                buttonBase,
                buttonVariant.plain,
                buttonSize.icon,
                'text-muted-foreground',
              )}
            >
              <Information aria-hidden="true" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal container={scopedPortal()}>
            <Tooltip.Content sideOffset={4} className={tooltipContent}>
              {props.text}
              <Tooltip.Arrow className={tooltipArrow} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    ),

    Textarea: ({ props, bindings }) => {
      const { id, value, setValue } = useBoundField(props, bindings);
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className={props.hideLabel ? 'sr-only' : label}>
            {props.label}
          </label>
          <textarea
            id={id}
            placeholder={props.placeholder ?? undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
          />
        </div>
      );
    },

    Select: ({ props, bindings }) => {
      const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
      return (
        <div className="flex flex-col gap-2">
          <label htmlFor={id} className={label}>
            {props.label}
          </label>
          <Select.Root value={value} onValueChange={setValue}>
            <Select.Trigger
              {...control}
              aria-invalid={error ? true : undefined}
              className="flex h-8 w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <Select.Value placeholder={props.placeholder ?? undefined} />
              <Select.Icon asChild>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none size-4 text-muted-foreground"
                />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal container={scopedPortal()}>
              <Select.Content
                position="popper"
                sideOffset={4}
                className="relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
              >
                <Select.Viewport className="h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1 p-1">
                  {props.options.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className={cn(menuCheckItem, 'w-full')}
                    >
                      <span className={cn(menuIndicator, 'size-4')}>
                        <Select.ItemIndicator>
                          <Checkmark aria-hidden="true" />
                        </Select.ItemIndicator>
                      </span>
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          {error && fieldError(errorProps, error)}
        </div>
      );
    },

    // cmdk's filtering is off: the spec decides which candidates show.
    Combobox: ({ props, bindings, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
      const [shown, setShown] = useState(false);
      const show = (next: boolean) => {
        setShown(next);
        if (next) return;
        close();
        setValue('');
      };
      const {
        open,
        groups,
        root,
        label: labelProps,
        input,
        list,
        pick,
        close,
        toggle,
      } = useCandidateList(
        props.groups,
        value ?? '',
        setValue,
        // Inline, the picked value stays in the field. In a popup, Radix does
        // not report a close it is told to make, so the field is emptied here,
        // once `select` has run: its later steps can still read the picked value.
        () => {
          if (!props.popup) {
            void emit('select');
            return;
          }
          setShown(false);
          void Promise.resolve(emit('select')).finally(() => setValue(''));
        },
        { value: scope, set: setScope },
        props.popup ?? false,
      );
      const status = props.status;
      const purpose = status?.pending ? null : status?.purpose;
      const StatusIcon = status?.pending ? Loader75 : purpose ? purposeIcons[purpose] : null;
      const statusLine = status && (
        <p
          role="status"
          className={cn(
            'flex items-center gap-2 text-xs [&>svg]:size-3.5 [&>svg]:shrink-0',
            status.text && 'px-2 py-1.5',
            purpose ? purposeText[purpose] : 'text-muted-foreground',
          )}
        >
          {status.text && StatusIcon && (
            <StatusIcon
              aria-hidden="true"
              className={cn(status.pending && 'animate-spin motion-reduce:animate-none')}
            />
          )}
          {status.text}
        </p>
      );
      const item = (
        option: (typeof groups)[number]['options'][number],
        itemClass: string,
        checked?: boolean,
      ) => {
        const Icon = option.icon ? icons[option.icon] : null;
        return (
          <Command.Item
            key={option.value}
            value={option.value}
            onSelect={pick}
            className={itemClass}
          >
            {Icon && <Icon aria-hidden="true" className="text-muted-foreground" />}
            {option.label}
            {checked && (
              <span className={comboboxIndicator}>
                <Checkmark aria-hidden="true" />
              </span>
            )}
          </Command.Item>
        );
      };
      const field = props.popup ? (
        <Command
          label={props.label}
          {...root}
          className="flex w-full flex-col overflow-hidden bg-popover text-popover-foreground"
        >
          <div className={commandInputWrapper}>
            <div className={commandInputGroup}>
              <Search aria-hidden="true" className={commandSearchIcon} />
              <Command.Input
                placeholder={props.placeholder ?? undefined}
                {...input}
                className={commandInput}
              />
            </div>
          </div>
          {open && (
            <Command.List {...list} className={commandList}>
              {groups.map((group, index) => (
                <Command.Group
                  key={group.heading ?? index}
                  heading={group.heading ?? undefined}
                  className={commandGroup}
                >
                  {group.options.map((option) => item(option, commandItem))}
                </Command.Group>
              ))}
            </Command.List>
          )}
          {statusLine}
        </Command>
      ) : (
        // Inline, the field is shadcn's Combobox: an input with its trigger
        // button, and the candidates in a popover anchored to it.
        <Command label={props.label} {...root} className="flex w-full flex-col">
          <Popover.Root open={open}>
            <Popover.Anchor asChild>
              <div className={comboboxInputGroup}>
                <Command.Input
                  placeholder={props.placeholder ?? undefined}
                  {...input}
                  className={comboboxInput}
                />
                <div className={comboboxAddonEnd}>
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Suggestions"
                    aria-expanded={open}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={toggle}
                    className={comboboxTrigger}
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className="pointer-events-none size-4 text-muted-foreground"
                    />
                  </button>
                </div>
              </div>
            </Popover.Anchor>
            <Popover.Portal container={scopedPortal()}>
              {/* Focus stays in the field: the list is reached with
                  aria-activedescendant, so the content takes no focus and no
                  dialog role. */}
              <Popover.Content
                role="presentation"
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onCloseAutoFocus={(event) => event.preventDefault()}
                className={comboboxContent}
              >
                <Command.List {...list} className={comboboxList}>
                  {groups.map((group, index) => (
                    <Fragment key={group.heading ?? index}>
                      {index > 0 && (
                        <Command.Separator alwaysRender className={comboboxSeparator} />
                      )}
                      <Command.Group heading={group.heading ?? undefined}>
                        {group.options.map((option) =>
                          item(option, comboboxItem, option.value === value),
                        )}
                      </Command.Group>
                    </Fragment>
                  ))}
                </Command.List>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {statusLine}
        </Command>
      );
      if (!props.popup) {
        return (
          <div className="flex w-full max-w-sm flex-col gap-2">
            {!props.hideLabel && (
              <label {...labelProps} className={label}>
                {props.label}
              </label>
            )}
            {field}
          </div>
        );
      }
      const TriggerIcon = props.icon ? icons[props.icon] : null;
      const iconOnly = Boolean(props.hideLabel && TriggerIcon);
      return (
        <Popover.Root open={shown} onOpenChange={show}>
          <Popover.Trigger
            aria-label={iconOnly ? props.label : undefined}
            data-focus-key={props.focusKey ?? undefined}
            className={cn(
              buttonBase,
              buttonVariant.default,
              buttonSize[iconOnly ? 'icon' : 'default'],
            )}
          >
            {TriggerIcon && (
              <TriggerIcon aria-hidden="true" data-icon={iconOnly ? undefined : 'inline-start'} />
            )}
            {!iconOnly && props.label}
          </Popover.Trigger>
          <Popover.Portal container={scopedPortal()}>
            <Popover.Content
              align="start"
              sideOffset={4}
              className={cn(popoverSurface, 'w-72 max-w-[calc(100vw-2rem)] overflow-hidden p-0')}
            >
              <AnimateChangeInHeight>{field}</AnimateChangeInHeight>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      );
    },

    RadioGroup: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div className="flex flex-col gap-3">
          <div id={id} className={label}>
            {props.label}
          </div>
          <RadioGroup.Root
            aria-labelledby={id}
            value={value ?? undefined}
            onValueChange={setValue}
            className="grid w-full gap-3"
          >
            {props.options.map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <RadioGroup.Item
                  id={`${id}-${option.value}`}
                  value={option.value}
                  className="group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary"
                >
                  <RadioGroup.Indicator className="flex size-4 items-center justify-center">
                    <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
                  </RadioGroup.Indicator>
                </RadioGroup.Item>
                <label htmlFor={`${id}-${option.value}`} className={cn(label, 'font-normal')}>
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup.Root>
        </div>
      );
    },

    // shadcn/ui Toggle (radix-nova, outline). A pressed toggle takes the
    // primary fill rather than Nova's muted one, which is also near the
    // surface of the actor's message, so the selection shows there.
    SelectableTags: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div className="flex flex-col gap-3">
          <div id={id} className={props.hideLabel ? 'sr-only' : label}>
            {props.label}
          </div>
          <ToggleGroup.Root
            type="multiple"
            aria-labelledby={id}
            value={value ?? []}
            onValueChange={setValue}
            className="flex flex-wrap items-center gap-2"
          >
            {props.options.map((option) => (
              <ToggleGroup.Item
                key={option.value}
                value={option.value}
                className="group/toggle inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:bg-input/30 dark:data-[state=on]:bg-primary"
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
            <span id={id} className={props.hideLabel ? 'sr-only' : label}>
              {props.label}
            </span>
            <span aria-hidden="true" className="ml-auto text-sm text-muted-foreground">
              {current}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {props.showBounds && <span aria-hidden="true">{props.min}</span>}
            <Slider.Root
              min={props.min}
              max={props.max}
              step={props.step ?? 1}
              value={[current]}
              onValueChange={([next]) => setValue(next ?? props.min)}
              className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50"
            >
              <Slider.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
                <Slider.Range className="absolute h-full bg-primary select-none" />
              </Slider.Track>
              <Slider.Thumb
                aria-labelledby={id}
                className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
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
        onSubmit={(event) => void submitForm(event, emit)}
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
            <Dialog.Overlay className="fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs" />
            <Dialog.Content
              // Radix links a Dialog.Description itself; without one it wants
              // aria-describedby set to undefined explicitly.
              {...(props.description ? {} : { 'aria-describedby': undefined })}
              role={props.alert ? 'alertdialog' : 'dialog'}
              onInteractOutside={props.alert ? (event) => event.preventDefault() : undefined}
              onOpenAutoFocus={(event) => {
                opener.current = captureOpener();
                const marked = (
                  event.currentTarget as HTMLElement | null
                )?.querySelector<HTMLElement>('[data-autofocus]');
                if (!marked) return;
                event.preventDefault();
                marked.focus();
              }}
              // Radix calls this a task after the dialog unmounts, so a window
              // that replaced it has mounted and taken focus by then.
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                settleFocus(returnTarget(), opener.current);
                opener.current = null;
              }}
              className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 pr-6">
                  <Dialog.Title className="flex-1 text-base leading-none font-medium">
                    {props.title}
                  </Dialog.Title>
                  {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
                </div>
                {props.description && (
                  <Dialog.Description className="text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground">
                    {props.description}
                  </Dialog.Description>
                )}
              </div>
              <div className="flex flex-col gap-4">{children}</div>
              {slots?.actions && (
                <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
                  {slots.actions}
                </div>
              )}
              <Dialog.Close className={cn(closeButton, 'absolute top-2 right-2')}>
                <Cross aria-hidden="true" />
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
              onInteractOutside={(event) => event.preventDefault()}
              onOpenAutoFocus={() => {
                opener.current = captureOpener();
              }}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                settleFocus(returnTarget(), opener.current);
                opener.current = null;
              }}
              className="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col gap-4 border-l bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg sm:max-w-sm"
            >
              <div className="flex items-center gap-2 p-4 pr-10">
                <Dialog.Title className="flex-1 text-base font-medium text-foreground">
                  {props.title}
                </Dialog.Title>
                {slots?.suffix && <div className="-my-2 flex shrink-0 gap-1">{slots.suffix}</div>}
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">{children}</div>
              <Dialog.Close className={cn(closeButton, 'absolute top-3 right-3')}>
                <Cross aria-hidden="true" />
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
          {props.toasts.map((toast) => (
            <Toast.Root
              key={toast.id}
              duration={toast.actionLabel ? toastDuration.withAction : toastDuration.plain}
              onOpenChange={(open) => {
                if (!open) dismiss(toast.id);
              }}
              className="group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-lg bg-popover p-4 pr-8 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
            >
              <Toast.Description className="text-sm">{toast.message}</Toast.Description>
              {toast.actionLabel && (
                <Toast.Action
                  altText={toast.actionLabel}
                  onClick={() => void press(toast)}
                  className={cn(buttonBase, buttonVariant.default, buttonSize.sm)}
                >
                  {toast.actionLabel}
                </Toast.Action>
              )}
              <Toast.Close
                aria-label="Close"
                className="absolute top-1 right-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Cross aria-hidden="true" className="size-4" />
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

    MentionEditor: (context) => (
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

    Questionnaire: ({ props, bindings, emit }) => {
      const [answers, setAnswers] = useBoundProp(props.answers, bindings?.answers);
      return (
        <QuestionnaireForm
          label={props.label}
          items={props.items as QuestionnaireItemDef[]}
          answers={answers as QuestionnaireAnswers | null}
          submitLabel={props.submitLabel}
          buttonClass={{
            primary: cn(buttonBase, buttonVariant.primary, buttonSize.default),
            secondary: cn(buttonBase, buttonVariant.default, buttonSize.default),
          }}
          onSubmit={(answers) => {
            setAnswers(answers);
            emit('submit');
          }}
        />
      );
    },
  },
});
