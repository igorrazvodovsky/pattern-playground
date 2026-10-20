import { Children, Fragment, Suspense, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { defineRegistry, useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { catalog, actionsSuppliedBySpecs, toastDuration, type iconNames, type purposes } from '../catalog';
import type { MapComponent, MapFocusDetail, MapSelectDetail } from '../../components/map/map';
import type { ToastHandle } from '../../components/toast/toast';
import { Combobox, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '../../components/combobox';
import { captureOpener, focusDemoIfOpenerGone, settleFocus, useReturnFocus, type Opener } from './dialog-focus';
import { useCandidateList } from './candidate-list';
import { useDisclosureOpen, useDisclosureState } from './disclosure-state';
import { attributeGlyphs } from '../../utility/attribute-icons';
import { BoardAxis } from './board-axis';
import { useDisclosureDrop, useDragRow, useStackDrop } from './drag-drop';
import { MenuMultiple } from './menu-multiple';
import { DraggableRow } from './pp-draggable-row';
import { FilterTag } from './pp-filter-tag';
import { useFieldError } from './field-validation';
import { submitForm } from './form-submit';
import { useFocusHandoff, useMenuFocusHandoff } from './focus-handoff';
import { useFocusOnShow } from './focus-on-show';
import { PpMentionEditor } from './mention-editor-lazy';
import { Subsection, useHeading } from './heading-level';
import { popoverHost, useMayTakeFocus } from './popover-host';
import { usePreview } from './preview';
import { useSplitRoom } from './split-room';
import { useToastList } from './toast-list';
import { TracingProvider, useMarkTracing, useTracingState } from './mark-tracing';
import '../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

type PpModal = HTMLElement & { open: () => void; close: () => void };

// Opens or closes a pp-modal to match `open`. A close happens at once; an open
// waits a task (see Dialog), calling `onOpen` just before. Returns the effect's
// cleanup, which cancels an open still waiting.
const syncModal = (modal: RefObject<PpModal | null>, open: boolean | null | undefined, onOpen: () => void) => {
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

const space = { none: '0', s: 'var(--space-xs)', m: 'var(--space-s)', l: 'var(--space-m)' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;
// A field's label, control and error, a small step apart. A grid rather than
// .flow, whose own --flow-space would also set the field's distance from the
// field before it.
const fieldLayout: CSSProperties = { display: 'grid', gap: space.s };
// A card's title, attributes and body, a small step apart. A grid for the
// same reason: --flow-space set on the card would also set its distance from
// the card before it, and cards in a Stack would touch.
const bodyLayout: CSSProperties = { display: 'grid', rowGap: space.s };
const icons: Record<(typeof iconNames)[number], string> = {
  archive: 'ph:archive-box',
  ascending: 'ph:sort-ascending',
  attach: 'ph:paperclip',
  back: 'ph:arrow-left',
  cancel: 'ph:x',
  cards: 'ph:squares-four',
  clear: 'ph:eraser',
  columns: 'ph:columns',
  confirm: 'ph:check',
  decrease: 'ph:arrow-down-right',
  delete: 'ph:trash-simple',
  'delete-confirm': 'ph:trash-simple-fill',
  descending: 'ph:sort-descending',
  detail: 'ph:square-split-horizontal',
  example: 'ph:text-aa',
  external: 'ph:arrow-square-out',
  filter: 'ph:funnel-simple',
  full: 'ph:frame-corners',
  generated: 'ph:sparkle',
  group: 'ph:stack',
  guide: 'ph:book-open',
  history: 'ph:clock-counter-clockwise',
  'in-place': 'ph:rows',
  increase: 'ph:arrow-up-right',
  link: 'ph:link',
  material: 'ph:stack',
  mention: 'ph:at',
  more: 'ph:plus',
  move: 'ph:arrows-left-right',
  next: 'ph:caret-right',
  notifications: 'ph:bell',
  open: 'ph:folder-open',
  part: 'ph:puzzle-piece',
  popover: 'ph:chat-teardrop',
  previous: 'ph:caret-left',
  product: 'ph:package',
  publish: 'ph:globe-hemisphere-west',
  reasoning: 'ph:lightbulb',
  'remove-person': 'ph:user-minus',
  restore: 'ph:arrow-arc-left',
  rows: 'ph:rows',
  saved: 'ph:bookmark-simple',
  search: 'ph:magnifying-glass',
  send: 'ph:arrow-elbow-down-left',
  settings: 'ph:sliders-horizontal',
  show: 'ph:eye',
  'side-by-side': 'ph:columns',
  sort: 'ph:arrows-down-up',
  suggest: 'ph:lightbulb-filament',
  summary: 'ph:cards',
  table: 'ph:table',
  transfer: 'ph:crown-simple',
  unchanged: 'ph:minus',
  web: 'ph:globe',
  // An attribute's icon, as the library's own components show it.
  ...attributeGlyphs,
};
const purposeIcons: Record<(typeof purposes)[number], string> = {
  info: 'ph:info',
  success: 'ph:check-circle',
  warning: 'ph:warning',
  danger: 'ph:x-circle',
};

// A field's error, placed where the library's field styles expect it
// (data-slot="error" after pp-input, inside pp-select). An alert, so that it
// is read out when a submit sets it.
const fieldError = (id: string, message: string) => (
  <small id={id} data-slot="error" role="alert">
    <span className="visually-hidden">Error:</span> {message}
  </small>
);

export const { registry } = defineRegistry(catalog, {
  components: {
    // A Stack with a label is a section of that name, a region. A drop
    // target is a view-family pane, which the library outlines while a row
    // is over it (drag-drop.ts).
    Stack: ({ props, children, bindings, emit }) => {
      const { ref, over } = useStackDrop(props, bindings, emit);
      const layout: { className?: string; style: CSSProperties } =
        props.direction === 'horizontal'
          ? {
              style: {
                display: 'flex',
                flexWrap: 'wrap',
                gap: space[props.gap ?? 'm'],
                alignItems: props.align ?? 'center',
              },
            }
          : { className: 'flow', style: { '--flow-space': space[props.gap ?? 'm'] } as CSSProperties };
      const attributes = {
        ...layout,
        className: clsx(layout.className, props.dropTarget && 'view-family__pane') || undefined,
        'data-drop-over': over || undefined,
      };
      return props.label ? (
        <section ref={ref} aria-label={props.label} {...attributes}>
          {children}
        </section>
      ) : (
        <div ref={ref} {...attributes}>
          {children}
        </div>
      );
    },

    // A list of cards, each in its own item. A repeat reaches the registry as
    // one child that renders every item, so it cannot be split into list
    // items here; a grid with one child lays it out without the list.
    Grid: ({ props, children }) => {
      const style = { '--layout-grid-min': columnWidth[props.minColumnWidth ?? 'm'] } as CSSProperties;
      return Children.count(children) < 2 ? (
        <div className="cards layout-grid" style={style}>
          {children}
        </div>
      ) : (
        <ul className="cards layout-grid" style={style}>
          {Children.map(children, child => <li>{child}</li>)}
        </ul>
      );
    },

    // A plain card is one padded column. With a suffix or actions it takes
    // the card's zones: a header that spreads the title and the suffix apart,
    // and a footer that puts the actions at the end. A card that opens puts
    // its title in a .stretched-link button, which covers the card while the
    // header's and footer's other controls stay above it. The button takes
    // focus when it appears, if `focusOnShow` (focus-on-show.ts). The title is
    // a heading at the demo's current level (heading-level.ts); .card__title
    // keeps its size whatever the level. A selected card takes the ring the
    // library's collection views give the picked item (view-family.css). An
    // expanded card's detail is the library's inline detail (.card > .detail),
    // which is positioned, so it paints above the stretched link. It sets its
    // own inset and its rule runs the card's full width, so a card with a
    // detail slot pads its body rather than itself. The attributes are the
    // library's attribute row (.card__attributes), whose buttons the
    // stretched-link styles lift above the card's press.
    Card: ({ props, children, slots, emit }) => {
      const openRef = useRef<HTMLButtonElement>(null);
      useFocusOnShow(openRef, props.focusOnShow);
      const dragRef = useRef<HTMLElement>(null);
      const dragging = useDragRow(dragRef, props.dragId, props.dragId != null) || undefined;
      const Heading = useHeading();
      const selected = props.selected ? 'true' : undefined;
      const title = props.opens ? (
        <button
          ref={openRef}
          type="button"
          className="stretched-link"
          aria-pressed={props.selected == null || props.expanded != null ? undefined : props.selected}
          aria-expanded={props.expanded ?? undefined}
          onClick={() => emit('open')}
        >
          {props.title}
        </button>
      ) : (
        props.title
      );
      const heading = props.icon ? (
        <>
          <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />{' '}
          {title}
        </>
      ) : (
        title
      );
      const attributes = slots?.attributes && <div className="card__attributes badges">{slots.attributes}</div>;
      const detail = props.expanded && slots?.detail && (
        <div className="detail flow pad">
          <Subsection>{slots.detail}</Subsection>
        </div>
      );
      return slots?.suffix || slots?.actions ? (
        <article ref={dragRef} className="card" data-selected={selected} data-popover-host="" data-dragging={dragging}>
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
        <article ref={dragRef} className="card" data-selected={selected} data-popover-host="" data-dragging={dragging}>
          <div className="pad" style={bodyLayout}>
            {props.title && <Heading className="card__title">{heading}</Heading>}
            {attributes}
            <Subsection>{children}</Subsection>
          </div>
          {detail}
        </article>
      ) : (
        <article ref={dragRef} className="card pad" data-selected={selected} data-popover-host="" data-dragging={dragging} style={bodyLayout}>
          {props.title && <Heading className="card__title">{heading}</Heading>}
          {attributes}
          <Subsection>{children}</Subsection>
        </article>
      );
    },

    // The library's overview-beside-detail grid (.odi in view-family.css)
    // when split and there is room, otherwise a column.
    Split: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div ref={ref} className={props.split && room ? 'odi' : 'flow'}>
          {children}
        </div>
      );
    },

    // The library's coordinated panes (.view-family__panes in view-family.css)
    // when there is room, otherwise a column. Each child sits in a pane that
    // is a container of its own (.view-family__pane), so blocks inside lay out
    // for the pane's width; a hidden child leaves its pane empty, and an
    // empty pane takes no place.
    Panes: ({ props, children, bindings }) => {
      const ref = useRef<HTMLDivElement>(null);
      const room = useSplitRoom(ref, props.room, bindings?.room);
      return (
        <div ref={ref} className={room ? 'view-family__panes' : 'view-family__trio-stack'}>
          {Children.map(children, child => <div className="view-family__pane">{child}</div>)}
        </div>
      );
    },

    // With a purpose, the purpose's colour class, its icon and a strong run
    // of text, as the library marks a message in place. Pending text is led
    // by the library's spinner.
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
          className={clsx(purpose ? [purpose, 'flex'] : props.pending ? ['muted', 'flex'] : props.muted && 'muted')}
          style={props.size === 'large' ? { fontSize: 'larger' } : undefined}
          role={props.status ? 'status' : undefined}
        >
          {props.pending && <pp-spinner aria-hidden="true" />}
          {purpose && <iconify-icon className="icon" icon={purposeIcons[purpose]} aria-hidden="true" />}
          {text}
          {children && <> {children}</>}
        </p>
      );
    },

    // A neutral callout takes the raised surface (`layer`) rather than a
    // purpose class, as in the Callout story.
    // Actions run on after the text, in the same line of prose. The text
    // takes the width beside the icon: at its natural width a message longer
    // than a line would wrap below the icon in a narrow demo, where .flex wraps.
    Callout: ({ props, slots }) => (
      <div className={clsx('callout', 'flex', props.purpose ?? 'layer')}>
        <iconify-icon className="icon" icon={purposeIcons[props.purpose ?? 'info']} aria-hidden="true" />
        <span style={{ flex: 1 }}>
          {props.title && <strong>{props.title}. </strong>}
          {props.text}
          {slots?.actions && <> {slots.actions}</>}
        </span>
      </div>
    ),

    // The library's empty state: a centred column with a large icon, the
    // title as a heading at the demo's current level and the actions side by
    // side.
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

    // pp-sections reads its children as heading-then-content runs and rewires
    // them for the affordance. Each Section brings its content already in the
    // panel the element would otherwise wrap it in, so the element leaves those
    // nodes where React put them. The element takes any heading level, and
    // sizes the titles itself.
    Sections: ({ props, children }) => <pp-sections affordance={props.affordance}>{children}</pp-sections>,

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

    // The library's board (board.css): its groups are the Disclosures inside
    // it, laid along the axis by the modifier.
    Board: ({ props, children }) => (
      <BoardAxis.Provider value={props.axis}>
        <div className={`board board--${props.axis}`}>{children}</div>
      </BoardAxis.Provider>
    ),

    // The library's disclosure: a details element on a layer of its own, or
    // a board's column inside a Board, with the count as a badge beside the
    // title. The drop target is the details element itself, so a closed one,
    // whose contents are not painted or hit-tested, still takes the drop on
    // its summary. The element reports every change of `open`, the ones
    // React makes included, so a change that agrees with the state is no
    // change.
    Disclosure: ({ props, children, bindings, emit }) => {
      const [open, change] = useDisclosureOpen(props.open, bindings?.open, emit);
      const { ref, over } = useDisclosureDrop(props, bindings, emit, open, change);
      const inBoard = useContext(BoardAxis) != null;
      return (
        <details
          ref={ref}
          className={inBoard ? 'board__column' : 'layer borderless'}
          open={open}
          onToggle={event => change(event.currentTarget.open)}
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
        {props.items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    ),

    DescriptionList: ({ props }) => (
      <dl className={clsx('description-list', props.draggable && 'description-list--draggable')}>
        {props.items.map(item => props.draggable ? (
          <DraggableRow key={item.label} id={item.id} label={item.label} value={item.value} />
        ) : (
          <Fragment key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </Fragment>
        ))}
      </dl>
    ),

    // The library's table. pp-table is the scroll container and takes focus,
    // so it is a region named by `label`. A header or cell set to `end` takes
    // the table's right alignment class.
    Table: ({ props, children }) => (
      <pp-table role="region" aria-label={props.label}>
        <table>
          <thead>
            <tr>
              {props.columns.map((column, index) => (
                <th key={index} className={column.align === 'end' ? 'pp-table-align-right' : undefined}>
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

    // The library's conversation layout, as in the Messaging stories: the
    // actor's messages sit on a raised bubble at the end of the line. A marked
    // run's note is a pp-tooltip, which opens on hover and on focus of the
    // mark, so the mark takes focus for actors on a keyboard. The tooltip's
    // styles underline the mark to say a note is there. A linked run traces
    // its link (mark-tracing.ts); the library's message styles drop the
    // highlight from a run marked data-dimmed, and a hidden line names the
    // runs it is linked to. A message's children (controls answered in place)
    // follow its text inside the body; a message of controls alone drops the
    // raised surface, as the library's inline interfaces do.
    Messages: ({ children }) => (
      <TracingProvider value={useTracingState()}>
        <div className="messages layer">{children}</div>
      </TracingProvider>
    ),

    Message: ({ props, children }) => {
      const tracing = useMarkTracing(props.parts);
      return (
        <div className={clsx('message', props.from === 'actor' ? 'message--outbound' : 'message--inbound')}>
          <div className="message__content">
            <div className={clsx('message__body', props.from === 'actor' && props.parts.length > 0 && 'layer')}>
              {props.parts.map((part, index) => {
                if (typeof part === 'string') return part;
                const { dimmed, linkedTo, handlers } = tracing(index);
                const mark = (
                  <mark key={index} tabIndex={part.note ? 0 : undefined} data-dimmed={dimmed || undefined} {...handlers}>
                    {part.text}
                    {linkedTo.length > 0 && <span className="visually-hidden">, linked to: {linkedTo.join('; ')}</span>}
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

    // The library's message composer: the field on a raised surface, with
    // its actions on a row beneath it.
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
                onChange={event => setValue(event.target.value)}
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

    // The library's timeline is the stepper. A stepper inside an entry drops
    // its rail by itself. An expandable entry is a <details> placed directly
    // in the entry's content, where the stepper turns the rail dot into its
    // disclosure marker; the time stays outside it, so it shows while the
    // entry is closed. The actor's own entry takes the raised surface. A
    // named actor with a destination is a link, which the stepper sets in a
    // medium weight; one without is strong.
    Timeline: ({ props, children }) => (
      <ol
        className="stepper"
        style={props.density === 'compact' ? ({ '--_circle-size': '0.5rem' } as CSSProperties) : undefined}
      >
        {children}
      </ol>
    ),

    TimelineEntry: ({ props, children, bindings }) => {
      const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
      let title = (
        <>
          {typeof props.by === 'string' && <><strong>{props.by}</strong> </>}
          {props.by && typeof props.by === 'object' && <><a href={props.by.href}>{props.by.name}</a> </>}
          {props.title}
        </>
      );
      if (props.pending) title = <span className="shimmer">{title}</span>;
      return (
        <li className={clsx('stepper__item', props.from === 'actor' && 'layer')}>
          <div className={clsx('stepper__content', !props.expandable && 'flow')}>
            {props.expandable ? (
              <details open={open} onToggle={event => setOpen(event.currentTarget.open)}>
                {/* summary lays its children out as a row, so the title stays one child */}
                <summary><span>{title}</span></summary>
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

    // A List is its own surface, as the shadcn List is a card: `layer` raises
    // it off whatever it sits on.
    List: ({ props, children }) => (
      <pp-list className={clsx('layer', props.borderless && 'borderless')}>{children}</pp-list>
    ),

    // pp-list ticks a checkbox row itself and announces it with pp-select on
    // the list, so a bound row listens there for its own item and writes the
    // new value back to state.
    ListItem: ({ props, children, slots, bindings }) => {
      const ref = useRef<HTMLElement & { checked: boolean }>(null);
      const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
      const bound = Boolean(bindings?.checked);
      useEffect(() => {
        const item = ref.current;
        const list = item?.closest('pp-list');
        if (!bound || !props.checkbox || !item || !list) return;
        const onSelect = (event: Event) => {
          if ((event as CustomEvent<{ item: HTMLElement }>).detail.item === item) setChecked(item.checked);
        };
        list.addEventListener('pp-select', onSelect);
        return () => list.removeEventListener('pp-select', onSelect);
      }, [bound, props.checkbox, setChecked]);
      const label = props.struck ? <s>{props.label}</s> : props.label;
      return (
        <pp-list-item ref={ref} type={props.checkbox ? 'checkbox' : undefined} checked={Boolean(props.checkbox && checked)}>
          {props.description ? (
            <span>
              {label}
              <small className="muted" style={{ display: 'block' }}>{props.description}</small>
            </span>
          ) : (
            label
          )}
          {children}
          {slots?.suffix && <span data-slot="suffix">{slots.suffix}</span>}
        </pp-list-item>
      );
    },

    // The library's list of cards (.cards--list in card.css), whose rows
    // share their borders. Each Item is its own list item: a repeat reaches
    // the group as one child, so the group cannot wrap the rows itself.
    ItemGroup: ({ props, children }) => (
      <div role="list" aria-label={props.label ?? undefined} className="cards cards--list">
        {children}
      </div>
    ),

    // A card in the list of cards: the title as a heading at the demo's
    // current level (heading-level.ts), in a .stretched-link button when the
    // item opens, and the library's attribute row. A selected item takes the
    // ring the library's collection views give the picked item
    // (view-family.css), and a focused one the lighter tint it gives the
    // focused item. The detail is the library's inline detail (.card >
    // .detail), positioned so it paints above the stretched link.
    Item: ({ props, slots, emit }) => {
      const Heading = useHeading();
      const title = props.opens ? (
        <button
          type="button"
          className="stretched-link"
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
      );
      return (
        <div role="listitem" onPointerEnter={() => emit('focus')} onPointerLeave={() => emit('blur')}>
          <article className="card" data-selected={props.selected ? 'true' : undefined} data-focused={props.focused ? 'true' : undefined}>
            <div className="flow pad">
              <Heading className="label flex">{title}</Heading>
              {slots?.attributes && <div className="card__attributes badges">{slots.attributes}</div>}
            </div>
            {props.expanded && slots?.detail && (
              <div className="detail flow pad">
                <Subsection>{slots.detail}</Subsection>
              </div>
            )}
          </article>
        </div>
      );
    },

    // The library's stat readout. An alert figure takes the danger colour
    // (stat.css).
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

    // A pressable badge is the library's badge on a button, as the
    // collection views draw an attribute value the actor can filter by.
    Badge: ({ props, emit }) => {
      const Root = props.pressable ? 'button' : 'strong';
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
        {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
        {props.text}
      </Root>
      );
    },

    // The library's tag; a pending label shimmers. A removable tag is a
    // .tag-group: the tag, then the remove button as a joined segment, as the
    // active filters in the library's filter bar are drawn. The remove button
    // hands focus on (focus-handoff.ts) if it unmounts while focused.
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
        <button ref={openRef} type="button" className="tag" onClick={() => emit('open')}>
          {content}
        </button>
      ) : (
        <span className="tag">{content}</span>
      );
      if (props.opens || !props.removeLabel) return tag;
      return (
        <span className="tag-group">
          {tag}
          <button ref={removeRef} type="button" className="tag tag-group__remove" onClick={() => emit('remove')}>
            <iconify-icon icon={icons.cancel} aria-hidden="true" />
            <span className="visually-hidden">{props.removeLabel}</span>
          </button>
        </span>
      );
    },

    // Built in pp-filter-tag.tsx from the library's filter chip parts, led by
    // the attribute's icon from this registry's set.
    FilterTag: context => <FilterTag {...context} glyph={context.props.icon ? icons[context.props.icon] : null} />,

    // The library's reference chrome on a button, and its summary popover
    // (`.popover__header`: the heading and body on the leading edge, the
    // controls on the trailing one) in a pp-popup. The popup is portaled to
    // <body>: the reference sits in a paragraph, which cannot hold the
    // preview's blocks, and the top layer keeps it clear of clipping.
    Reference: ({ props, children, slots, bindings, emit }) => {
      const [shown, setShown] = useBoundProp(props.preview, bindings?.preview);
      const { triggerRef, contentRef, trigger, content, close } = usePreview(shown ?? false, setShown, props.expanded ?? false);
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
            <pp-popup anchor={anchor ?? undefined} active={shown ?? false} placement="bottom-start" distance={8} flip shift top-layer="">
              <div ref={contentRef} className="popover" role="dialog" aria-label={props.label} {...content}>
                <div className="popover__header">
                  <div className="flow">
                    <Heading className="label">{props.label}</Heading>
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

    // The library's popover panel (.popover, laid out as the Reference's) in
    // a pp-popup anchored to its host (popover-host.ts). `top-layer` keeps it
    // clear of a scrolling pane and of the rows it overlaps; `light-dismiss`
    // hands outside clicks and Escape to the platform, which closes the popup
    // and fires pp-hide, followed here back into state.
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
      // Opening moves focus to the panel's first control, as shadcn's does,
      // once the popup is showing (a frame after `active` is set).
      useEffect(() => {
        if (!open) return;
        opener.current = captureOpener();
        if (!mayTakeFocus(popup.current)) return;
        const frame = requestAnimationFrame(() => {
          const target = panel.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          (target ?? panel.current)?.focus();
        });
        return () => cancelAnimationFrame(frame);
      }, [open, mayTakeFocus]);
      // The spec closing the panel, such as once a choice in it is made,
      // hides what has focus: it goes back as when the actor closes it.
      const wasOpen = useRef(open);
      useLayoutEffect(() => {
        if (wasOpen.current && !open) {
          const active = document.activeElement;
          // Not settleFocus: the panel still counts as an open window here.
          const back = opener.current;
          if (back && (!active || active === document.body || panel.current?.contains(active)) && !focusDemoIfOpenerGone(back)) {
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

    // The library's dropdown: a plain icon button and a pp-list of radio
    // rows, as the library's view settings menus are drawn, or of checkbox
    // rows that leave it open, as its attribute picker is. Hands focus on
    // (focus-handoff.ts) if a choice removes it while focused.
    Menu: ({ props, children }) => {
      const { trigger, list } = useMenuFocusHandoff(props.focusNext);
      return (
        <pp-dropdown placement="bottom-end" hoist stay-open-on-select={props.multiple ?? false}>
          <button ref={trigger} type="button" className="button button--plain" data-slot="trigger" title={props.label}>
            {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
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
        {props.icon && <iconify-icon data-slot="prefix" className="icon" icon={icons[props.icon]} aria-hidden="true" />}
        {props.label}
      </pp-list-item>
    ),

    // pp-map, which draws its pins and popups over a Leaflet base map. The
    // element takes its places and selection as properties and reports a
    // pin the actor chose as pp-map-select.
    Map: ({ props, bindings, emit }) => {
      const [selected, setSelected] = useBoundProp(props.selected, bindings?.selected);
      const [focused, setFocused] = useBoundProp(props.focused, bindings?.focused);
      const ref = useRef<MapComponent | null>(null);
      // pp-map redraws its pins and refits the view whenever it is handed a
      // new array, so the array changes only with the places.
      const locations = useMemo(
        () => props.locations.map(({ description, ...location }) => ({ ...location, description: description ?? undefined })),
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

    // Hands focus on (focus-handoff.ts) if it unmounts while focused.
    Button: ({ props, emit }) => {
      const ref = useFocusHandoff(props.focusNext);
      useFocusOnShow(ref, props.focusOnShow);
      return (
        <button
          ref={ref}
          type={props.submit ? 'submit' : 'button'}
          className={clsx('button', props.variant && props.variant !== 'default' && `button--${props.variant}`)}
          disabled={props.disabled ?? undefined}
          aria-expanded={props.expanded ?? undefined}
          data-autofocus={props.initialFocus || undefined}
          onClick={() => emit('press')}
        >
          {props.icon && <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />}
          {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
        </button>
      );
    },

    Input: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      // The error is an alert so that it is read out when it appears: the
      // press that sets it leaves focus on the button.
      const field = (
        <>
          <pp-input invalid={Boolean(error)}>
            <input
              id={id}
              type={props.type ?? 'text'}
              aria-label={props.hideLabel ? props.label : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              data-invalid={error ? '' : undefined}
              placeholder={props.placeholder ?? undefined}
              data-autofocus={props.initialFocus || undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            />
          </pp-input>
          {error && fieldError(`${id}-error`, error)}
        </>
      );
      return (
        <div style={fieldLayout}>
          {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
          {field}
        </div>
      );
    },

    // The library's growing textarea: .grow-wrap sizes itself from a copy of
    // the text in data-replicated-value.
    Textarea: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const id = useId();
      return (
        <div style={fieldLayout}>
          <label htmlFor={id}>{props.label}</label>
          <div className="grow-wrap" data-replicated-value={value ?? ''}>
            <textarea
              id={id}
              rows={3}
              placeholder={props.placeholder ?? undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            />
          </div>
        </div>
      );
    },

    // pp-select around a native select. The empty value is a disabled first
    // option (the placeholder, or blank), so the select shows nothing chosen
    // when nothing is, and it cannot be chosen again.
    Select: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const error = useFieldError(bindings?.value, value, props.checks, props.error);
      const id = useId();
      return (
        <div style={fieldLayout}>
          <label htmlFor={id}>{props.label}</label>
          <pp-select invalid={Boolean(error)}>
            <select
              id={id}
              aria-describedby={error ? `${id}-error` : undefined}
              data-invalid={error ? '' : undefined}
              value={value ?? ''}
              onChange={event => setValue(event.target.value)}
            >
              <option value="" disabled>{props.placeholder ?? ''}</option>
              {props.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {error && fieldError(`${id}-error`, error)}
          </pp-select>
        </div>
      );
    },

    // The library's Combobox (cmdk), with its own filtering off: the spec
    // decides which candidates show. cmdk names the input from the root's
    // `label`, so a visible label is only shown, not linked. The field keeps
    // to the library combobox's own width rather than the demo's.
    Combobox: ({ props, bindings, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
      const { open, groups, root, input, list, pick } = useCandidateList(
        props.groups,
        value ?? '',
        setValue,
        () => emit('select'),
        { value: scope, set: setScope },
      );
      return (
        <div style={{ ...fieldLayout, justifyItems: 'start' }}>
          {!props.hideLabel && <span aria-hidden="true">{props.label}</span>}
          <Combobox label={props.label} {...root}>
            <ComboboxInput placeholder={props.placeholder ?? ''} {...input} />
            {open && (
              <ComboboxList {...list}>
                {groups.map((group, index) => (
                  <ComboboxGroup key={group.heading ?? index} heading={group.heading ?? undefined}>
                    {group.options.map(option => (
                      <ComboboxItem key={option.value} value={option.value} onSelect={pick}>
                        {option.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ))}
              </ComboboxList>
            )}
          </Combobox>
        </div>
      );
    },

    RadioGroup: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const name = useId();
      return (
        // The library resets a fieldset's margin, so the form's spacing goes on a wrapper.
        <div>
          <fieldset style={fieldLayout}>
            <legend>{props.label}</legend>
            {props.options.map(option => (
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

    // The library's selectable tags: each a checkbox inside a .tag label, in
    // a row.
    SelectableTags: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      const selected = value ?? [];
      const toggle = (option: string, checked: boolean) =>
        setValue(checked ? [...selected, option] : selected.filter(each => each !== option));
      return (
        <div>
          <fieldset style={fieldLayout}>
            <legend className={props.hideLabel ? 'visually-hidden' : undefined}>{props.label}</legend>
            <div className="inline-flow">
              {props.options.map(option => (
                <label key={option.value} className="form-control tag">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={event => toggle(option.value, event.target.checked)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      );
    },

    // pp-range, which shows its value beside the track and names its input
    // from `label`. The visible label repeats it rather than being linked by
    // `labelledby`, which pp-range reads only when its own props change. It re-emits the input's `input` event once
    // its own value is set. Its prefix and suffix are read once, when it
    // connects, which is enough for fixed bounds.
    Slider: ({ props, bindings }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);
      return (
        <div style={fieldLayout}>
          {!props.hideLabel && <span aria-hidden="true">{props.label}</span>}
          <pp-range
            label={props.label}
            min={props.min}
            max={props.max}
            step={props.step ?? 1}
            value={value ?? props.min}
            onInput={event => setValue((event.currentTarget as HTMLElement & { value: number }).value)}
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
          <input type="checkbox" checked={checked ?? false} onChange={event => setChecked(event.target.checked)} />
          {props.label}
        </label>
      );
    },

    // Submitting runs the spec's checks (form-submit.ts). A form is read
    // most easily at about 36rem, however wide the demo is.
    Form: ({ props, children, emit }) => (
      <form
        className="flow"
        style={{ '--flow-space': 'var(--space-l)', maxInlineSize: '36rem' } as CSSProperties}
        aria-label={props.label ?? undefined}
        noValidate
        onSubmit={event => void submitForm(event, emit)}
      >
        {children}
      </form>
    ),

    // The library's dialog: <pp-modal> around a <dialog class="dialog">, the
    // markup modalService builds, opened and closed from the bound state.
    // pp-modal traps focus, closes on Escape and on a click outside (an alert
    // sets closedby="closerequest", so only Escape), starts focus on the
    // element marked data-autofocus, and hands focus back to the opener.
    //
    // Every close, whether from state, pp-modal or the browser, ends in the
    // dialog's close event, so the state and the focus fallback are settled
    // there (dialog-focus.ts). It fires once the dialog is shut and the page is
    // no longer inert, so the demo can take focus.
    //
    // A window opens a task after its state changes, so that a window closing
    // in the same change (Full to Detail) has closed, and pp-modal has handed
    // its focus back, before this one takes focus.
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
              <h2 className="modal__title" id={titleId}>{props.title}</h2>
              {slots?.suffix && (
                <div className="modal__header-actions">
                  <div className="button-group">{slots.suffix}</div>
                </div>
              )}
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ph:x" aria-hidden="true" />
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

      // As the Dialog: the state and focus settle in the close event.
      const onClose = () => {
        setOpen(false);
        settleFocus(returnTarget(), opener.current);
        opener.current = null;
      };

      useEffect(() => syncModal(modal, open, () => (opener.current = captureOpener())), [open]);

      return createPortal(
        <pp-modal ref={modal}>
          <dialog className="drawer drawer--right" data-modal="false" aria-labelledby={titleId} onClose={onClose}>
            <header className="modal__header">
              <h2 className="modal__title" id={titleId}>{props.title}</h2>
              {slots?.suffix && (
                <div className="modal__header-actions">
                  <div className="button-group">{slots.suffix}</div>
                </div>
              )}
              <button type="button" className="modal__close" data-close aria-label="Close">
                <iconify-icon icon="ph:x" aria-hidden="true" />
              </button>
            </header>
            <div className="drawer__content flow">{children}</div>
          </dialog>
        </pp-modal>,
        document.body,
      );
    },

    // The library's toast. PpToast keeps one group on the page and owns the
    // stacking, the fade, the close button and the pause on hover and focus,
    // so this only opens and closes toasts to match the bound list. The
    // library makes the whole toast the action's button, named by its text,
    // so the action's label joins the message. The toast module loads when
    // the first toast opens.
    Toasts: ({ props, bindings, emit }) => {
      const { dismiss, press } = useToastList(bindings?.toasts, bindings?.pressed, emit);
      // Open toasts call the latest press, so the list effect need not re-run
      // when `emit` changes.
      const pressLatest = useRef(press);
      pressLatest.current = press;
      const shown = useRef(new Map<string, Promise<ToastHandle>>());

      useEffect(() => {
        const listed = new Set(props.toasts.map(toast => toast.id));
        for (const [id, handle] of shown.current) {
          if (listed.has(id)) continue;
          shown.current.delete(id);
          void handle.then(h => h.dismiss());
        }
        for (const toast of props.toasts) {
          if (shown.current.has(toast.id)) continue;
          const handle = import('../../components/toast/toast').then(({ PpToast }) =>
            toast.actionLabel
              ? PpToast.open(`${toast.message} — ${toast.actionLabel}`, () => pressLatest.current(toast), toastDuration.withAction)
              : PpToast.open(toast.message, undefined, toastDuration.plain),
          );
          shown.current.set(toast.id, handle);
          void handle.then(h => h.closed).then(() => {
            if (shown.current.get(toast.id) !== handle) return;
            shown.current.delete(toast.id);
            dismiss(toast.id);
          });
        }
      }, [props.toasts, dismiss]);

      // Switching library unmounts this: close what is showing but leave the
      // list alone, so the other library shows the same toasts.
      useEffect(() => () => {
        const handles = [...shown.current.values()];
        shown.current.clear();
        for (const handle of handles) void handle.then(h => h.dismiss());
      }, []);

      return null;
    },

    // Built in pp-mention-editor.tsx from the library's editor and lists.
    MentionEditor: context => (
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
  actions: actionsSuppliedBySpecs,
});
