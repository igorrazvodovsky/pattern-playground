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
