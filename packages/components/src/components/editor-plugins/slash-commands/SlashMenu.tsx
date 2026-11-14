import { forwardRef, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import type { VirtualElement } from '../../popup/popup';
import { Combobox, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxList } from '../../combobox';
import type { SlashCommand } from './types';
import '../../../jsx-types';

export interface SlashMenuProps {
  items: SlashCommand[];
  anchor: VirtualElement;
  onSelect: (item: SlashCommand) => void;
}

export interface SlashMenuHandle {
  /** Keys typed in the editor while the menu is open; true when the menu used the key. */
  onKeyDown: (event: KeyboardEvent) => boolean;
}

// Focus stays in the editor while the menu is open, so the editor forwards
// arrow keys and Enter here and the highlighted command is held as cmdk's value.
export const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(
  ({ items, anchor, onSelect }, ref) => {
    // The highlight goes back to the first item whenever the list changes,
    // during render, so a key pressed straight after never sees a stale index.
    const [highlight, setHighlight] = useState({ items, index: 0 });
    const index = highlight.items === items ? highlight.index : 0;
    const setIndex = (next: number | ((i: number) => number)) =>
      setHighlight((h) => {
        const current = h.items === items ? h.index : 0;
        return { items, index: typeof next === 'function' ? next(current) : next };
      });

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        // With nothing to pick, Enter is held back so the block does not
        // split under the open menu; Escape still closes it.
        if (items.length === 0) return event.key === 'Enter';
        if (event.key === 'ArrowDown') {
          setIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === 'ArrowUp') {
          setIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          const item = items.at(index);
          if (item) onSelect(item);
          return true;
        }
        return false;
      },
    }));

    return createPortal(
      <pp-popup
        anchor={anchor}
        active={true}
        placement="bottom-start"
        distance={8}
        flip
        shift
        top-layer={true}
      >
        <Combobox
          label="Insert block"
          shouldFilter={false}
          value={items.at(index)?.id ?? ''}
          onValueChange={(id) =>
            setIndex(
              Math.max(
                0,
                items.findIndex((item) => item.id === id),
              ),
            )
          }
        >
          <ComboboxList>
            {items.length === 0 ? (
              <ComboboxEmpty>No matching blocks.</ComboboxEmpty>
            ) : (
              <ComboboxGroup>
                {items.map((item) => (
                  <ComboboxItem key={item.id} value={item.id} onSelect={() => onSelect(item)}>
                    <iconify-icon icon={item.icon} slot="prefix" />
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </Combobox>
      </pp-popup>,
      document.body,
    );
  },
);
SlashMenu.displayName = 'SlashMenu';
