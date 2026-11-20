import type { ComponentProps } from 'react';
import { cn } from './cn';

// shadcn/ui Message and Bubble (base-nova), the parts AI Elements builds a
// conversation turn from: the actor's text is a muted Bubble on a Message
// aligned to the end, and the other side's reply sits on the Message without
// a bubble. Bubble's other variants are left out until a demo needs them.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

type Align = 'start' | 'end';

export const Message = ({
  className,
  align = 'start',
  ...props
}: ComponentProps<'div'> & { align?: Align }) => (
  <div
    data-slot="message"
    data-align={align}
    className={cn(
      'group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse',
      className,
    )}
    {...props}
  />
);

export const MessageContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="message-content"
    className={cn(
      'flex w-full min-w-0 flex-col gap-2.5 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end',
      className,
    )}
    {...props}
  />
);

export const Bubble = ({
  className,
  align = 'start',
  ...props
}: ComponentProps<'div'> & { align?: Align }) => (
  <div
    data-slot="bubble"
    data-variant="muted"
    data-align={align}
    className={cn(
      'group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end *:data-[slot=bubble-content]:bg-muted',
      className,
    )}
    {...props}
  />
);

export const BubbleContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="bubble-content"
    className={cn(
      'w-fit max-w-full min-w-0 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end',
      className,
    )}
    {...props}
  />
);
