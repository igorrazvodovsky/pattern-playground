import { useRef } from 'react';
import { useFocusHandoff } from './focus-handoff';
import { useFocusOnShow } from './focus-on-show';

// The button that a Card or Item title becomes when it opens. On an expanding
// title `expanded` is read and `selected` only sets the surface apart; on any
// other, `selected` reads as pressed. With `focusEvents` the button also
// emits `focus` and `blur`, as an Item row does for the pointer.

type Title = {
  title?: string | null;
  opens?: boolean | null;
  selected?: boolean | null;
  expanded?: boolean | null;
  focusOnShow?: boolean | null;
};

export const usePressableTitle = (
  props: Title,
  emit: (event: string) => unknown,
  { focusEvents = false } = {},
) => {
  const ref = useRef<HTMLButtonElement>(null);
  useFocusOnShow(ref, props.focusOnShow);
  // Re-armed when the button appears: a Card without a title draws none.
  useFocusHandoff(null, ref, Boolean(props.opens) && props.title != null);
  return {
    ref,
    type: 'button' as const,
    'aria-pressed': props.selected == null || props.expanded != null ? undefined : props.selected,
    'aria-expanded': props.expanded ?? undefined,
    onClick: () => void emit('open'),
    ...(focusEvents && { onFocus: () => void emit('focus'), onBlur: () => void emit('blur') }),
  };
};
