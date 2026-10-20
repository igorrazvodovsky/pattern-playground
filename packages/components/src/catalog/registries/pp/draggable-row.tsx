import { useRef } from 'react';
import { useDragRow } from '../../behaviour/drag-drop';

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
