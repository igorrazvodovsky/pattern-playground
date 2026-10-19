import { useRef } from 'react';
import clsx from 'clsx';
import { useDragRow } from './drag-drop';

// One label and value pair of a draggable DescriptionList in the shadcn
// registry, wrapped so that the pair is one box to drag, laid out on the
// list's own columns. shadcn has no drag handle; the row takes the grab cursor
// and fades while it is in flight.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export const DraggableRow = ({ id, label, value }: { id: string | null | undefined; label: string; value: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useDragRow(ref, id, true);
  return (
    <div
      ref={ref}
      className={clsx('col-span-full grid cursor-grab grid-cols-subgrid border-b last:border-b-0', dragging && 'opacity-40')}
    >
      <dt className="pt-2 font-medium text-muted-foreground @sm/demo:py-2 @sm/demo:pr-6">{label}</dt>
      <dd className="pb-2 @sm/demo:py-2">{value}</dd>
    </div>
  );
};
