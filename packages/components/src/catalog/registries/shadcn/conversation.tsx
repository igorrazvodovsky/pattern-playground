import { Suspense, useId } from 'react';
import { useBoundProp, type Components } from '@json-render/react';
import { Collapsible, Tooltip } from 'radix-ui';
import { cn } from './cn';
import { ChevronRight } from 'iconoteka-react';
import type { Catalog } from '../../catalog';
import { useCompletionList } from '../../behaviour/completion-list';
import { scopedPortal } from './portal';
import { ComposerField } from './composer-field';
import { ShadcnMentionEditor } from './mention-editor-lazy';
import { tooltipArrow, tooltipContent } from './parts';
import { Timeline, TimelineEntry } from './timeline';
import { Bubble, BubbleContent, Message as ShadcnMessage, MessageContent } from './message';
import { TraceList, TraceStep } from './trace-step';
import { Citation } from './citation';
import { useDisclosureState } from '../../behaviour/disclosure-state';
import { TracingProvider, useMarkTracing, useTracingState } from '../../behaviour/mark-tracing';
import { icons } from './icons';
import { badgeClass, markClass } from './classes';

export const conversation = {
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
        (part.note || part.link) && 'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
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
    const completion = useCompletionList(
      slots?.field ? [] : (props.completions ?? []),
      value ?? '',
      setValue,
    );
    return (
      <>
        <div className="flex flex-col gap-1 rounded-xl border border-input bg-background p-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
          {slots?.attachments && (
            <Collapsible.Root
              defaultOpen
              data-slot="collapsible"
              className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2"
            >
              <Collapsible.Trigger
                data-slot="collapsible-trigger"
                className="flex items-center gap-2 rounded-lg px-1 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 [&[data-state=open]>svg]:rotate-90"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
                />
                {props.attachedCount != null && (
                  <span className={badgeClass('neutral', false)}>{props.attachedCount}</span>
                )}
                attached
              </Collapsible.Trigger>
              <Collapsible.Content data-slot="collapsible-content">
                {slots.attachments}
              </Collapsible.Content>
            </Collapsible.Root>
          )}
          {slots?.field ? (
            <ComposerField value>{slots.field}</ComposerField>
          ) : (
            <input
              {...completion.field}
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
        {completion.visible && (
          <ul {...completion.list} aria-label="Ways to continue" className="flex flex-col gap-0.5">
            {completion.options.map((option) => (
              <li
                key={option.key}
                {...option.props}
                className="cursor-pointer rounded-md px-2 py-1.5 text-sm aria-selected:bg-muted"
              >
                {option.typed}
                <span className="text-muted-foreground">{option.rest}</span>
              </li>
            ))}
          </ul>
        )}
      </>
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

  Citation: ({ props }) => (
    <Citation
      label={props.label}
      title={props.title}
      description={props.description ?? null}
      href={props.href}
    />
  ),

  MentionEditor: (context) => (
    <Suspense fallback={null}>
      <ShadcnMentionEditor {...context} />
    </Suspense>
  ),
} satisfies Partial<Components<Catalog>>;
