import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { Children, useContext, useRef, type CSSProperties } from 'react';
import clsx from 'clsx';
import { BoardAxis } from '../../behaviour/board-axis';
import { useDisclosureOpen } from '../../behaviour/disclosure-state';
import { useDisclosureDrop, useStackDrop } from '../../behaviour/drag-drop';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { useSplitRoom } from '../../behaviour/split-room';

const gapClass = { none: 'gap-0', s: 'gap-xs', m: 'gap-s', l: 'gap-m' } as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;

export const layout = {
  Stack: ({ props, children, bindings, emit }) => {
    const { ref, over } = useStackDrop(props, bindings, emit);
    const gap = props.gap ?? 'm';
    const horizontal = props.direction === 'horizontal';
    const attributes = {
      'className': clsx(
        horizontal
          ? [
              'flex wrap',
              `items-${props.align ?? 'center'}`,
              props.justify === 'end' && 'justify-end',
            ]
          : ['grid-stack', props.align === 'start' && 'grid-stack--start'],
        gapClass[gap],
        props.dropTarget && 'view-family__pane',
      ),
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
} satisfies Partial<Components<Catalog>>;
