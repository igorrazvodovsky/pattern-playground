import { useState } from 'react';
import { useBoundProp } from '@json-render/react';

// Whether a disclosure is open. Bound, the state lives in the demo's store, so
// switching library keeps it; unbound, `open` is only where it starts, and the
// component keeps its own state from there.
export function useDisclosureState(open: boolean | null | undefined, binding: string | undefined) {
  const [bound, setBound] = useBoundProp(open, binding);
  const [local, setLocal] = useState(open ?? false);
  return binding
    ? ([bound ?? false, (next: boolean) => setBound(next)] as const)
    : ([local, setLocal] as const);
}

/**
 * A Disclosure's open state, the same in every registry. It is open unless
 * `open` is false. Given `open`, bound or computed, the spec owns the state:
 * the actor's change is written back where bound and emitted as `toggle`
 * either way. Without it the component keeps its own.
 */
export function useDisclosureOpen(
  open: boolean | null | undefined,
  binding: string | undefined,
  emit: (event: string) => unknown,
) {
  const [bound, setBound] = useBoundProp(open, binding);
  const [local, setLocal] = useState(true);
  const owned = binding != null || open != null;
  const shown = owned ? bound !== false : local;
  const change = (next: boolean) => {
    if (next === shown) return;
    if (owned) setBound(next);
    else setLocal(next);
    void emit('toggle');
  };
  return [shown, change] as const;
}
