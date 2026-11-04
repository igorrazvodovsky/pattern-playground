import { useCallback, useContext } from 'react';
import { useStateStore } from '@json-render/react';
import { DemoRoot } from './dialog-focus';
import { focusableWithKey } from './focus-handoff';

// Dismissals arrive from library callbacks, after other toasts may have been
// added or removed, so they filter the list as it is in the store now.

export interface ToastEntry {
  id: string;
  message: string;
  actionLabel: string | null;
  focusNext?: string | null;
}

// The toast leaves the page with its action, so focus would fall to the body
// in pp and to the toast region at the end of the page in shadcn. Focus waits
// on the demo while the action runs, so a window the action opens records the
// demo as its opener, then goes to the control the toast names, such as the
// restored item. Focus that the action moved itself, as into a drawer, stays.
const focusAfterAction = (demo: HTMLElement, focusNext: string | null | undefined) => {
  if (!demo.isConnected) return;
  const active = document.activeElement;
  if (active && active !== document.body && active !== demo) return;
  const target = focusNext ? focusableWithKey(demo, focusNext)[0] : undefined;
  target?.focus();
};

export const useToastList = (
  listPath: string | undefined,
  pressedPath: string | undefined,
  emit: (event: string) => void,
) => {
  const { get, set } = useStateStore();
  const demo = useContext(DemoRoot);

  const dismiss = useCallback(
    (id: string) => {
      if (!listPath) return;
      const toasts = (get(listPath) as ToastEntry[] | undefined) ?? [];
      set(
        listPath,
        toasts.filter((toast) => toast.id !== id),
      );
    },
    [get, set, listPath],
  );

  // Events carry no payload, so the pressed toast is written before the event.
  const press = useCallback(
    async (toast: ToastEntry) => {
      const root = demo?.current;
      root?.focus();
      if (pressedPath) set(pressedPath, toast);
      try {
        // Typed void, but resolves once the bound actions have run.
        await emit('action');
      } finally {
        // A frame for the restored control to render, then a task, so a
        // window the action opens (pp opens one a task late) has taken focus.
        if (root)
          requestAnimationFrame(() => setTimeout(() => focusAfterAction(root, toast.focusNext)));
      }
    },
    [set, pressedPath, emit, demo],
  );

  return { dismiss, press };
};
