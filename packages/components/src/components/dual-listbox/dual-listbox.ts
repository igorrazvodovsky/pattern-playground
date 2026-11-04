import { Elena } from '@elenajs/core';
import { announce } from '../../utility/announce.js';
import type { PpList } from '../list/list';
import type { PpListItem } from '../list-item/list-item';

export type DualListboxDirection = 'add' | 'remove';

export interface DualListboxTransferEventDetail {
  items: PpListItem[];
  direction: DualListboxDirection;
}

/**
 * @summary Two lists side by side, with controls that move items between them.
 * @status draft
 * @since 0.1
 *
 * The author composes two `<pp-list type="listbox">` children marked
 * `data-dual-listbox="source"` and `data-dual-listbox="target"`, and buttons
 * marked `data-transfer="add"` / `data-transfer="remove"`. The element moves
 * the selected options when a button is pressed, an option is double-clicked,
 * or Enter is pressed in a list, and disables a button while its list has no
 * selection. It moves the author's `<pp-list-item>` nodes rather than copying
 * them, so a framework that rendered them must not re-render those lists.
 * Fires `pp-transfer` after each move. Styles live in `src/styles/dual-listbox.css`.
 */

export class PpDualListbox extends Elena(HTMLElement) {
  static tagName = 'pp-dual-listbox';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('dblclick', this.handleDoubleClick);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('pp-select', this.updateButtons);
    if (document.readyState !== 'loading') {
      this.updateButtons();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.updateButtons(), { once: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('dblclick', this.handleDoubleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('pp-select', this.updateButtons);
  }

  get source() {
    return this.querySelector<PpList>('pp-list[data-dual-listbox="source"]');
  }

  get target() {
    return this.querySelector<PpList>('pp-list[data-dual-listbox="target"]');
  }

  private button(direction: DualListboxDirection) {
    return this.querySelector<HTMLButtonElement>(`button[data-transfer="${direction}"]`);
  }

  private directionFrom(list: PpList | null): DualListboxDirection | null {
    if (list && list === this.source) return 'add';
    if (list && list === this.target) return 'remove';
    return null;
  }

  private handleClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-transfer]');
    if (!button || !this.contains(button)) return;
    this.transfer(button.dataset.transfer as DualListboxDirection);
  };

  private handleDoubleClick = (event: MouseEvent) => {
    const item = (event.target as Element).closest('pp-list-item');
    if (!item || item.disabled) return;
    const direction = this.directionFrom(item.closest('pp-list'));
    if (direction) this.move([item], direction);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    const direction = this.directionFrom((event.target as Element).closest('pp-list'));
    if (!direction) return;
    event.preventDefault();
    this.transfer(direction);
  };

  /** Moves the selected options of one side to the other. */
  transfer(direction: DualListboxDirection) {
    const from = direction === 'add' ? this.source : this.target;
    if (from) this.move(from.getSelectedItems(), direction);
  }

  private move(items: PpListItem[], direction: DualListboxDirection) {
    const from = direction === 'add' ? this.source : this.target;
    const to = direction === 'add' ? this.target : this.source;
    if (!from || !to || items.length === 0) return;

    // Keep the actor's place: focus lands on the option after the last one moved.
    const all = from.getAllItems();
    const remaining = all.filter((item) => !items.includes(item));
    const lastIndex = Math.max(...items.map((item) => all.indexOf(item)));
    const next = all.slice(lastIndex + 1).find((item) => !items.includes(item)) ?? remaining.at(-1);
    const focusWasInList = from.contains(document.activeElement);

    for (const item of items) {
      item.selected = false;
      item.setAttribute('tabindex', '-1');
      to.append(item);
    }

    if (!to.getCurrentItem()) to.setCurrentItem(items[0]);
    if (next) {
      from.setCurrentItem(next);
      if (focusWasInList) next.focus();
    } else {
      // The emptied list must not point at an option that now lives in the other list.
      from.setAttribute('aria-activedescendant', '');
      if (focusWasInList) from.focus();
    }

    const count = items.length === 1 ? items[0].getTextLabel() : `${items.length} items`;
    announce(`${count} ${direction === 'add' ? 'added' : 'removed'}`);

    this.dispatchEvent(
      new CustomEvent<DualListboxTransferEventDetail>('pp-transfer', {
        detail: { items, direction },
        bubbles: true,
        composed: true,
      }),
    );
    this.updateButtons();
  }

  private updateButtons = () => {
    for (const direction of ['add', 'remove'] as const) {
      const button = this.button(direction);
      const from = direction === 'add' ? this.source : this.target;
      if (!button || !from) continue;
      const empty = from.getSelectedItems().length === 0;
      // A pressed button that disables itself would drop focus to the page.
      if (empty && button === document.activeElement) {
        (from.getCurrentItem() ?? from).focus();
      }
      button.disabled = empty;
    }
  };
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-dual-listbox': PpDualListbox;
  }
  interface HTMLElementEventMap {
    'pp-transfer': CustomEvent<DualListboxTransferEventDetail>;
  }
}
