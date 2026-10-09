import { useState } from 'react';

// Headless state machine for the pattern — bring your own markup and styling.
// The pattern's own demo is a spec (demos/specs/inline-confirmation.json);
// this hook serves React demos that compose inline confirmation into a larger
// move (action-consequences).
export function useInlineConfirm(onConfirm: () => void, timeout = 4000) {
  const [confirming, setConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const arm = () => {
    setConfirming(true);
    const id = setTimeout(() => setConfirming(false), timeout);
    setTimeoutId(id);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
  };

  const confirm = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
    onConfirm();
  };

  return { confirming, arm, cancel, confirm };
}
