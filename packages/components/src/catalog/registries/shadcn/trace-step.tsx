import type { ReactNode } from 'react';
import {
  CheckmarkInCircle,
  Circle,
  CircleDot,
  CrossInCircle,
  OpenInNewWindow,
  type IconComponent,
} from 'iconoteka-react';
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceContentInner,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
  type TraceStatus,
} from './trace';

// One line of a Trace as the catalog's TraceLine describes it, assembled the
// way AI Elements assembles its Plan, Tool and Sources lines: an icon by
// status unless the spec names one, the title, a short figure after it, and
// the line's content behind a collapsible or beneath it.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export type StepStatus = 'done' | 'running' | 'pending' | 'error';

const statusIcons: Record<StepStatus, IconComponent> = {
  done: CheckmarkInCircle,
  running: CircleDot,
  pending: Circle,
  error: CrossInCircle,
};

const lineStatus = (status: StepStatus | null): TraceStatus | undefined =>
  status === 'done' || status === null ? undefined : status;

interface StepProps {
  title: string;
  detail: string | null;
  icon: IconComponent | null;
  status: StepStatus | null;
  href: string | null;
  expandable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
}

export const TraceList = ({ children }: { children?: ReactNode }) => (
  <Trace role="list">{children}</Trace>
);

export const TraceStep = ({
  title,
  detail,
  icon,
  status,
  href,
  expandable,
  open,
  onOpenChange,
  children,
}: StepProps) => {
  const Icon = icon ?? (status ? statusIcons[status] : null);
  const line = (
    <TraceLine status={lineStatus(status)}>
      {Icon && !href && (
        <TraceIcon>
          <Icon />
        </TraceIcon>
      )}
      <TraceTitle>
        {title}
        {href && <span className="sr-only"> (opens in a new tab)</span>}
      </TraceTitle>
      {detail && <TraceDescription>{detail}</TraceDescription>}
      {href && (
        <TraceIcon>
          <OpenInNewWindow />
        </TraceIcon>
      )}
    </TraceLine>
  );
  const hasContent = Boolean(children);
  return (
    <div role="listitem" className="flex min-w-0 flex-col">
      {expandable && hasContent ? (
        <TraceCollapsible open={open} onOpenChange={onOpenChange}>
          <TraceCollapsibleTrigger>{line}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>{children}</TraceCollapsibleContent>
        </TraceCollapsible>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex w-fit max-w-full min-w-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {line}
        </a>
      ) : (
        <>
          {line}
          {hasContent && <TraceContentInner>{children}</TraceContentInner>}
        </>
      )}
    </div>
  );
};
