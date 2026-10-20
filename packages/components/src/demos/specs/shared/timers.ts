// One timer per key: scheduling again replaces the pending write, and a write
// is skipped once the demo has left the page.

type Timer = ReturnType<typeof setTimeout>;

export const keyedTimers = (connected: () => boolean) => {
  const timers = new Map<string, Timer>();
  return (key: string, delay: number, write: () => void) => {
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        if (connected()) write();
      }, delay),
    );
  };
};
