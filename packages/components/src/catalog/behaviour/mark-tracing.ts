import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState, type FocusEvent } from 'react';

// Hover and focus are kept apart so the pointer leaving a run falls back to the
// run that still has focus. Only keyboard focus traces: a click focuses the
// mark too, and would otherwise leave the trace on after the pointer left.
//
// A Message that changes its runs or goes clears the trace, since the run that
// set it may be gone.

interface Run {
  key: string;
  link: string;
  text: string;
}

interface Tracing {
  traced: string | null;
  runs: Run[];
  hover: (link: string | null) => void;
  focus: (link: string | null) => void;
  register: (owner: string, runs: Run[]) => void;
}

const TracingContext = createContext<Tracing>({
  traced: null,
  runs: [],
  hover: () => {},
  focus: () => {},
  register: () => {},
});

export const TracingProvider = TracingContext.Provider;

export const useTracingState = (): Tracing => {
  const [hovered, hover] = useState<string | null>(null);
  const [focused, focus] = useState<string | null>(null);
  const [byOwner, setByOwner] = useState<Map<string, Run[]>>(new Map());
  const traced = hovered ?? focused;
  const register = useCallback((owner: string, runs: Run[]) => {
    hover(null);
    focus(null);
    setByOwner(previous => {
      const next = new Map(previous);
      if (runs.length) next.set(owner, runs);
      else next.delete(owner);
      return next;
    });
  }, []);
  return useMemo(
    () => ({ traced, runs: [...byOwner.values()].flat(), hover, focus, register }),
    [traced, byOwner, register],
  );
};

type Part = string | { text: string; link: string | null };

export const useMarkTracing = (parts: Part[]) => {
  const { traced, runs, hover, focus, register } = useContext(TracingContext);
  const owner = useId();
  const own = parts.flatMap((part, index) =>
    typeof part !== 'string' && part.link ? [{ key: `${owner}:${index}`, link: part.link, text: part.text }] : [],
  );
  const signature = JSON.stringify(own);
  useEffect(() => {
    register(owner, JSON.parse(signature) as Run[]);
    return () => register(owner, []);
  }, [owner, signature, register]);

  return (index: number) => {
    const part = parts[index];
    const link = typeof part === 'string' ? null : part.link;
    if (!link) return { dimmed: false, linkedTo: [], handlers: {} };
    return {
      dimmed: traced !== null && traced !== link,
      linkedTo: runs.filter(run => run.link === link && run.key !== `${owner}:${index}`).map(run => run.text),
      handlers: {
        tabIndex: 0,
        onPointerEnter: () => hover(link),
        onPointerLeave: () => hover(null),
        onFocus: (event: FocusEvent<HTMLElement>) => {
          if (event.currentTarget.matches(':focus-visible')) focus(link);
        },
        onBlur: () => focus(null),
      },
    };
  };
};
