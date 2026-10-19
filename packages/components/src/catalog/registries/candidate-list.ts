import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';

type Group = { heading: string | null; options: { value: string; label: string }[] };

// A Combobox's behaviour on cmdk, shared by the registries so that only the
// markup differs. The spec decides the candidates; this leaves out empty
// groups and keeps the list closed when nothing is left. Open state and the
// highlighted candidate are the component's own: a library switch keeps the
// typed value, which is bound, and closes the list.
export function useCandidateList(
  groupsProp: Group[],
  value: string,
  setValue: (value: string) => void,
  onPick: () => void,
) {
  const [wanted, setOpen] = useState(false);
  // Nothing is highlighted until the actor moves to a candidate, so Enter on
  // what they typed does not replace it with the first candidate. cmdk
  // highlights the first item whenever the list changes, so a highlight is
  // taken only while an arrow key or the pointer is moving it. cmdk keeps the
  // refused highlight in its own state and syncs from `value` only when the
  // prop changes, so a refusal flips the empty value between '' and ' ',
  // which cmdk trims to the same nothing.
  const [highlighted, setHighlighted] = useState('');
  const [refusals, setRefusals] = useState(0);
  const moving = useRef(false);
  const move = () => {
    moving.current = true;
    queueMicrotask(() => (moving.current = false));
  };
  const groups = groupsProp.filter(group => group.options.length > 0);
  const open = wanted && groups.length > 0;
  const close = () => {
    setOpen(false);
    setHighlighted('');
  };

  return {
    open,
    groups,
    root: {
      shouldFilter: false,
      value: highlighted || (refusals % 2 ? ' ' : ''),
      onValueChange: (next: string) => {
        if (moving.current) setHighlighted(next);
        else if (next) setRefusals(count => count + 1);
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) move();
        if (event.key === 'ArrowDown') setOpen(true);
        // Escape closes the list and goes no further, so a dialog or pane
        // around the demo stays open.
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      },
    },
    input: {
      value,
      onValueChange: (next: string) => {
        setValue(next);
        setHighlighted('');
        setOpen(true);
      },
      onFocus: () => setOpen(true),
      onBlur: close,
    },
    // Pressing anywhere in the list (a candidate, a heading, the scrollbar)
    // would otherwise take focus from the field, and the blur would close the
    // list before the press lands.
    list: { onMouseDown: (event: MouseEvent) => event.preventDefault(), onPointerMoveCapture: move },
    pick: (picked: string) => {
      close();
      setValue(picked);
      onPick();
    },
  };
}
