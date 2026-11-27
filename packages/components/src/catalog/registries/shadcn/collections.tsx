import { useRef, useState } from 'react';
import { useBoundProp, type Components } from '@json-render/react';
import { cn } from './cn';
import type { Catalog } from '../../catalog';
import { usePressableTitle } from '../../behaviour/pressable-title';
import { CheckboxField } from './checkbox';
import { Subsection, useHeading } from '../../behaviour/heading-level';
import { useDragRow } from '../../behaviour/drag-drop';
import { icons } from './icons';

export const collections = {
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
} satisfies Partial<Components<Catalog>>;
