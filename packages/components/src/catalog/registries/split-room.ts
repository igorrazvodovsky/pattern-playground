import { useLayoutEffect, type RefObject } from 'react';
import { useBoundProp } from '@json-render/react';
import { useFitsWidth } from '../../hooks/use-fits-width';

// Whether a Split or Panes is wide enough for its panes, measured rather than
// container-queried: a query can restyle the panes but cannot tell the spec,
// and the spec decides whether to offer the split at all. Both libraries use
// the same line, so the offer does not change when the library does.
//
// When the spec binds `room`, the layout follows the bound value rather than
// the measurement, so the layout and the children the spec shows for it never
// disagree. The measurement is written before paint, so a spec that starts
// with the wrong value is corrected without a visible jump; children it
// showed for that value still mount once, so a spec starts with the value its
// demo usually has.

/** 40rem at a 16px root. */
export const splitMinWidth = 640;

/** Measures the element, writes whether it has room to the bound `room`, and returns the room the layout follows. */
export const useSplitRoom = (ref: RefObject<HTMLElement | null>, room: boolean | null | undefined, binding: string | undefined) => {
  const [bound, setRoom] = useBoundProp(room, binding);
  const measured = useFitsWidth(ref, splitMinWidth);
  // useFitsWidth starts true and corrects itself in its own layout effect, so
  // on the first run `measured` may not be the width yet: read the element.
  useLayoutEffect(() => {
    const element = ref.current;
    setRoom(element ? element.getBoundingClientRect().width >= splitMinWidth : measured);
    // The bound setter is a new function on every render; the room is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured]);
  return binding ? Boolean(bound) : measured;
};
