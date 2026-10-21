import {
  Children,
  Fragment,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { bindings } from '@shared/data/bindings';
import { defineRegistry, useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { catalog, toastDuration, type iconNames, type purposes } from '../../catalog';
import type { MapComponent, MapFocusDetail, MapSelectDetail } from '../../../components/map/map';
import type { ToastHandle } from '../../../components/toast/toast';
import {
  Combobox,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../../components/combobox';
import {
  captureOpener,
  focusDemoIfOpenerGone,
  settleFocus,
  useReturnFocus,
  type Opener,
} from '../../behaviour/dialog-focus';
import { useCandidateList } from '../../behaviour/candidate-list';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import { useDisclosureOpen, useDisclosureState } from '../../behaviour/disclosure-state';
import { attributeGlyphs } from '../../../utility/attribute-icons';
import { BoardAxis } from '../../behaviour/board-axis';
import { useDisclosureDrop, useDragRow, useStackDrop } from '../../behaviour/drag-drop';
import { MenuMultiple } from '../../behaviour/menu-multiple';
import { Crumb, CrumbOverflow } from './crumb';
import { DraggableRow } from './draggable-row';
import { FilterTag } from '../../../components/filter/filter-tag';
import { errorPrefix, useBoundField, useField, type FieldErrorProps } from '../../behaviour/field';
import { submitForm } from '../../behaviour/form-submit';
import {
  useFocusHandoff,
  useGroupFocusHandoff,
  useMenuFocusHandoff,
} from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { usePressableTitle } from '../../behaviour/pressable-title';
import { PpMentionEditor } from './mention-editor-lazy';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { popoverHost, useMayTakeFocus } from '../../behaviour/popover-host';
import { usePreview } from '../../../components/item-view/use-preview';
import { useSplitRoom } from '../../behaviour/split-room';
import { useToastList } from '../../behaviour/toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from '../../behaviour/mark-tracing';
import { PpItemView } from './item-view-lazy';
import '../../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

type PpModal = HTMLElement & { open: () => void; close: () => void };

// An open waits a task, so that a window closing in the same state change has
// closed and handed its focus back before this one takes focus.
const syncModal = (
  modal: RefObject<PpModal | null>,
  open: boolean | null | undefined,
  onOpen: () => void,
) => {
  let timer: number | undefined;
  let cancelled = false;
  void customElements.whenDefined('pp-modal').then(() => {
    const el = modal.current;
    const dialog = el?.querySelector('dialog');
    if (cancelled || !el || !dialog) return;
    if (!open && dialog.open) el.close();
    if (open && !dialog.open) {
      timer = window.setTimeout(() => {
        if (dialog.open) return;
        onOpen();
        el.open();
      });
    }
  });
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
};

const space = {
  none: '0',
  s: 'var(--space-xs)',
  m: 'var(--space-s)',
  l: 'var(--space-m)',
} as const;
const gapClass = { none: 'gap-0', s: 'gap-xs', m: 'gap-s', l: 'gap-m' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;
export const icons: Record<(typeof iconNames)[number], string> = {
  'archive': 'ik:archives',
  'ascending': 'ik:sort-low-to-high',
  'attach': 'ik:clip',
  'back': 'ik:arrow-left',
  'cancel': 'ik:cross',
  'cards': 'ik:grid',
  'clear': 'ik:eraser',
  'columns': 'ik:columns',
  'confirm': 'ik:checkmark',
  'decrease': 'ik:arrow-down-right',
  'delete': 'ik:trash',
  'delete-confirm': 'ik:trash-fill',
  'descending': 'ik:sort-high-to-low',
  'detail': 'ik:columns',
  'document': 'ik:doc-text',
  'example': 'ik:text-format',
  'external': 'ik:open-in-new-window',
  'filter': 'ik:filter',
  'full': 'ik:fullscreen',
  'generated': 'ik:sparkles',
  'group': 'ik:layers',
  'guide': 'ik:book-open',
  'history': 'ik:history',
  'in-place': 'ik:view-list',
  'increase': 'ik:arrow-up-right',
  'link': 'ik:link',
  'material': 'ik:layers',
  'mention': 'ik:at',
  'more': 'ik:plus',
  'move': 'ik:arrow-left-right',
  'next': 'ik:chevron-right',
  'notifications': 'ik:bell',
  'open': 'ik:folder-opened',
  'ownership': 'ik:crown',
  'part': 'ik:puzzle',
  'people': 'ik:group',
  'person': 'ik:user',
  'popover': 'ik:message',
  'previous': 'ik:chevron-left',
  'product': 'ik:cardboard',
  'project': 'ik:folder',
  'publish': 'ik:earth-americas',
  'quote': 'ik:quotation-marks',
  'reasoning': 'ik:light-bulb',
  'remove-person': 'ik:remove-user',
  'restore': 'ik:rotate-ccw',
  'rows': 'ik:view-list',
  'saved': 'ik:bookmark',
  'search': 'ik:search',
  'send': 'ik:carriage-return',
  'service': 'ik:wrench',
  'settings': 'ik:sliders',
  'show': 'ik:eye',
  'side-by-side': 'ik:columns',
  'sort': 'ik:swap-vertical',
  'suggest': 'ik:light-bulb',
  'summary': 'ik:view-module',
  'table': 'ik:spreadsheet',
  'transfer': 'ik:crown',
  'unchanged': 'ik:minus',
  'web': 'ik:globe',
  ...attributeGlyphs,
  // Values from fixed lists.
  'date-in-3-days': 'ik:calendar',
  'date-in-3-months': 'ik:calendar-busy',
  'date-in-a-day': 'ik:time',
  'date-in-a-month': 'ik:calendar-personal',
  'date-in-a-week': 'ik:calendar-available',
  'date-past': 'ik:history',
  'label-advocacy': 'ik:megaphone',
  'label-assessment': 'ik:chart-pie',
  'label-audit': 'ik:clipboard',
  'label-data': 'ik:bar-chart',
  'label-design': 'ik:freehand',
  'label-education': 'ik:book-open',
  'label-innovation': 'ik:light-bulb',
  'label-logistics': 'ik:truck-delivery',
  'label-marketing': 'ik:presentation',
  'label-optimization': 'ik:trend-up',
  'label-policy': 'ik:scroll',
  'label-recycling': 'ik:recycle',
  'label-refurbishment': 'ik:wrench',
  'label-research': 'ik:test-tube',
  'label-sourcing': 'ik:search',
  'label-take-back': 'ik:arrow-hook-left-up',
  'label-training': 'ik:college',
  'label-waste-reduction': 'ik:trash',
  'priority-high': 'ik:signal-3',
  'priority-low': 'ik:signal-1',
  'priority-medium': 'ik:signal-2',
  'priority-urgent': 'ik:alert',
  'status-backlog': 'ik:circle-dotted',
  'status-cancelled': 'ik:cross-in-circle',
  'status-done': 'ik:checkmark-in-circle',
  'status-in-progress': 'ik:circle-half-left',
  'status-in-review': 'ik:eye',
  'status-todo': 'ik:circle',
  'unassigned': 'ik:remove-user',
};
const purposeIcons: Record<(typeof purposes)[number], string> = {
  info: 'ik:information',
  success: 'ik:checkmark-in-circle',
  warning: 'ik:warning',
  danger: 'ik:cross-in-circle',
};

const fieldError = (props: FieldErrorProps, message: string) => (
  <small {...props} data-slot="error">
    <span className="visually-hidden">{errorPrefix}</span> {message}
  </small>
);

// The parts a Card and an Item row share: the attributes row under the title,
// and the detail the surface opens into, set off by its rule.
const cardAttributes = (attributes: ReactNode) =>
  attributes && <div className="card__attributes badges">{attributes}</div>;

const cardDetail = (expanded: boolean | null | undefined, detail: ReactNode) =>
  expanded &&
  detail && (
    <div className="detail flow pad">
      <Subsection>{detail}</Subsection>
    </div>
  );

export const { registry } = defineRegistry(catalog, {
  components: {
    Stack: ({ props, children, bindings, emit }) => {
      const { ref, over } = useStackDrop(props, bindings, emit);
      const gap = props.gap ?? 'm';
      const horizontal = props.direction === 'horizontal';
      const attributes = {
        'className': clsx(
          horizontal ? ['flex wrap', gapClass[gap], `items-${props.align ?? 'center'}`] : 'flow',
          props.dropTarget && 'view-family__pane',
        ),
        'data-drop-over': over || undefined,
      };
      const flowSpace = horizontal ? undefined : space[gap];
      return props.label ? (
        <section
          ref={ref}
          aria-label={props.label}
          {...attributes}
          style={{ '--flow-space': flowSpace } as CSSProperties}
        >
          {children}
        </section>
      ) : (
        <div ref={ref} {...attributes} style={{ '--flow-space': flowSpace } as CSSProperties}>
          {children}
        </div>
      );
    },

    // A repeat reaches the registry as one child that renders every item, so
    // it cannot be split into list items; a single child gets a plain grid.
    Grid: ({ props, children }) => {
      const min = columnWidth[props.minColumnWidth ?? 'm'];
      return Children.count(children) < 2 ? (
        <div className="cards layout-grid" style={{ '--layout-grid-min': min } as CSSProperties}>
          {children}
        </div>
      ) : (
        <ul className="cards layout-grid" style={{ '--layout-grid-min': min } as CSSProperties}>
          {Children.map(children, (child) => (
            <li>{child}</li>
          ))}
        </ul>
      );
    },

    // The inline detail sets its own inset and its rule runs the card's full
    // width, so a card with a detail slot pads its body rather than itself.
    Card: ({ props, children, slots, emit }) => {
      const titleButton = usePressableTitle(props, emit);
      const surface = clsx(
        'card',
        props.emphasis && props.emphasis !== 'full' && `card--${props.emphasis}`,
      );
      const dragRef = useRef<HTMLElement>(null);
      const dragging = useDragRow(dragRef, props.dragId, props.dragId != null) || undefined;
      const Heading = useHeading();
      const selected = props.selected ? 'true' : undefined;
      const title = props.opens ? (
        <button {...titleButton} className="stretched-link">
          {props.title}
        </button>
      ) : (
        props.title
      );
      const heading = props.icon ? (
        <>
          <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" /> {title}
        </>
      ) : (
        title
      );
      const attributes = cardAttributes(slots?.attributes);
      const detail = cardDetail(props.expanded, slots?.detail);
      return slots?.suffix || slots?.actions ? (
        <article
          ref={dragRef}
          className={surface}
          data-selected={selected}
          data-popover-host=""
          data-dragging={dragging}
        >
          <div className="card__header">
            {props.title && <Heading className="label card__title">{heading}</Heading>}
            {slots.suffix && <div className="flex">{slots.suffix}</div>}
          </div>
          <div className="flow pad">
            {attributes}
            <Subsection>{children}</Subsection>
          </div>
          {slots.actions && (
            <div className="card__footer">
              <div className="flex" />
              <div className="flex">{slots.actions}</div>
            </div>
          )}
          {detail}
        </article>
      ) : slots?.detail ? (
        <article
          ref={dragRef}
          className={surface}
          data-selected={selected}
          data-popover-host=""
          data-dragging={dragging}
        >
          <div className="pad grid-stack">
            {props.title && <Heading className="card__title">{heading}</Heading>}
            {attributes}
            <Subsection>{children}</Subsection>
          </div>
          {detail}
        </article>
      ) : (
        <article
          ref={dragRef}
          className={clsx(surface, 'pad grid-stack')}
          data-selected={selected}
          data-popover-host=""
          data-dragging={dragging}
        >
          {props.title && <Heading className="card__title">{heading}</Heading>}
          {attributes}
          <Subsection>{children}</Subsection>
        </article>
      );
    },

    Split: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div ref={ref} className={props.split && room ? 'odi' : 'flow'}>
          {children}
        </div>
      );
    },

    Panes: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div ref={ref} className={room ? 'view-family__panes' : 'view-family__trio-stack'}>
          {Children.map(children, (child) => (
            <div className="view-family__pane">{child}</div>
          ))}
        </div>
      );
    },

    Text: ({ props, children }) => {
      if (props.inline) {
        return (
          <span className={clsx(props.muted && 'muted')}>
            {props.highlight ? <mark>{props.text}</mark> : props.text}
            {children && <> {children}</>}
          </span>
        );
      }
      let text = <>{props.text}</>;
      if (props.highlight) text = <mark>{text}</mark>;
      const purpose = props.pending ? null : props.purpose;
      if (purpose) text = <strong>{text}</strong>;
      if (props.size === 'small') text = <small>{text}</small>;
      return (
        <p
          className={clsx(
            purpose
              ? [purpose, 'flex', 'nowrap']
              : props.pending
                ? ['muted', 'flex', 'nowrap']
                : props.muted && 'muted',
            props.size === 'large' && 'text-larger',
          )}
          role={props.status ? 'status' : undefined}
        >
          {props.pending && <pp-spinner aria-hidden="true" />}
          {purpose && (
            <iconify-icon className="icon" icon={purposeIcons[purpose]} aria-hidden="true" />
          )}
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    Callout: ({ props, slots }) => (
      <div className={clsx('callout', 'flex', props.purpose ?? 'layer')}>
        <iconify-icon
          className="icon"
          icon={purposeIcons[props.purpose ?? 'info']}
          aria-hidden="true"
        />
        <span className="callout__text">
          {props.title && <strong>{props.title}. </strong>}
          {props.text}
          {slots?.actions && <> {slots.actions}</>}
        </span>
      </div>
    ),

    EmptyState: ({ props, slots }) => {
      const Heading = useHeading();
      return (
        <div className="empty-state flow">
          {props.icon && <iconify-icon icon={icons[props.icon]} aria-hidden="true" />}
          <Heading className="empty-state__title">{props.title}</Heading>
          {props.description && <p>{props.description}</p>}
          {slots?.actions && <div className="inline-flow">{slots.actions}</div>}
        </div>
      );
    },

    // Each Section brings its content already in the panel pp-sections would
    // otherwise wrap it in, so the element leaves those nodes where React put
    // them.
    Sections: ({ props, children }) => (
      <pp-sections affordance={props.affordance}>{children}</pp-sections>
    ),

    Section: ({ props, children }) => {
      const Heading = useHeading();
      return (
        <>
          <Heading>{props.title}</Heading>
          <div data-pp-panel="" className="flow">
            <Subsection>{children}</Subsection>
          </div>
        </>
      );
    },

    Board: ({ props, children }) => (
      <BoardAxis.Provider value={props.axis}>
        <div className={`board board--${props.axis}`}>{children}</div>
      </BoardAxis.Provider>
    ),

    Disclosure: ({ props, children, bindings, emit }) => {
      const [open, change] = useDisclosureOpen(props.open, bindings?.open, emit);
      const { ref, over } = useDisclosureDrop(props, bindings, emit, open, change);
      const inBoard = useContext(BoardAxis) != null;
      return (
        <details
          ref={ref}
          className={inBoard ? 'board__column' : 'layer borderless'}
          open={open}
          onToggle={(event) => change(event.currentTarget.open)}
          data-drop-over={over || undefined}
        >
          <summary>
            {props.title} {props.count != null && <span className="badge">{props.count}</span>}
          </summary>
          <div className={inBoard ? 'cards' : 'flow'}>{children}</div>
        </details>
      );
    },

    BulletList: ({ props }) => (
      <ul>
        {props.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ),

    DescriptionList: ({ props }) => (
      <dl className={clsx('description-list', props.draggable && 'description-list--draggable')}>
        {props.items.map((item) =>
          props.draggable ? (
            <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />
          ) : (
            <Fragment key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </Fragment>
          ),
        )}
      </dl>
    ),

    // Nothing renders until the spec names a kind of item that has a binding,
    // so an item that has not arrived yet leaves no fallback view behind.
    ItemView: (context) =>
      Object.hasOwn(bindings, context.props.type) && context.props.item ? (
        <Suspense fallback={null}>
          <PpItemView {...context} />
        </Suspense>
      ) : null,

    // pp-table is the scroll container and takes focus, so it is a region
    // named by `label`.
    Table: ({ props, children }) => (
      <pp-table role="region" aria-label={props.label}>
        <table>
          <thead>
            <tr>
              {props.columns.map((column, index) => (
                <th
                  key={index}
                  className={column.align === 'end' ? 'pp-table-align-right' : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </pp-table>
    ),

    TableRow: ({ children }) => <tr>{children}</tr>,

    TableCell: ({ props, children }) => (
      <td className={props.align === 'end' ? 'pp-table-align-right' : undefined}>
        {props.text}
        {children}
      </td>
    ),

    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="messages layer">{children}</div>
      </TracingProvider>
    ),

    Message: ({ props, children }) => {
      const tracing = useMarkTracing(props.parts);
      return (
        <div
          className={clsx(
            'message',
            props.from === 'actor' ? 'message--outbound' : 'message--inbound',
          )}
        >
          <div className="message__content">
            <div
              className={clsx(
                'message__body',
                props.from === 'actor' && props.parts.length > 0 && 'layer',
              )}
            >
              {props.parts.map((part, index) => {
                if (typeof part === 'string') return part;
                const { dimmed, linkedTo, handlers } = tracing(index);
                // The note's tooltip opens on focus too, so a mark with a
                // note takes focus for actors on a keyboard.
                const mark = (
                  <mark
                    key={index}
                    tabIndex={part.note ? 0 : undefined}
                    data-dimmed={dimmed || undefined}
                    {...handlers}
                  >
                    {part.text}
                    {linkedTo.length > 0 && (
                      <span className="visually-hidden">, linked to: {linkedTo.join('; ')}</span>
                    )}
                  </mark>
                );
                if (!part.note) return mark;
                return (
                  <pp-tooltip key={index} content={part.note}>
                    {mark}
                  </pp-tooltip>
                );
              })}
              {children}
            </div>
          </div>
        </div>
      );
    },

    Composer: ({ props, slots, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return (
        <div className="message-composer layer">
          {slots?.field ? (
            <div className="message-composer__input">{slots.field}</div>
          ) : (
            <pp-input>
              <input
                aria-label={props.label ?? undefined}
                placeholder={props.placeholder ?? undefined}
                value={value ?? ''}
                onChange={(event) => setValue(event.target.value)}
              />
            </pp-input>
          )}
          {(slots?.actions || slots?.send) && (
            <div className="message-composer__actions">
              {slots.actions}
              {slots.send && <span className="message-composer__send">{slots.send}</span>}
            </div>
          )}
        </div>
      );
    },

    Timeline: ({ props, children }) => (
      <ol className="stepper" data-density={props.density === 'compact' ? 'compact' : undefined}>
        {children}
      </ol>
    ),

    TimelineEntry: ({ props, children, bindings }) => {
      const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
      let title = (
        <>
          {typeof props.by === 'string' && (
            <>
              <strong>{props.by}</strong>{' '}
            </>
          )}
          {props.by && typeof props.by === 'object' && (
            <>
              <a href={props.by.href}>{props.by.name}</a>{' '}
            </>
          )}
          {props.title}
        </>
      );
      if (props.pending) title = <span className="shimmer">{title}</span>;
      return (
        <li className={clsx('stepper__item', props.from === 'actor' && 'layer')}>
          <div className={clsx('stepper__content', !props.expandable && 'flow')}>
            {props.expandable ? (
              <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
                {/* summary lays its children out as a row, so the title stays one child */}
                <summary>
                  <span>{title}</span>
                </summary>
                <div className="flow">{children}</div>
              </details>
            ) : (
              <>
                <p>{title}</p>
                {children}
              </>
            )}
            {props.time && <small className="muted">{props.time}</small>}
          </div>
        </li>
      );
    },

    List: ({ props, children }) => (
      <pp-list className={clsx('layer', props.borderless && 'borderless')}>{children}</pp-list>
    ),

    // pp-list ticks a checkbox row itself and announces it with pp-select on
    // the list, so a bound row listens there for its own item.
    ListItem: ({ props, children, slots, bindings }) => {
      const ref = useRef<HTMLElement & { checked: boolean }>(null);
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      const bound = Boolean(bindings?.checked);
      useEffect(() => {
        const item = ref.current;
        const list = item?.closest('pp-list');
        if (!bound || !props.checkbox || !item || !list) return;
        const onSelect = (event: Event) => {
          if ((event as CustomEvent<{ item: HTMLElement }>).detail.item === item)
            setChecked(item.checked);
        };
        list.addEventListener('pp-select', onSelect);
        return () => list.removeEventListener('pp-select', onSelect);
      }, [bound, props.checkbox, setChecked]);
      const label = props.struck ? <s>{props.label}</s> : props.label;
      return (
        <pp-list-item
          ref={ref}
          type={props.checkbox ? 'checkbox' : undefined}
          checked={Boolean(props.checkbox && checked)}
        >
          {props.icon && (
            <iconify-icon icon={icons[props.icon]} data-slot="prefix" aria-hidden="true" />
          )}
          {props.description ? (
            <span>
              {label}
              <small className="muted block">{props.description}</small>
            </span>
          ) : (
            label
          )}
          {children}
          {slots?.suffix && <span data-slot="suffix">{slots.suffix}</span>}
        </pp-list-item>
      );
    },

    // Each Item is its own list item: a repeat reaches the group as one child,
    // so the group cannot wrap the rows itself.
    ItemGroup: ({ props, children }) => (
      <div role="list" aria-label={props.label ?? undefined} className="cards cards--list">
        {children}
      </div>
    ),

    Item: ({ props, slots, emit }) => {
      const titleButton = usePressableTitle(props, emit, { focusEvents: true });
      const Heading = useHeading();
      const opener = props.opens ? (
        <button {...titleButton} className="stretched-link">
          {props.title}
        </button>
      ) : (
        props.title
      );
      const title = (
        <Heading className="label card__title flex">
          {opener}
          {slots?.titleSuffix}
        </Heading>
      );
      return (
        <div
          role="listitem"
          onPointerEnter={() => emit('focus')}
          onPointerLeave={() => emit('blur')}
        >
          <article
            className="card"
            data-selected={props.selected ? 'true' : undefined}
            data-focused={props.focused ? 'true' : undefined}
            data-popover-host=""
          >
            {slots?.suffix && (
              <div className="card__header">
                {title}
                <div className="flex">{slots.suffix}</div>
              </div>
            )}
            {(!slots?.suffix || props.description || slots?.attributes) && (
              <div className="flow pad">
                {!slots?.suffix && title}
                {props.description && <p>{props.description}</p>}
                {cardAttributes(slots?.attributes)}
              </div>
            )}
            {cardDetail(props.expanded, slots?.detail)}
          </article>
        </div>
      );
    },

    Stat: ({ props }) => (
      <div className="stat" data-alert={props.alert || undefined}>
        <strong className="stat__value">
          {props.value}
          {props.unit && <span className="stat__unit"> {props.unit}</span>}
        </strong>
        {props.verdict && <p className="stat__verdict">{props.verdict}</p>}
        {props.detail && <p className="muted">{props.detail}</p>}
      </div>
    ),

    // A badge with an icon, such as a trend, reads quiet, as in the shadcn
    // registry; a toned badge without one is a solid fill.
    Badge: ({ props, emit }) => {
      const Root = props.pressable ? 'button' : props.icon ? 'span' : 'strong';
      return (
        <Root
          type={props.pressable ? 'button' : undefined}
          onClick={props.pressable ? () => void emit('press') : undefined}
          className={clsx(
            'badge',
            props.pill && 'badge--pill',
            props.pulse && 'badge--pulse',
            props.tone && props.tone !== 'neutral' && `badge--${props.tone}`,
          )}
        >
          {props.label && <span className="badge__label">{props.label}</span>}
          {props.icon && (
            <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
          )}
          {props.text}
        </Root>
      );
    },

    Tag: ({ props, emit }) => {
      const removeRef = useFocusHandoff(props.focusNext);
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      const content = (
        <>
          {props.icon && <iconify-icon icon={icons[props.icon]} aria-hidden="true" />}
          {props.pending ? <span className="shimmer">{props.label}</span> : props.label}
        </>
      );
      const tag = props.opens ? (
        <button
          ref={openRef}
          type="button"
          className="tag"
          data-focus-key={props.focusKey ?? undefined}
          onClick={() => emit('open')}
        >
          {content}
        </button>
      ) : (
        <span className="tag">{content}</span>
      );
      if (props.opens || !props.removeLabel) return tag;
      return (
        <span className="tag-group">
          {tag}
          <button
            ref={removeRef}
            type="button"
            className="tag tag-group__remove"
            data-focus-key={props.focusKey ?? undefined}
            onClick={() => emit('remove')}
          >
            <iconify-icon icon={icons.cancel} aria-hidden="true" />
            <span className="visually-hidden">{props.removeLabel}</span>
          </button>
        </span>
      );
    },

    FilterTag: ({ props, bindings, emit }) => {
      const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
      const { group } = useGroupFocusHandoff(props.focusNext);
      return (
        <FilterTag
          ref={group}
          label={props.label}
          icon={props.icon && icons[props.icon]}
          operator={props.operator}
          operators={props.operators}
          values={props.values}
          options={props.options}
          glyphs={props.glyphs?.map((each) => ({
            ...each,
            icon: each.icon && icons[each.icon],
          }))}
          removeLabel={props.removeLabel}
          focusKey={props.focusKey}
          onChange={(change) => {
            setEdit(change);
            void emit('change');
          }}
          onRemove={() => void emit('remove')}
        />
      );
    },

    // The popup is portaled to <body>: the reference sits in a paragraph,
    // which cannot hold the preview's blocks.
    Reference: ({ props, children, slots, bindings, emit }) => {
      const [shown, setShown] = useBoundProp(props.preview, bindings?.preview);
      const { triggerRef, contentRef, trigger, content, close } = usePreview(
        shown ?? false,
        setShown,
        props.expanded ?? false,
      );
      const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
      const setTrigger = useCallback(
        (element: HTMLButtonElement | null) => {
          triggerRef.current = element;
          setAnchor(element);
        },
        [triggerRef],
      );
      const Heading = useHeading();
      return (
        <>
          <button
            ref={setTrigger}
            type="button"
            className="reference-mention reference"
            data-focus-key={props.focusKey ?? undefined}
            aria-haspopup="dialog"
            aria-expanded={props.expanded ?? false}
            {...trigger}
            onClick={() => {
              close();
              emit('open');
            }}
          >
            {props.label}
          </button>
          {createPortal(
            <pp-popup
              anchor={anchor ?? undefined}
              active={shown ?? false}
              placement="bottom-start"
              distance={8}
              flip
              shift
              top-layer
            >
              <div
                ref={contentRef}
                className="popover"
                role="dialog"
                aria-label={props.label}
                {...content}
              >
                <div className="popover__header">
                  <div className="flow">
                    <Heading className="label">
                      {props.icon && (
                        <>
                          <iconify-icon
                            className="icon"
                            icon={icons[props.icon]}
                            aria-hidden="true"
                          />{' '}
                        </>
                      )}
                      {props.label}
                    </Heading>
                    <Subsection>{children}</Subsection>
                  </div>
                  {slots?.suffix && <div className="button-group">{slots.suffix}</div>}
                </div>
              </div>
            </pp-popup>,
            document.body,
          )}
        </>
      );
    },

    // `top-layer` keeps the panel clear of a scrolling pane and of the rows it
    // overlaps.
    Popover: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const popup = useRef<HTMLElement>(null);
      const panel = useRef<HTMLDivElement>(null);
      const opener = useRef<Opener | null>(null);
      const [anchor, setAnchor] = useState<Element | null>(null);
      const mayTakeFocus = useMayTakeFocus();
      const Heading = useHeading();
      // The bound setter is a new function on every render; the listener
      // below reads the latest one, so it is added once.
      const setOpenLatest = useRef(setOpen);
      setOpenLatest.current = setOpen;
      useLayoutEffect(() => setAnchor(popoverHost(popup.current)), []);
      // The popup shows a frame after `active` is set.
      useEffect(() => {
        if (!open) return;
        opener.current = captureOpener();
        if (!mayTakeFocus(popup.current)) return;
        const frame = requestAnimationFrame(() => {
          const target = panel.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          (target ?? panel.current)?.focus();
        });
        return () => cancelAnimationFrame(frame);
      }, [open, mayTakeFocus]);
      // The spec closing the panel hides what has focus, so focus goes back
      // as when the actor closes it.
      const wasOpen = useRef(open);
      useLayoutEffect(() => {
        if (wasOpen.current && !open) {
          const active = document.activeElement;
          // Not settleFocus: the panel still counts as an open window here.
          const back = opener.current;
          if (
            back &&
            (!active || active === document.body || panel.current?.contains(active)) &&
            !focusDemoIfOpenerGone(back)
          ) {
            back.element?.focus();
          }
        }
        wasOpen.current = open;
      }, [open]);
      useEffect(() => {
        const el = popup.current;
        if (!el) return;
        const onHide = () => {
          // Focus goes back only from inside the panel: a click on another
          // control has already moved it where the actor wanted.
          if (panel.current?.contains(document.activeElement)) settleFocus(null, opener.current);
          opener.current = null;
          setOpenLatest.current(false);
        };
        el.addEventListener('pp-hide', onHide);
        return () => el.removeEventListener('pp-hide', onHide);
      }, []);
      return (
        <pp-popup
          ref={popup}
          anchor={anchor ?? undefined}
          active={open ?? false}
          placement="bottom-start"
          distance={8}
          flip
          shift
          top-layer={true}
          light-dismiss={true}
        >
          <div ref={panel} className="popover" role="dialog" aria-label={props.title} tabIndex={-1}>
            <div className="popover__header">
              <div className="flow">
                <Heading className="label">{props.title}</Heading>
                <Subsection>{children}</Subsection>
              </div>
              {slots?.suffix && <div className="button-group">{slots.suffix}</div>}
            </div>
          </div>
        </pp-popup>
      );
    },

    Menu: ({ props, children }) => {
      const { trigger, list } = useMenuFocusHandoff(props.focusNext);
      return (
        <pp-dropdown
          hoist
          placement={props.align === 'end' ? 'bottom-end' : undefined}
          stay-open-on-select={props.multiple ?? false}
        >
          <button
            ref={trigger}
            type="button"
            className="button button--plain"
            data-slot="trigger"
            title={props.label}
            data-focus-key={props.focusKey ?? undefined}
          >
            {props.icon && (
              <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
            )}
            <span className="visually-hidden">{props.label}</span>
          </button>
          <pp-popup>
            <pp-list ref={list}>
              <MenuMultiple value={props.multiple ?? false}>{children}</MenuMultiple>
            </pp-list>
          </pp-popup>
        </pp-dropdown>
      );
    },

    // `disabled` goes in as a boolean: pp-list-item coerces by the type its
    // property holds, and `undefined` would stay as the string "undefined".
    MenuItem: ({ props, emit }) => (
      <pp-list-item
        type={useContext(MenuMultiple) ? 'checkbox' : 'radio'}
        checked={props.checked ?? false}
        disabled={props.disabled ?? false}
        onClick={() => !props.disabled && emit('press')}
      >
        {props.icon && (
          <iconify-icon
            data-slot="prefix"
            className="icon"
            icon={icons[props.icon]}
            aria-hidden="true"
          />
        )}
        {props.label}
      </pp-list-item>
    ),

    Breadcrumbs: ({ props, bindings, emit }) => {
      const [, setPicked] = useBoundProp(props.picked, bindings?.picked);
      const pick = (id: string) => {
        setPicked(id);
        emit('pick');
      };
      const [first, ...middle] = props.items;
      return (
        <pp-breadcrumbs role="navigation" aria-label={props.label}>
          {first && <Crumb key={first.id} label={first.label} onPick={() => pick(first.id)} />}
          {first && <CrumbOverflow items={props.items} onPick={pick} />}
          {middle.map((item) => (
            <Crumb key={item.id} label={item.label} onPick={() => pick(item.id)} />
          ))}
          <span className="crumb">
            <a aria-current="page">{props.current}</a>
            {props.note && <small className="muted">&nbsp;{props.note}</small>}
          </span>
        </pp-breadcrumbs>
      );
    },

    Map: ({ props, bindings, emit }) => {
      const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
      const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
      const ref = useRef<MapComponent | null>(null);
      // pp-map redraws its pins and refits the view whenever it is handed a
      // new array, so the array changes only with the places.
      const locations = useMemo(
        () =>
          props.locations.map(({ description, ...location }) => ({
            ...location,
            description: description ?? undefined,
          })),
        [props.locations],
      );
      useEffect(() => {
        if (ref.current) ref.current.locations = locations;
      }, [locations]);
      useEffect(() => {
        if (ref.current) ref.current['selected-id'] = selected ?? '';
      }, [selected]);
      useEffect(() => {
        if (ref.current) ref.current['focused-id'] = focused ?? '';
      }, [focused]);
      useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onFocus = (event: Event) => {
          const { location } = (event as CustomEvent<MapFocusDetail>).detail;
          setFocused(location ? String(location.id) : null);
        };
        el.addEventListener('pp-map-focus', onFocus);
        return () => el.removeEventListener('pp-map-focus', onFocus);
      }, [setFocused]);
      useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onSelect = (event: Event) => {
          setSelected(String((event as CustomEvent<MapSelectDetail>).detail.location.id));
          emit('select');
        };
        el.addEventListener('pp-map-select', onSelect);
        return () => el.removeEventListener('pp-map-select', onSelect);
      }, [setSelected, emit]);
      return <pp-map ref={ref} aria-label={props.label} />;
    },

    Button: ({ props, emit }) => {
      const ref = useFocusHandoff(props.focusNext);
      useFocusOnShow(ref, props.focusOnShow);
      return (
        <button
          ref={ref}
          type={props.submit ? 'submit' : 'button'}
          data-focus-key={props.focusKey ?? undefined}
          className={clsx(
            'button',
            props.variant && props.variant !== 'default' && `button--${props.variant}`,
          )}
          disabled={props.disabled ?? undefined}
          aria-expanded={props.expanded ?? undefined}
          data-autofocus={props.initialFocus || undefined}
          onClick={() => emit('press')}
        >
          {props.icon && (
            <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
          )}
          {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
        </button>
      );
    },

    Input: ({ props, bindings }) => {
      const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
      const field = (
        <>
          <pp-input invalid={Boolean(error)}>
            <input
              {...control}
              type={props.type ?? 'text'}
              aria-label={props.hideLabel ? props.label : undefined}
              placeholder={props.placeholder ?? undefined}
              data-autofocus={props.initialFocus || undefined}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </pp-input>
          {error && fieldError(errorProps, error)}
        </>
      );
      return (
        <div className="grid-stack">
          {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
          {field}
        </div>
      );
    },

    // .grow-wrap sizes itself from a copy of the text in data-replicated-value.
    Textarea: ({ props, bindings }) => {
      const { id, value, setValue } = useBoundField(props, bindings);
      return (
        <div className="grid-stack">
          <label htmlFor={id}>{props.label}</label>
          <div className="grow-wrap" data-replicated-value={value}>
            <textarea
              id={id}
              rows={3}
              placeholder={props.placeholder ?? undefined}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
        </div>
      );
    },

    // The empty value is a disabled first option, so the select shows nothing
    // chosen when nothing is, and it cannot be chosen again.
    Select: ({ props, bindings }) => {
      const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
      return (
        <div className="grid-stack">
          <label htmlFor={id}>{props.label}</label>
          <pp-select invalid={Boolean(error)}>
            <select {...control} value={value} onChange={(event) => setValue(event.target.value)}>
              <option value="" disabled>
                {props.placeholder ?? ''}
              </option>
              {props.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && fieldError(errorProps, error)}
          </pp-select>
        </div>
      );
    },

    // The field keeps to the library combobox's own width rather than the demo's.
    Combobox: ({ props, bindings, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
      const dropdown = useRef<HTMLElement & { hide(): void; focusOnTrigger(): void }>(null);
      // A pick empties the field only once `select` has run, since the
      // handler's later steps can still read the picked value.
      const picking = useRef(false);
      const { open, groups, root, label, input, list, pick, close } = useCandidateList(
        props.groups,
        value ?? '',
        setValue,
        () => {
          picking.current = true;
          dropdown.current?.hide();
          dropdown.current?.focusOnTrigger();
          void Promise.resolve(emit('select')).finally(() => {
            picking.current = false;
            setValue('');
          });
        },
        { value: scope, set: setScope },
        props.popup ?? false,
      );
      // The bound setter is a new function on every render; the listeners
      // below read the latest one.
      const hidden = useRef(() => {});
      hidden.current = () => {
        close();
        if (!picking.current) setValue('');
      };
      useEffect(() => {
        const el = dropdown.current;
        if (!el) return;
        const onShow = (event: Event) => {
          if (event.target === el) el.querySelector<HTMLElement>('[cmdk-input]')?.focus();
        };
        const onHide = (event: Event) => event.target === el && hidden.current();
        el.addEventListener('pp-after-show', onShow);
        el.addEventListener('pp-hide', onHide);
        return () => {
          el.removeEventListener('pp-after-show', onShow);
          el.removeEventListener('pp-hide', onHide);
        };
      }, [props.popup]);
      const status = props.status;
      const purpose = status?.pending ? null : status?.purpose;
      const field = (
        <Combobox label={props.label} {...root}>
          <ComboboxInput placeholder={props.placeholder ?? ''} {...input} />
          {open && (
            <ComboboxList {...list}>
              {groups.map((group, index) => (
                <ComboboxGroup key={group.heading ?? index} heading={group.heading ?? undefined}>
                  {group.options.map((option) => (
                    <ComboboxItem key={option.value} value={option.value} onSelect={pick}>
                      {option.icon && (
                        <iconify-icon
                          slot="prefix"
                          className="icon"
                          icon={icons[option.icon]}
                          aria-hidden="true"
                        />
                      )}
                      {option.label}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ))}
            </ComboboxList>
          )}
          {status && (
            <p className={clsx('combobox-status', purpose ?? 'muted')} role="status">
              {status.text && status.pending && <pp-spinner aria-hidden="true" />}
              {status.text && purpose && (
                <iconify-icon className="icon" icon={purposeIcons[purpose]} aria-hidden="true" />
              )}
              {status.text}
            </p>
          )}
        </Combobox>
      );
      if (!props.popup) {
        return (
          <div className="grid-stack grid-stack--start">
            {!props.hideLabel && <label {...label}>{props.label}</label>}
            {field}
          </div>
        );
      }
      return (
        <pp-dropdown ref={dropdown} hoist placement="bottom-start">
          <button
            type="button"
            className="button"
            data-slot="trigger"
            data-focus-key={props.focusKey ?? undefined}
          >
            {props.icon && (
              <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
            )}
            {props.hideLabel && props.icon ? (
              <span className="visually-hidden">{props.label}</span>
            ) : (
              props.label
            )}
          </button>
          <pp-popup>
            <div>
              <AnimateChangeInHeight>{field}</AnimateChangeInHeight>
            </div>
          </pp-popup>
        </pp-dropdown>
      );
    },

    RadioGroup: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const name = useId();
      return (
        // The library resets a fieldset's margin, so the form's spacing goes on a wrapper.
        <div>
          <fieldset className="grid-stack">
            <legend>{props.label}</legend>
            {props.options.map((option) => (
              <label key={option.value} className="form-control">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => setValue(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        </div>
      );
    },

    SelectableTags: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const selected = value ?? [];
      const toggle = (option: string, checked: boolean) =>
        setValue(checked ? [...selected, option] : selected.filter((each) => each !== option));
      return (
        <div>
          <fieldset className="grid-stack">
            <legend className={props.hideLabel ? 'visually-hidden' : undefined}>
              {props.label}
            </legend>
            <div className="inline-flow">
              {props.options.map((option) => (
                <label key={option.value} className="form-control tag">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={(event) => toggle(option.value, event.target.checked)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      );
    },

    // pp-range names its input from `label`. The visible label repeats it
    // rather than being linked by `labelledby`, which pp-range reads only when
    // its own props change. Its prefix and suffix are read once, on connect.
    Slider: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return (
        <div className="grid-stack">
          {!props.hideLabel && <span aria-hidden="true">{props.label}</span>}
          <pp-range
            label={props.label}
            min={props.min}
            max={props.max}
            step={props.step ?? 1}
            value={value ?? props.min}
            onInput={(event) =>
              setValue((event.currentTarget as HTMLElement & { value: number }).value)
            }
          >
            {props.showBounds && <span data-slot="prefix">{props.min}</span>}
            {props.showBounds && <span data-slot="suffix">{props.max}</span>}
          </pp-range>
        </div>
      );
    },

    Checkbox: ({ props, bindings }) => {
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      return (
        <label className="form-control">
          <input
            type="checkbox"
            checked={checked ?? false}
            onChange={(event) => setChecked(event.target.checked)}
          />
          {props.label}
        </label>
      );
    },

    // A form is read most easily at about 36rem, however wide the demo is.
    Form: ({ props, children, emit }) => (
      <form
        className="flow measure"
        style={{ '--flow-space': 'var(--space-l)' } as CSSProperties}
        aria-label={props.label ?? undefined}
        noValidate
        onSubmit={(event) => void submitForm(event, emit)}
      >
        {children}
      </form>
    ),

    // Every close, whether from state, pp-modal or the browser, ends in the
    // dialog's close event, so the state and the focus fallback are settled
    // there. It fires once the page is not inert, so the demo can take focus.
    Dialog: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const modal = useRef<PpModal>(null);
      const opener = useRef<Opener | null>(null);
      const returnTarget = useReturnFocus(props.returnFocus);
      const titleId = useId();
      const descriptionId = useId();

      const onClose = () => {
        setOpen(false);
        settleFocus(returnTarget(), opener.current);
        opener.current = null;
      };

      useEffect(() => syncModal(modal, open, () => (opener.current = captureOpener())), [open]);

      return createPortal(
        <pp-modal ref={modal}>
          <dialog
            className="dialog"
            role={props.alert ? 'alertdialog' : undefined}
            aria-labelledby={titleId}
            aria-describedby={props.description ? descriptionId : undefined}
            closedby={props.alert ? 'closerequest' : 'any'}
            onClose={onClose}
          >
            <header className="modal__header">
              <h2 className="modal__title" id={titleId}>
                {props.title}
              </h2>
              {slots?.suffix && (
                <div className="modal__header-actions">
                  <div className="button-group">{slots.suffix}</div>
                </div>
              )}
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ik:cross" aria-hidden="true" />
              </button>
            </header>
            <article className="flow">
              {props.description && <p id={descriptionId}>{props.description}</p>}
              {children}
            </article>
            {slots?.actions && (
              <footer>
                <menu>{slots.actions}</menu>
              </footer>
            )}
          </dialog>
        </pp-modal>,
        document.body,
      );
    },

    // The library's drawer is <pp-modal> around a <dialog class="drawer">, the
    // markup modalService builds. A portal rather than modalService itself:
    // the service renders content in a React root of its own, outside the
    // spec's state and action providers.
    Drawer: ({ props, children, slots, bindings }) => {
      const [open, setOpen] = useBoundProp(props.open, bindings?.open);
      const modal = useRef<PpModal>(null);
      const opener = useRef<Opener | null>(null);
      const returnTarget = useReturnFocus(props.returnFocus);
      const titleId = useId();

      const onClose = () => {
        setOpen(false);
        settleFocus(returnTarget(), opener.current);
        opener.current = null;
      };

      useEffect(() => syncModal(modal, open, () => (opener.current = captureOpener())), [open]);

      return createPortal(
        <pp-modal ref={modal}>
          <dialog
            className="drawer drawer--right"
            data-modal="false"
            aria-labelledby={titleId}
            onClose={onClose}
          >
            <header className="modal__header">
              <h2 className="modal__title" id={titleId}>
                {props.title}
              </h2>
              {slots?.suffix && (
                <div className="modal__header-actions">
                  <div className="button-group">{slots.suffix}</div>
                </div>
              )}
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ik:cross" aria-hidden="true" />
              </button>
            </header>
            <div className="drawer__content flow">{children}</div>
          </dialog>
        </pp-modal>,
        document.body,
      );
    },

    // The library makes the whole toast the action's button, named by its
    // text, so the action's label joins the message.
    Toasts: ({ props, bindings, emit }) => {
      const { dismiss, press } = useToastList(bindings?.toasts, bindings?.pressed, emit);
      // Open toasts call the latest press, so the list effect need not re-run
      // when `emit` changes.
      const pressLatest = useRef(press);
      pressLatest.current = press;
      const shown = useRef(new Map<string, Promise<ToastHandle>>());

      useEffect(() => {
        const listed = new Set(props.toasts.map((toast) => toast.id));
        for (const [id, handle] of shown.current) {
          if (listed.has(id)) continue;
          shown.current.delete(id);
          void handle.then((h) => h.dismiss());
        }
        for (const toast of props.toasts) {
          if (shown.current.has(toast.id)) continue;
          const handle = import('../../../components/toast/toast').then(({ PpToast }) =>
            toast.actionLabel
              ? PpToast.open(
                  `${toast.message} — ${toast.actionLabel}`,
                  () => pressLatest.current(toast),
                  toastDuration.withAction,
                )
              : PpToast.open(toast.message, undefined, toastDuration.plain),
          );
          shown.current.set(toast.id, handle);
          void handle
            .then((h) => h.closed)
            .then(() => {
              if (shown.current.get(toast.id) !== handle) return;
              shown.current.delete(toast.id);
              dismiss(toast.id);
            });
        }
      }, [props.toasts, dismiss]);

      // Switching library unmounts this: close what is showing but leave the
      // list alone, so the other library shows the same toasts.
      useEffect(
        () => () => {
          const handles = [...shown.current.values()];
          shown.current.clear();
          for (const handle of handles) void handle.then((h) => h.dismiss());
        },
        [],
      );

      return null;
    },

    MentionEditor: (context) => (
      <Suspense fallback={null}>
        <PpMentionEditor {...context} />
      </Suspense>
    ),

    // The library has no grouped rule form, so the demo says so rather than
    // rendering a different thing.
    RuleBuilder: () => (
      <p className="spec-demo__unsupported" role="note">
        This library has no rule builder with groups.
      </p>
    ),
  },
});
