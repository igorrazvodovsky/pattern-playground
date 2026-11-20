import type { ComponentProps, ReactNode } from 'react';
import { Collapsible } from 'radix-ui';
import { ChevronRight } from 'iconoteka-react';
import { cn } from './cn';

// shadcn/ui Trace (base-nova), on Radix's Collapsible instead of Base UI's:
// the line an agent's work is told in, one line per step, with a collapsible
// line for a step whose detail the actor can open. AI Elements builds its
// Reasoning, Chain of Thought, Plan, Task, Queue, Tool and Sources from it.
// The height transition is left out, as the registry leaves out enter and exit
// animations throughout.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export type TraceStatus = 'running' | 'error' | 'pending';

export const Trace = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="trace"
    className={cn(
      'flex w-full min-w-0 flex-col gap-2 *:has-[>[data-slot=trace-line]]:flex *:has-[>[data-slot=trace-line]]:w-fit *:has-[>[data-slot=trace-line]]:max-w-full *:has-[>[data-slot=trace-line]]:min-w-0 *:has-[>[data-slot=trace-line]]:rounded-md *:has-[>[data-slot=trace-line]]:text-left *:has-[>[data-slot=trace-line]]:outline-none *:has-[>[data-slot=trace-line]]:focus-visible:ring-3 *:has-[>[data-slot=trace-line]]:focus-visible:ring-ring/50',
      className,
    )}
    {...props}
  />
);

export const TraceLine = ({
  className,
  status,
  ...props
}: ComponentProps<'span'> & { status?: TraceStatus }) => (
  <span
    data-slot="trace-line"
    data-status={status}
    className={cn(
      'flex w-fit max-w-full min-w-0 items-center gap-2 text-sm text-muted-foreground transition-colors in-[a,button]:cursor-pointer in-[a:hover,button:hover]:text-foreground data-[status=error]:text-destructive data-[status=error]:in-[a:hover,button:hover]:text-destructive data-[status=pending]:opacity-60 data-[status=running]:*:data-[slot=trace-title]:shimmer',
      className,
    )}
    {...props}
  />
);

export const TraceIcon = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-icon"
    aria-hidden="true"
    className={cn(
      "flex size-4 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [[data-slot=trace-title]~&]:-ml-1",
      className,
    )}
    {...props}
  />
);

export const TraceTitle = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-title"
    className={cn('min-w-0 truncate motion-reduce:shimmer-none', className)}
    {...props}
  />
);

export const TraceDescription = ({ className, ...props }: ComponentProps<'span'>) => (
  <span
    data-slot="trace-description"
    className={cn('shrink-0 text-muted-foreground/70 tabular-nums', className)}
    {...props}
  />
);

export const TraceCollapsible = ({
  className,
  ...props
}: ComponentProps<typeof Collapsible.Root>) => (
  <Collapsible.Root
    data-slot="trace-collapsible"
    className={cn('flex w-full min-w-0 flex-col', className)}
    {...props}
  />
);

export const TraceCollapsibleTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Collapsible.Trigger>) => (
  <Collapsible.Trigger
    data-slot="trace-collapsible-trigger"
    className={cn(
      'group/trace-collapsible-trigger flex w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 has-[[data-status=error]]:text-destructive',
      className,
    )}
    {...props}
  >
    {children}
    <TraceIcon className="transition-transform group-aria-expanded/trace-collapsible-trigger:rotate-90">
      <ChevronRight />
    </TraceIcon>
  </Collapsible.Trigger>
);

// The content of a step: beneath its line, behind a rule. Used inside a
// TraceCollapsible, and on its own for a step whose content always shows.
export const TraceContentInner = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => (
  <div
    data-slot="trace-collapsible-content-inner"
    className={cn(
      'mt-2 mb-1 ml-[calc(--spacing(2)-1px)] flex min-w-0 flex-col gap-2 border-l pr-1 pl-4 leading-relaxed wrap-break-word text-muted-foreground',
      className,
    )}
  >
    {children}
  </div>
);

export const TraceCollapsibleContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof Collapsible.Content>) => (
  <Collapsible.Content
    data-slot="trace-collapsible-content"
    className="min-w-0 overflow-hidden"
    {...props}
  >
    <TraceContentInner className={className}>{children}</TraceContentInner>
  </Collapsible.Content>
);
