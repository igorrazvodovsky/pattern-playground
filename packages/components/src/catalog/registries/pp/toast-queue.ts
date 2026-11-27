import { useEffect, useEffectEvent, useRef } from 'react';
import { toastDuration } from '../../catalog';
import type { ToastHandle } from '../../../components/toast/toast';
import { useToastList, type ToastEntry } from '../../behaviour/toast-list';

// Shows the spec's toast list through PpToast, which opens each toast on its
// own: a toast shows when it joins the list, closes when it leaves it, and
// leaves the list when it closes. The library makes the whole toast the
// action's button, named by its text, so the action's label joins the message.
export const usePpToasts = (
  toasts: ToastEntry[],
  listPath: string | undefined,
  pressedPath: string | undefined,
  emit: (event: string) => void,
) => {
  const { dismiss, press } = useToastList(listPath, pressedPath, emit);
  // Open toasts call the latest press, so the list effect need not re-run
  // when `emit` changes.
  const onPress = useEffectEvent((toast: ToastEntry) => void press(toast));
  const shown = useRef(new Map<string, Promise<ToastHandle>>());

  useEffect(() => {
    const listed = new Set(toasts.map((toast) => toast.id));
    for (const [id, handle] of shown.current) {
      if (listed.has(id)) continue;
      shown.current.delete(id);
      void handle.then((h) => h.dismiss());
    }
    for (const toast of toasts) {
      if (shown.current.has(toast.id)) continue;
      const handle = import('../../../components/toast/toast').then(({ PpToast }) =>
        toast.actionLabel
          ? PpToast.open(
              `${toast.message} — ${toast.actionLabel}`,
              () => onPress(toast),
              toastDuration.withAction,
            )
          : PpToast.open(toast.message, undefined, toastDuration.plain),
      );
      shown.current.set(toast.id, handle);
      void handle
        .then((h) => h.closed)
        .then(() => {
          if (shown.current.get(toast.id) !== handle) return;
          shown.current.delete(toast.id);
          dismiss(toast.id);
        });
    }
  }, [toasts, dismiss]);

  // Switching library unmounts this: close what is showing but leave the
  // list alone, so the other library shows the same toasts.
  useEffect(
    () => () => {
      const handles = [...shown.current.values()];
      shown.current.clear();
      for (const handle of handles) void handle.then((h) => h.dismiss());
    },
    [],
  );
};
