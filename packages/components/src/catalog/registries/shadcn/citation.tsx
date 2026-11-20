import { HoverCard } from 'radix-ui';
import { scopedPortal } from './portal';

// AI Elements' Inline Citation: a source in the sentence it supports, shown
// as its host on a secondary xs Button and previewed in a Hover Card. The
// chip is a link to the source, so it can be followed from the keyboard too;
// the card is a preview for the pointer and for focus, and holds nothing the
// link does not already reach.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

interface CitationProps {
  label: string;
  title: string;
  description: string | null;
  href: string;
}

export const Citation = ({ label, title, description, href }: CitationProps) => (
  <HoverCard.Root openDelay={10} closeDelay={100}>
    <HoverCard.Trigger asChild>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-6 items-center rounded-[min(var(--radius-md),10px)] bg-secondary px-2 align-middle text-xs font-medium text-secondary-foreground no-underline transition-colors outline-none hover:bg-secondary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {label}
        <span className="sr-only">: {title} (opens in a new tab)</span>
      </a>
    </HoverCard.Trigger>
    <HoverCard.Portal container={scopedPortal()}>
      <HoverCard.Content
        side="bottom"
        sideOffset={4}
        className="z-50 flex w-64 flex-col gap-1 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden"
      >
        <div className="font-medium">{title}</div>
        {description && <p className="text-muted-foreground">{description}</p>}
        <span className="text-xs text-muted-foreground">{label}</span>
      </HoverCard.Content>
    </HoverCard.Portal>
  </HoverCard.Root>
);
