import { LitElement, html, unsafeCSS } from 'lit';
import { query } from 'lit/decorators.js';
import styles from './list.css?inline';
import type { CSSResultGroup } from 'lit';
import type { PpListItem } from '../list-item/list-item';

export interface ListSelectEventDetail {
  item: PpListItem;
}

/**
 * @summary A list of options for the user to choose from.
 * @status draft
 * @since 0.1
 */

export class PpList extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @query('slot') defaultSlot: HTMLSlotElement;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'menu');
  }

  private handleClick(event: MouseEvent) {
    const listItemTypes = ['listitem', 'listitemcheckbox'];

    const target = event.composedPath().find((el: Element) => listItemTypes.includes(el?.getAttribute?.('role') || ''));

    if (!target) return;

    // This isn't true. But we use it for TypeScript checks below.
    const item = target as PpListItem;

    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }

    this.dispatchEvent(new CustomEvent('pp-select', { detail: { item } }));
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Make a selection when pressing enter or space
    if (event.key === 'Enter' || event.key === ' ') {
      const item = this.getCurrentItem();
      event.preventDefault();
      event.stopPropagation();

      // Simulate a click to support @click handlers on list items that also work with the keyboard
      item?.click();
    }

    // Move the selection when pressing down or up
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const items = this.getAllItems();
      const activeItem = this.getCurrentItem();
      let index = activeItem ? items.indexOf(activeItem) : 0;

      if (items.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        if (event.key === 'ArrowDown') {
          index++;
        } else if (event.key === 'ArrowUp') {
          index--;
        } else if (event.key === 'Home') {
          index = 0;
        } else if (event.key === 'End') {
          index = items.length - 1;
        }

        if (index < 0) {
          index = items.length - 1;
        }
        if (index > items.length - 1) {
          index = 0;
        }

        this.setCurrentItem(items[index]);
        items[index].focus();
      }
    }
  }

  private handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isListItem(target)) {
      this.setCurrentItem(target as PpListItem);
    }
  }

  private handleSlotChange() {
    const items = this.getAllItems();

    if (items.length > 0) {
      this.setCurrentItem(items[0]);
    }
  }

  private isListItem(item: HTMLElement) {
    return (
      item.tagName.toLowerCase() === 'pp-list-item' ||
      ['listitem', 'listitemcheckbox', 'listitemradio'].includes(item.getAttribute('role') ?? '')
    );
  }

  // Gets all slotted list items, ignoring dividers, headers, and other elements.
  getAllItems() {
    return [...this.defaultSlot.assignedElements({ flatten: true })].filter((el: HTMLElement) => {
      if (el.inert || !this.isListItem(el)) {
        return false;
      }
      return true;
    }) as PpListItem[];
  }

  // Gets the current list item, which is the list item that has `tabindex="0"` within the roving tab index.
  // The list item may or may not have focus, but for keyboard interaction purposes it's considered the "active" item.
  getCurrentItem() {
    return this.getAllItems().find(i => i.getAttribute('tabindex') === '0');
  }

  // Sets the current list item to the specified element. This sets `tabindex="0"` on the target element and `tabindex="-1"` to all other items. Must be called prior to setting focus on a list item.
  setCurrentItem(item: PpListItem) {
    const items = this.getAllItems();

    items.forEach(i => {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });
  }

  render() {
    return html`
      <slot
        @slotchange=${this.handleSlotChange}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
      ></slot>
    `;
  }
}

customElements.define('pp-list', PpList);
declare global {
  interface HTMLElementTagNameMap {
    "pp-list": PpList;
  }
}