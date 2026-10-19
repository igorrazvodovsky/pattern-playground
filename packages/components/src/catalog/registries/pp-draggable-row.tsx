import { useRef } from 'react';
import { useDragRow } from './drag-drop';

// One label and value pair of a draggable DescriptionList in the pp registry,
// wrapped so that the pair is one box to drag. The library's
// .description-list--draggable lays the wrapper out on the list's own columns
// and fades the row while it is in flight.

export const DraggableRow = ({ id, label, value }: { id: string | null | undefined; label: string; value: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useDragRow(ref, id, true);
  return (
    <div ref={ref} data-dragging={dragging || undefined}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
};
