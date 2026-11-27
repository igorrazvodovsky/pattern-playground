import { useEffect, useId, useRef, type RefObject } from 'react';
import { useBoundProp } from '@json-render/react';
import {
  captureOpener,
  settleFocus,
  useReturnFocus,
  type Opener,
} from '../../behaviour/dialog-focus';

type PpModal = HTMLElement & { open: () => void; close: () => void };

// An open waits a task, so that a window closing in the same state change has
// closed and handed its focus back before this one takes focus.
const syncModal = (
  modal: RefObject<PpModal | null>,
  open: boolean | null | undefined,
  onOpen: () => void,
) => {
  let timer: number | undefined;
  let cancelled = false;
  void customElements.whenDefined('pp-modal').then(() => {
    const el = modal.current;
    const dialog = el?.querySelector('dialog');
    if (cancelled || !el || !dialog) return;
    if (!open && dialog.open) el.close();
    if (open && !dialog.open) {
      timer = window.setTimeout(() => {
        if (dialog.open) return;
        onOpen();
        el.open();
      });
    }
  });
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
};

// A catalog window that is a <pp-modal> around a <dialog>, such as a dialog or
// a drawer: its open state is bound to the spec, and closing it hands focus
// back to where it came from.
export const useModalWindow = (
  open: boolean | null | undefined,
  binding: string | undefined,
  returnFocus: string | null | undefined,
) => {
  const [shown, setShown] = useBoundProp(open, binding);
  const modal = useRef<PpModal>(null);
  const opener = useRef<Opener | null>(null);
  const returnTarget = useReturnFocus(returnFocus);
  const titleId = useId();

  const onClose = () => {
    setShown(false);
    settleFocus(returnTarget(), opener.current);
    opener.current = null;
  };

  useEffect(() => syncModal(modal, shown, () => (opener.current = captureOpener())), [shown]);

  return { modal, titleId, onClose };
};
