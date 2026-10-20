import { useCallback } from 'react';
import { useStateStore } from '@json-render/react';

// Dismissals arrive from library callbacks, after other toasts may have been
// added or removed, so they filter the list as it is in the store now.

export interface ToastEntry {
  id: string;
  message: string;
  actionLabel: string | null;
}

export const useToastList = (listPath: string | undefined, pressedPath: string | undefined, emit: (event: string) => void) => {
  const { get, set } = useStateStore();

  const dismiss = useCallback((id: string) => {
    if (!listPath) return;
    const toasts = (get(listPath) as ToastEntry[] | undefined) ?? [];
    set(listPath, toasts.filter(toast => toast.id !== id));
  }, [get, set, listPath]);

  // Events carry no payload, so the pressed toast is written before the event.
  const press = useCallback((toast: ToastEntry) => {
    if (pressedPath) set(pressedPath, toast);
    void emit('action');
  }, [set, pressedPath, emit]);

  return { dismiss, press };
};
