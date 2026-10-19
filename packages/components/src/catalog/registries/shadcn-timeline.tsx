import { createContext, useContext, useId, type ReactNode } from 'react';
import { Collapsible } from 'radix-ui';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import clsx from 'clsx';

// Timeline and TimelineEntry for the shadcn registry. shadcn/ui has no
// timeline, so this one is drawn from Tailwind classes in shadcn's tokens: a
// dot per entry and a rail between them. An expandable entry is shadcn/ui
// Collapsible, over Radix, with a chevron that turns when it opens. The
// chevron alone is the trigger, named by the title, so that an actor's link in
// the title is not nested in a button. A pending
// entry spins shadcn Spinner's icon in place of its dot, as a pending Tag
// does. An actor with a destination is a link in shadcn's typography: medium
// weight, underlined. A timeline inside an entry knows it is nested from
// context and drops its rail and dots.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

type Density = 'normal' | 'compact';
type Context = { density: Density; nested: boolean };

const TimelineContext = createContext<Context | null>(null);

export const Timeline = ({ density, children }: { density: Density; children?: ReactNode }) => {
  const nested = useContext(TimelineContext) !== null;
  return (
    <TimelineContext.Provider value={{ density, nested }}>
      <ol className={clsx('flex flex-col text-sm', nested ? 'gap-2 pt-2 text-muted-foreground' : 'gap-0')}>{children}</ol>
    </TimelineContext.Provider>
  );
};

type By = string | { name: string; href: string };

interface EntryProps {
  title: string;
  by: By | null;
  time: string | null;
  fromActor: boolean;
  pending: boolean;
  expandable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
}

export const TimelineEntry = ({ title, by, time, fromActor, pending, expandable, open, onOpenChange, children }: EntryProps) => {
  const { density, nested } = useContext(TimelineContext) ?? { density: 'normal', nested: false };
  const compact = density === 'compact';
  const headingId = useId();
  const heading = (
    <span id={headingId} className={clsx('min-w-0 flex-1', pending && 'text-muted-foreground')}>
      {typeof by === 'string' && <span className="font-medium text-foreground">{by} </span>}
      {by && typeof by === 'object' && (
        <>
          <a href={by.href} className="font-medium text-foreground underline underline-offset-4 hover:text-primary">{by.name}</a>{' '}
        </>
      )}
      {title}
    </span>
  );
  const body = expandable ? (
    <Collapsible.Root open={open} onOpenChange={onOpenChange}>
      <div className="flex items-start gap-1">
        {heading}
        <Collapsible.Trigger
          aria-labelledby={headingId}
          className="shrink-0 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 [&[data-state=open]>svg]:rotate-90"
        >
          <ChevronRight aria-hidden="true" className="mt-0.5 size-4 transition-transform" />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="flex flex-col gap-2 pt-2">{children}</Collapsible.Content>
    </Collapsible.Root>
  ) : (
    <>
      <p>{heading}</p>
      {children}
    </>
  );
  return (
    <li className={clsx('group/entry relative flex gap-3', !nested && 'pb-5 last:pb-0')}>
      {!nested && (
        <>
          <span aria-hidden="true" className="absolute top-5 bottom-0 left-[5px] w-px bg-border group-last/entry:hidden" />
          {pending ? (
            <LoaderCircle aria-hidden="true" className="mt-0.5 size-3 shrink-0 animate-spin text-muted-foreground motion-reduce:animate-none" />
          ) : (
            <span aria-hidden="true" className={clsx('shrink-0 rounded-full bg-muted-foreground/40', compact ? 'mt-1.5 ml-[2px] size-2' : 'mt-1 size-3')} />
          )}
        </>
      )}
      <div className={clsx('flex min-w-0 flex-1 flex-col gap-1', fromActor && 'rounded-lg bg-secondary px-3 py-2 text-secondary-foreground')}>
        {body}
        {time && <p className="text-xs text-muted-foreground">{time}</p>}
      </div>
    </li>
  );
};
