import { useLayoutEffect, type RefObject } from 'react';
import { useBoundProp } from '@json-render/react';
import { useFitsWidth } from '../../hooks/use-fits-width';

// Measured rather than container-queried: a query can restyle the panes but
// cannot tell the spec, and the spec decides whether to offer the split.
//
// When the spec binds `room`, the layout follows the bound value rather than
// the measurement, so the layout and the children the spec shows for it never
// disagree.

/** 40rem at a 16px root. */
export const splitMinWidth = 640;

export const useSplitRoom = (
  ref: RefObject<HTMLElement | null>,
  room: boolean | null | undefined,
  binding: string | undefined,
) => {
  const [bound, setRoom] = useBoundProp(room, binding);
  const measured = useFitsWidth(ref, splitMinWidth);
  // useFitsWidth starts true and corrects itself in its own layout effect, so
  // on the first run `measured` may not be the width yet: read the element.
  useLayoutEffect(() => {
    const element = ref.current;
    setRoom(element ? element.getBoundingClientRect().width >= splitMinWidth : measured);
    // The bound setter is a new function on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measured]);
  return binding ? Boolean(bound) : measured;
};
