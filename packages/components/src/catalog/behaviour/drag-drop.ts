import { useContext, useEffect, useRef, useState, type RefObject } from 'react';
import { useBoundProp } from '@json-render/react';
import { loadElementAdapter } from '../../utility/dnd';
import { springOpen } from '../catalog';
import { DemoRoot } from './dialog-focus';

// A target takes rows from its own demo only, so two demos on one page do not
// trade rows. The demo comes from SpecDemo's context, which a portaled Drawer
// still sits in, so a row dragged out of a drawer lands on the overview.

const rowKey = 'catalogRow';
const demoKey = 'catalogDemo';

export const useDragRow = (
  ref: RefObject<HTMLElement | null>,
  id: string | null | undefined,
  enabled: boolean,
) => {
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

// A callback ref rather than a ref object, so the target moves with the
// element when it is replaced, such as a Stack that turns into a section.
export const useDropRow = (onDrop: (id: string) => void, enabled: boolean) => {
  const demo = useContext(DemoRoot);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [over, setOver] = useState(false);
  // `onDrop` is a new function on every render; reading the latest one keeps
  // the target set up once per element.
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
        canDrop: ({ source }) =>
          source.data[demoKey] === demo && typeof source.data[rowKey] === 'string',
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

export const useStackDrop = (
  props: { dropTarget?: boolean | null; dropped?: string | null },
  bindings: Record<string, string> | undefined,
  emit: (event: string) => unknown,
) => {
  const [, setDropped] = useBoundProp(props.dropped, bindings?.dropped);
  return useDropRow((id) => {
    setDropped(id);
    void emit('drop');
  }, Boolean(props.dropTarget));
};

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
  const target = useDropRow((id) => {
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
