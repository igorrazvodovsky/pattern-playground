import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * Whether the referenced element is at least `minWidth` px wide, tracked
 * through a ResizeObserver. For layouts a container query can't decide:
 * a query can restyle a subtree but can't reparent it, so when the narrow
 * and wide arrangements are different trees the breakpoint has to be
 * measured in JS and drive the branch. Starts true so the first render
 * takes the wide branch; the layout effect corrects it before paint.
 */
export function useFitsWidth(ref: RefObject<HTMLElement | null>, minWidth: number): boolean {
  const [fits, setFits] = useState(true);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = (width: number) => setFits(width >= minWidth);
    measure(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, minWidth]);

  return fits;
}
