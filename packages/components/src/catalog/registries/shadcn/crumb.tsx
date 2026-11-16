import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { DropdownMenu } from 'radix-ui';
import { ChevronRight, More } from 'iconoteka-react';
import { cn } from './cn';
import { observeTrailFit } from '../../../utility/trail-fit';
import { useFocusHandoff, useMenuFocusHandoff } from '../../behaviour/focus-handoff';
import { menuContent, menuItem } from './parts';
import { scopedPortal } from './portal';

// shadcn/ui Breadcrumb (radix-nova), with the list kept on one line: the
// trail collapses its items when they do not fit, rather than wrapping.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

const middleClass = 'group-data-[collapsed]/trail:hidden';
const firstClass = 'group-data-[collapsed=all]/trail:hidden';

// Grows into the free space of a row from nothing, so that it can tell when
// its items overflow.
export const Trail = ({ label, children }: { label: string; children: ReactNode }) => {
  const ref = useRef<HTMLOListElement>(null);
  useLayoutEffect(
    () => (ref.current ? observeTrailFit(ref.current, 'data-collapsed') : undefined),
    [],
  );
  return (
    <nav aria-label={label} className="min-w-0 flex-1">
      <ol
        ref={ref}
        className="group/trail flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground"
      >
        {children}
      </ol>
    </nav>
  );
};

// Picking an item makes it the current one, which ends the trail without a
// link, so a picked link hands focus on.
export const Crumb = ({
  label,
  stage,
  onPick,
}: {
  label: string;
  stage: 'first' | 'middle';
  onPick: () => void;
}) => {
  const gives = stage === 'first' ? firstClass : middleClass;
  const ref = useFocusHandoff<HTMLAnchorElement>(null);
  return (
    <>
      <li className={cn('inline-flex items-center gap-1', gives)}>
        <a
          ref={ref}
          href="#"
          className="transition-colors hover:text-foreground"
          onClick={(event) => {
            event.preventDefault();
            onPick();
          }}
        >
          {label}
        </a>
      </li>
      <li role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5', gives)}>
        <ChevronRight />
      </li>
    </>
  );
};

// Picking an item can shorten the trail until the menu goes, while focus is
// in it, so it hands focus on.
export const CrumbOverflow = ({
  items,
  middle,
  onPick,
}: {
  items: { id: string; label: string }[];
  middle: boolean;
  onPick: (id: string) => void;
}) => {
  const { trigger, list, closed } = useMenuFocusHandoff(null);
  const shows = middle
    ? 'group-data-[collapsed]/trail:inline-flex'
    : 'group-data-[collapsed=all]/trail:inline-flex';
  const separates = middle
    ? 'group-data-[collapsed]/trail:block'
    : 'group-data-[collapsed=all]/trail:block';
  return (
    <>
      <li className={cn('hidden items-center gap-1', shows)}>
        <DropdownMenu.Root onOpenChange={(open) => !open && closed()}>
          <DropdownMenu.Trigger
            ref={trigger}
            aria-label="Hidden items"
            className="flex size-5 items-center justify-center rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:size-4"
          >
            <More aria-hidden="true" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal container={scopedPortal()}>
            <DropdownMenu.Content ref={list} align="start" sideOffset={4} className={menuContent}>
              {items.map((item) => (
                <DropdownMenu.Item
                  key={item.id}
                  onSelect={() => onPick(item.id)}
                  className={menuItem}
                >
                  {item.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </li>
      <li
        role="presentation"
        aria-hidden="true"
        className={cn('hidden [&>svg]:size-3.5', separates)}
      >
        <ChevronRight />
      </li>
    </>
  );
};
