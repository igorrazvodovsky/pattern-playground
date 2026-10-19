import { useEffect, type RefObject } from 'react';
import { useFitsWidth } from '../../hooks/use-fits-width';

// Whether a Split is wide enough for its two panes, measured rather than
// container-queried: a query can restyle the panes but cannot tell the spec,
// and the spec decides whether to offer the split at all. Both libraries use
// the same line, so the offer does not change when the library does.

/** 40rem at a 16px root. */
export const splitMinWidth = 640;

/** Measures the Split and writes whether it has room to `report`, on mount and whenever that changes. */
export const useSplitRoom = (ref: RefObject<HTMLElement | null>, report: (room: boolean) => void) => {
  const room = useFitsWidth(ref, splitMinWidth);
  useEffect(() => {
    report(room);
    // The bound setter is a new function on every render; the room is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);
  return room;
};
