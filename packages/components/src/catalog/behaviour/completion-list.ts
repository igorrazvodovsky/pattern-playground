import { useId, useRef, useState, type KeyboardEvent } from 'react';

// Ways to continue what is in a Composer's field, listed beneath it, shared by
// the registries so that only the markup differs. The field keeps focus and
// stays a text field: the list is announced through aria-controls and
// aria-activedescendant, which a textarea carries as a textbox. Nothing is
// highlighted until the actor moves to a completion, so Enter keeps its usual
// meaning in the field, and the arrows move the caret between lines until it
// is on the first or last. Picking one, or Escape, hides the list until the
// text is edited again.
export function useCompletionList(
  completions: string[],
  value: string,
  setValue: (value: string) => void,
) {
  const id = useId();
  const field = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  // Both are kept with the text they were set against, so they lapse when the
  // spec writes other text; any edit by the actor also clears the dismissal,
  // even one that comes back to the same text.
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [active, setActive] = useState({ for: value, index: -1 });
  const visible = completions.length > 0 && dismissed !== value;
  const index = visible && active.for === value ? active.index : -1;
  const optionId = (at: number) => `${id}-completion-${at}`;

  const pick = (text: string) => {
    setValue(text);
    setDismissed(text);
    field.current?.focus();
  };

  return {
    visible,
    field: {
      'ref': field,
      'aria-autocomplete': 'list' as const,
      'aria-controls': visible ? `${id}-completions` : undefined,
      'aria-activedescendant': index >= 0 ? optionId(index) : undefined,
      'onInput': () => setDismissed(null),
      'onKeyDown': (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (!visible) return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          // With nothing highlighted, an arrow first moves the caret through
          // the lines, and reaches the list from the first or last one.
          const { selectionStart, selectionEnd, value: text } = event.currentTarget;
          const onEdgeLine =
            event.key === 'ArrowDown'
              ? !text.slice(selectionEnd ?? 0).includes('\n')
              : !text.slice(0, selectionStart ?? 0).includes('\n');
          if (index < 0 && !onEdgeLine) return;
          event.preventDefault();
          const step = event.key === 'ArrowDown' ? 1 : -1;
          const next = (index + step + completions.length + 1) % (completions.length + 1);
          // One step past either end goes back to the field's own text.
          setActive({ for: value, index: next === completions.length ? -1 : next });
        } else if (event.key === 'Enter' && !event.shiftKey && index >= 0) {
          event.preventDefault();
          pick(completions[index]);
        } else if (event.key === 'Escape') {
          // Goes no further, so a dialog or pane around the demo stays open.
          event.preventDefault();
          event.stopPropagation();
          setDismissed(value);
        }
      },
    },
    list: {
      id: `${id}-completions`,
      role: 'listbox' as const,
      // Otherwise a press in the list blurs the field before it lands.
      onMouseDown: (event: { preventDefault(): void }) => event.preventDefault(),
    },
    options: completions.map((text, at) => {
      // The part already typed is set apart from the rest, when the
      // completion starts with what is in the field.
      const typed =
        value && text.toLowerCase().startsWith(value.toLowerCase())
          ? text.slice(0, value.length)
          : '';
      return {
        key: at,
        typed,
        rest: text.slice(typed.length),
        props: {
          'id': optionId(at),
          'role': 'option' as const,
          'aria-selected': at === index,
          'onClick': () => pick(text),
          'onPointerMove': () => at !== index && setActive({ for: value, index: at }),
        },
      };
    }),
  };
}
