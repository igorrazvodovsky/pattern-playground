import { useRef } from 'react';
import {
  captureOpener,
  settleFocus,
  useReturnFocus,
  type Opener,
} from '../../behaviour/dialog-focus';

// Radix returns focus to its Trigger, and a Dialog or Sheet opened from state
// has none, so the element that had focus when it opened is recorded and
// focused again on close. Radix calls onCloseAutoFocus a task after the window
// unmounts, so a window that replaced it has mounted and taken focus by then.
export const useWindowFocus = (returnFocus: string | null | undefined) => {
  const opener = useRef<Opener | null>(null);
  const returnTarget = useReturnFocus(returnFocus);
  return {
    opened: () => {
      opener.current = captureOpener();
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      settleFocus(returnTarget(), opener.current);
      opener.current = null;
    },
  };
};
