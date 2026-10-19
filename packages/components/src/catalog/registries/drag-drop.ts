import { useContext, useEffect, useRef, useState, type RefObject } from 'react';
import { useBoundProp } from '@json-render/react';
import { loadElementAdapter } from '../../utility/dnd';
import { springOpen } from '../catalog';
import { DemoRoot } from './dialog-focus';

// Dragging a DescriptionList row or a Card onto a Stack or Disclosure that is
// a drop target, wired with Pragmatic drag and drop the same way in both
// libraries. Each registry draws what is in flight and the target on offer;
// what is dragged, where it may land and what a drop writes are settled here.
//
// A row or card carries its id and the demo it belongs to. A target takes
// them from its own demo only, so two demos on one page do not trade rows. The demo is
// the one SpecDemo provides, which a portaled Drawer still sits in, so a row
// dragged out of a drawer lands on the overview behind it.

const rowKey = 'catalogRow';
const demoKey = 'catalogDemo';

/** Makes `ref` a drag source carrying `id`. Returns whether it is in flight. */
export const useDragRow = (ref: RefObject<HTMLElement | null>, id: string | null | undefined, enabled: boolean) => {
  const demo = useContext(DemoRoot);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || id == null) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void loadElementAdapter().then(({ draggable }) => {
      if (cancelled) return;
      cleanup = draggable({
        element,
        getInitialData: () => ({ [rowKey]: id, [demoKey]: demo }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [ref, id, enabled, demo]);
  return dragging;
};

/**
 * Makes an element a drop target for rows from the same demo. A drop hands
 * the row's id to `onDrop`. Returns a callback ref for the element and
 * whether a row is over it. The target follows the element itself, so it
 * moves with the ref when the element is replaced, such as a Stack that turns
 * into a named section.
 */
export const useDropRow = (onDrop: (id: string) => void, enabled: boolean) => {
  const demo = useContext(DemoRoot);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [over, setOver] = useState(false);
  // The bound setter behind `onDrop` is a new function on every render; the
  // target reads the latest one, so it is set up once per element.
  const onDropLatest = useRef(onDrop);
  onDropLatest.current = onDrop;
  useEffect(() => {
    if (!element || !enabled) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    void loadElementAdapter().then(({ dropTargetForElements }) => {
      if (cancelled) return;
      cleanup = dropTargetForElements({
        element,
        canDrop: ({ source }) => source.data[demoKey] === demo && typeof source.data[rowKey] === 'string',
        onDragEnter: () => setOver(true),
        onDragLeave: () => setOver(false),
        onDrop: ({ source }) => {
          setOver(false);
          onDropLatest.current(String(source.data[rowKey]));
        },
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
      setOver(false);
    };
  }, [element, enabled, demo]);
  return { ref: setElement, over };
};

/**
 * A Stack's drop target, the same in every registry: a drop writes the row's
 * id to the Stack's bound `dropped`, then emits `drop`.
 */
export const useStackDrop = (
  props: { dropTarget?: boolean | null; dropped?: string | null },
  bindings: Record<string, string> | undefined,
  emit: (event: string) => unknown,
) => {
  const [, setDropped] = useBoundProp(props.dropped, bindings?.dropped);
  return useDropRow(id => {
    setDropped(id);
    void emit('drop');
  }, Boolean(props.dropTarget));
};

/**
 * A Disclosure's drop target, the same in every registry. A drop writes the
 * id to the bound `dropped`, then emits `drop`, as on a Stack. Held over a
 * closed Disclosure for a moment, the drag opens it, so the drop can be aimed;
 * a drop opens it too, so what was dropped shows where it went.
 */
export const useDisclosureDrop = (
  props: { dropTarget?: boolean | null; dropped?: string | null },
  bindings: Record<string, string> | undefined,
  emit: (event: string) => unknown,
  open: boolean,
  change: (next: boolean) => void,
) => {
  const [, setDropped] = useBoundProp(props.dropped, bindings?.dropped);
  // The drop and the timer act on the state at the time, not at setup.
  const latest = useRef({ open, change });
  latest.current = { open, change };
  const target = useDropRow(id => {
    if (!latest.current.open) latest.current.change(true);
    setDropped(id);
    void emit('drop');
  }, Boolean(props.dropTarget));
  const { over } = target;
  useEffect(() => {
    if (!over || open) return;
    const timer = setTimeout(() => latest.current.change(true), springOpen);
    return () => clearTimeout(timer);
  }, [over, open]);
  return target;
};
