import { Children, useContext, useRef, type CSSProperties } from 'react';
import type { Components } from '@json-render/react';
import { Collapsible } from 'radix-ui';
import { cn } from './cn';
import { ChevronRight } from 'iconoteka-react';
import type { Catalog } from '../../catalog';
import { Section, Sections } from './sections';
import { useDisclosureOpen } from '../../behaviour/disclosure-state';
import { BoardAxis } from '../../behaviour/board-axis';
import { useDisclosureDrop, useStackDrop } from '../../behaviour/drag-drop';
import { useSplitRoom } from '../../behaviour/split-room';
import { badgeClass } from './classes';

const gap = { none: 'gap-0', s: 'gap-2', m: 'gap-3', l: 'gap-4' } as const;
const align = {
  start: 'items-start',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
} as const;
const columnWidth = { s: '16ch', m: '24ch', l: '36ch' } as const;

export const layout = {
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

  Sections: ({ props, children }) => <Sections affordance={props.affordance}>{children}</Sections>,

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
} satisfies Partial<Components<Catalog>>;
