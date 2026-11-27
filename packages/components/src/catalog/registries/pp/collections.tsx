import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { useEffect, useRef, type ReactNode } from 'react';
import { useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { useDragRow } from '../../behaviour/drag-drop';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { usePressableTitle } from '../../behaviour/pressable-title';
import { icons } from './icons';

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

export const collections = {
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
      <div role="listitem" onPointerEnter={() => emit('focus')} onPointerLeave={() => emit('blur')}>
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
} satisfies Partial<Components<Catalog>>;
