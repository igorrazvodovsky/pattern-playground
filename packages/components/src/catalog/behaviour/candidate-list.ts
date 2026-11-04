import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { iconNames } from '../catalog';

type Group = {
  heading: string | null;
  options: {
    value: string;
    label: string;
    narrows?: boolean | null;
    icon?: (typeof iconNames)[number] | null;
  }[];
};
type Scope = { value: string | null | undefined; set: (next: string | null) => void };

// A Combobox's behaviour on cmdk, shared by the registries so that only the
// markup differs. A candidate that `narrows` stands for a kind of value:
// picking it writes the scope rather than the value and keeps the list open.
export function useCandidateList(
  groupsProp: Group[],
  value: string,
  setValue: (value: string) => void,
  onPick: () => void,
  scope?: Scope,
  // In a popup, Escape closes the popup rather than only the list, and the
  // registry calls `close` when the popup closes.
  inPopup = false,
) {
  const [wanted, setOpen] = useState(false);
  // Nothing is highlighted until the actor moves to a candidate, so Enter
  // keeps what they typed. cmdk highlights the first item whenever the list
  // changes, so a highlight is taken only while an arrow key or the pointer
  // moves it. cmdk syncs from `value` only when the prop changes, so a refusal
  // flips the empty value between '' and ' ', which cmdk trims alike.
  const [highlighted, setHighlighted] = useState('');
  const [refusals, setRefusals] = useState(0);
  const moving = useRef(false);
  const move = () => {
    moving.current = true;
    queueMicrotask(() => (moving.current = false));
  };
  const groups = groupsProp.filter((group) => group.options.length > 0);
  const open = wanted && groups.length > 0;

  // cmdk's input always reports its list as open and is labelled by cmdk's
  // hidden label, and none of this can be set through props. cmdk never
  // rewrites these attributes after mount, so they are corrected here.
  const field = useRef<HTMLInputElement>(null);
  const label = useRef<HTMLLabelElement>(null);
  const listId = useRef<string | null>(null);
  useLayoutEffect(() => {
    const input = field.current;
    if (!input) return;
    listId.current ??= input.getAttribute('aria-controls');
    input.setAttribute('aria-expanded', String(open));
    if (open && listId.current) input.setAttribute('aria-controls', listId.current);
    else input.removeAttribute('aria-controls');
    if (label.current) label.current.htmlFor = input.id;
  }, [open]);
  const close = () => {
    setOpen(false);
    setHighlighted('');
    if (scope?.value != null) scope.set(null);
  };

  return {
    open,
    groups,
    close,
    root: {
      shouldFilter: false,
      value: highlighted || (refusals % 2 ? ' ' : ''),
      onValueChange: (next: string) => {
        if (moving.current) setHighlighted(next);
        else if (next) setRefusals((count) => count + 1);
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) move();
        if (event.key === 'ArrowDown') setOpen(true);
        if (event.key === 'Backspace' && value === '' && scope?.value != null) {
          event.preventDefault();
          scope.set(null);
        }
        // Goes no further, so a dialog or pane around the demo stays open.
        if (event.key === 'Escape' && open && !inPopup) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      },
    },
    label: { ref: label },
    input: {
      ref: field,
      value,
      onValueChange: (next: string) => {
        setValue(next);
        setHighlighted('');
        setOpen(true);
      },
      onFocus: () => setOpen(true),
      onBlur: close,
    },
    // Otherwise a press in the list blurs the field, which closes the list
    // before the press lands.
    list: {
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      onPointerMoveCapture: move,
    },
    pick: (picked: string) => {
      const option = groups
        .flatMap((group) => group.options)
        .find((candidate) => candidate.value === picked);
      if (option?.narrows && scope) {
        scope.set(picked);
        setValue('');
        setHighlighted('');
        setOpen(true);
        return;
      }
      close();
      setValue(picked);
      onPick();
    },
  };
}
