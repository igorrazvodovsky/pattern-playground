import { announce } from '../../utility/announce.js';
import { Elena } from '@elenajs/core';
import type { PpListItem } from '../list-item/list-item';

export interface ListSelectEventDetail {
  item: PpListItem;
}

/**
 * @summary A list of options for the user to choose from.
 * @status draft
 * @since 0.1
 *
 * The element enhances the `<pp-list-item>`
 * children it is given — menu role, roving tabindex, keyboard navigation,
 * type-ahead, and submenu orchestration. With `type="listbox"` it is a
 * listbox instead: items are options whose `selected` state persists, and
 * `multiselectable` follows the APG keys (Space toggles, Shift+arrow moves and
 * toggles the next option, Ctrl/Cmd+A selects all). Enter is left to bubble so a surrounding control
 * can act on the selection. Styles: `src/styles/list.css`.
 */

export class PpList extends Elena(HTMLElement) {
  static tagName = 'pp-list';

  static props = ['label', 'type', 'multiselectable'];

  label = '';
  type: 'menu' | 'listbox' = 'menu';
  multiselectable = false;

  private openSubmenus: Set<PpListItem> = new Set();
  private currentSubmenu: PpListItem | null = null;
  private submenuTimeout: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('mousedown', this.handleMouseDown);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseleave', this.handleMouseLeave);
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('mousedown', this.handleMouseDown);
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseleave', this.handleMouseLeave);

    // Clean up submenu state
    if (this.submenuTimeout) {
      clearTimeout(this.submenuTimeout);
      this.submenuTimeout = null;
    }
    this.openSubmenus.clear();
    this.currentSubmenu = null;
  }

  private init() {
    this.setAttribute('role', this.isListbox() ? 'listbox' : 'menu');
    this.setupAccessibility();
    // Items not yet upgraded set their own role when they initialise.
    this.getAllItems().forEach((item) => {
      if (typeof item.handleTypeChange === 'function') item.handleTypeChange();
    });

    const items = this.getAllItems();
    if (items.length > 0) {
      this.setCurrentItem(items[0]);
    }
  }

  private setupAccessibility() {
    if (this.label && !this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.label);
    }

    if (this.multiselectable && this.isListbox()) {
      this.setAttribute('aria-multiselectable', 'true');
    } else {
      this.removeAttribute('aria-multiselectable');
    }

    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-activedescendant', '');
  }

  private handleClick = (event: MouseEvent) => {
    const item = event
      .composedPath()
      .find((el): el is PpListItem => el instanceof HTMLElement && this.isListItem(el));

    if (!item) return;

    // Handle submenu items - toggle open/close instead of selecting
    if (item['has-submenu']) {
      event.preventDefault();
      event.stopPropagation();

      if (item['submenu-open']) {
        this.closeCurrentSubmenu();
      } else {
        this.openSubmenu(item);
      }
      return;
    }

    // toggleSelected dispatches its own pp-select. The second click of a
    // double-click is skipped so it doesn't undo the first.
    if (this.isListbox()) {
      if (event.detail < 2) this.toggleSelected(item);
      return;
    }

    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }

    this.dispatchSelect(item);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    const items = this.getAllItems();
    const activeItem = this.getActiveItem();
    const currentIndex = activeItem ? items.indexOf(activeItem) : 0;

    if (this.isListbox() && this.handleListboxKey(event, items, activeItem)) return;

    // Make a selection when pressing enter or space
    if (event.key === 'Enter' || event.key === ' ') {
      const item = activeItem;
      event.preventDefault();
      event.stopPropagation();

      if (item) {
        // Announce the selection to screen readers
        const itemText = item.getTextLabel();
        announce(`Selected ${itemText}`);
        // Simulate a click to support @click handlers on list items that also work with the keyboard
        item.click();
      }
    }

    // Submenu navigation with ArrowRight and ArrowLeft
    else if (event.key === 'ArrowRight') {
      const item = this.getCurrentItem();
      if (item?.['has-submenu']) {
        event.preventDefault();
        event.stopPropagation();
        this.openSubmenu(item);
      }
    } else if (event.key === 'ArrowLeft') {
      if (this.currentSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        this.closeCurrentSubmenu();
        this.focusOnCurrentItem();
      }
    }

    // Enhanced keyboard navigation patterns
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(event.key)) {
      let index = currentIndex;

      if (items.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        switch (event.key) {
          case 'ArrowDown':
            index = (index + 1) % items.length;
            break;
          case 'ArrowUp':
            index = index === 0 ? items.length - 1 : index - 1;
            break;
          case 'Home':
            index = 0;
            break;
          case 'End':
            index = items.length - 1;
            break;
          case 'PageDown':
            // Jump 10 items down or to end
            index = Math.min(index + 10, items.length - 1);
            break;
          case 'PageUp':
            // Jump 10 items up or to beginning
            index = Math.max(index - 10, 0);
            break;
        }

        this.setCurrentItem(items[index]);
        items[index].focus();
      }
    }

    // Type-ahead navigation (find items by first letter)
    else if (
      event.key.length === 1 &&
      /[a-zA-Z0-9]/.test(event.key) &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      this.handleTypeAhead(event.key.toLowerCase());
    }

    // Escape key support
    else if (event.key === 'Escape') {
      // Allow parent components (like dropdown) to handle escape
      event.stopPropagation();
      announce('Navigation cancelled');
    }
  };

  // Listbox keys that differ from the menu's; returns true when the event was handled.
  private handleListboxKey(event: KeyboardEvent, items: PpListItem[], activeItem?: PpListItem) {
    if (event.key === 'Enter') return true;

    if (event.key === ' ') {
      event.preventDefault();
      if (activeItem) this.toggleSelected(activeItem);
      return true;
    }

    if (!this.multiselectable) return false;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      const selectable = items.filter((item) => !item.disabled);
      const select = selectable.some((item) => !item.selected);
      selectable.forEach((item) => (item.selected = select));
      announce(select ? `All ${selectable.length} selected` : 'Selection cleared');
      this.dispatchSelect(activeItem);
      return true;
    }

    if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      const index = activeItem ? items.indexOf(activeItem) : -1;
      const next = items[event.key === 'ArrowDown' ? index + 1 : index - 1];
      if (next) {
        this.setCurrentItem(next);
        next.focus();
        this.toggleSelected(next);
      }
      return true;
    }

    return false;
  }

  // In a single-select listbox, selecting one option deselects the rest.
  private toggleSelected(item: PpListItem) {
    if (item.disabled) return;
    const selected = !item.selected;
    if (!this.multiselectable) {
      this.getAllItems().forEach((other) => (other.selected = false));
    }
    item.selected = this.multiselectable ? selected : true;
    announce(`${item.getTextLabel()} ${item.selected ? 'selected' : 'deselected'}`);
    this.dispatchSelect(item);
  }

  private dispatchSelect(item?: PpListItem) {
    if (!item) return;
    this.dispatchEvent(
      new CustomEvent('pp-select', { detail: { item }, bubbles: true, composed: true }),
    );
  }

  isListbox() {
    return this.type === 'listbox';
  }

  getSelectedItems() {
    return this.getAllItems().filter((item) => item.selected);
  }

  private handleTypeAhead(character: string) {
    const items = this.getAllItems();
    const currentIndex = this.getCurrentItem() ? items.indexOf(this.getCurrentItem()!) : -1;

    // Search starting from the next item after current
    for (let i = 1; i <= items.length; i++) {
      const index = (currentIndex + i) % items.length;
      const item = items[index];
      const itemText = item.getTextLabel().toLowerCase();

      if (itemText.startsWith(character)) {
        this.setCurrentItem(item);
        item.focus();
        break;
      }
    }
  }

  private handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (this.isListItem(target)) {
      this.setCurrentItem(target as PpListItem);
    }
  };

  private handleMouseOver = (event: MouseEvent) => {
    // A listbox moves the current option on click and keys only; hover is styling.
    if (this.isListbox()) return;

    const target = event.target as HTMLElement;
    const listItem = target.closest('pp-list-item') as PpListItem;

    if (listItem && this.isListItem(listItem)) {
      this.setCurrentItem(listItem);

      // Close any existing submenus when moving to a different item
      const currentlyOpenSubmenu = this.getAllItems().find((item) => item['submenu-open']);
      if (currentlyOpenSubmenu && currentlyOpenSubmenu !== listItem) {
        this.closeSubmenu(currentlyOpenSubmenu);
      }

      // Open submenu for the current item if it has one
      if (listItem['has-submenu']) {
        this.handleSubmenuMouseEnter(listItem);
      }
    }
  };

  private handleMouseLeave = () => {
    this.handleSubmenuMouseLeave();
  };

  private isListItem(item: HTMLElement) {
    return item.localName === 'pp-list-item';
  }

  // Gets all child list items, ignoring dividers, headers, and other elements.
  getAllItems() {
    return [...this.children].filter((el: Element) => {
      if ((el as HTMLElement).inert || !this.isListItem(el as HTMLElement)) {
        return false;
      }
      return true;
    }) as PpListItem[];
  }

  // Focus can move without setCurrentItem, so keyboard input follows focus first.
  private getActiveItem() {
    const focused = this.getAllItems().find((item) => item === document.activeElement);
    if (focused && focused !== this.getCurrentItem()) this.setCurrentItem(focused);
    return focused ?? this.getCurrentItem();
  }

  // Gets the current list item, which is the list item that has `tabindex="0"` within the roving tab index.
  // The list item may or may not have focus, but for keyboard interaction purposes it's considered the "active" item.
  getCurrentItem() {
    return this.getAllItems().find((i) => i.getAttribute('tabindex') === '0');
  }

  // Sets the current list item to the specified element. This sets `tabindex="0"` on the target element and `tabindex="-1"` to all other items. Must be called prior to setting focus on a list item.
  setCurrentItem(item: PpListItem) {
    const items = this.getAllItems();
    const previousItem = this.getCurrentItem();

    items.forEach((i) => {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });

    // Update aria-activedescendant for screen readers
    if (item && item.id) {
      this.setAttribute('aria-activedescendant', item.id);
    } else if (item) {
      // Generate an ID if one doesn't exist
      const id = `list-item-${Math.random().toString(36).substring(2, 11)}`;
      item.id = id;
      this.setAttribute('aria-activedescendant', id);
    }

    // Announce selection change to screen readers
    if (item && item !== previousItem) {
      const itemText = item.getTextLabel();
      const itemIndex = items.indexOf(item) + 1;
      const totalItems = items.length;
      announce(`${itemText}, ${itemIndex} of ${totalItems}`);
    }
  }

  // Submenu management methods
  openSubmenu(item: PpListItem) {
    if (!item['has-submenu']) return;

    // Close other submenus first
    this.closeAllSubmenus();

    // Open the new submenu
    item['submenu-open'] = true;
    this.openSubmenus.add(item);
    this.currentSubmenu = item;

    // Announce to screen readers
    const itemText = item.getTextLabel();
    announce(`Opened submenu for ${itemText}`);

    // Find the submenu list and focus first item
    const submenuList = item.querySelector<PpList>(
      ':scope > [data-slot="submenu"] pp-list, :scope > pp-list[data-slot="submenu"]',
    );
    if (submenuList) {
      const submenuItems = submenuList.getAllItems();
      if (submenuItems.length > 0) {
        submenuList.setCurrentItem(submenuItems[0]);
        submenuItems[0].focus();
      }
    }
  }

  closeCurrentSubmenu() {
    if (this.currentSubmenu) {
      this.currentSubmenu['submenu-open'] = false;
      this.openSubmenus.delete(this.currentSubmenu);
      this.currentSubmenu = null;
      announce('Closed submenu');
    }
  }

  closeSubmenu(item: PpListItem) {
    if (item['submenu-open']) {
      item['submenu-open'] = false;
      this.openSubmenus.delete(item);
      if (this.currentSubmenu === item) {
        this.currentSubmenu = null;
      }
    }
  }

  closeAllSubmenus() {
    this.openSubmenus.forEach((item) => {
      item['submenu-open'] = false;
    });
    this.openSubmenus.clear();
    this.currentSubmenu = null;
  }

  private focusOnCurrentItem() {
    const currentItem = this.getCurrentItem();
    if (currentItem) {
      currentItem.focus();
    }
  }

  /** Cancel any pending submenu close. Called by pp-dropdown when the mouse enters a submenu popup. */
  cancelSubmenuClose() {
    if (this.submenuTimeout) {
      clearTimeout(this.submenuTimeout);
      this.submenuTimeout = null;
    }
  }

  /** Schedule closing all submenus after a short delay. Called by pp-dropdown when the mouse leaves a submenu popup. */
  scheduleSubmenuClose() {
    this.cancelSubmenuClose();
    this.submenuTimeout = window.setTimeout(() => this.closeAllSubmenus(), 100);
  }

  private handleSubmenuMouseEnter(item: PpListItem) {
    this.cancelSubmenuClose();
    this.submenuTimeout = window.setTimeout(() => {
      if (item['has-submenu'] && !item['submenu-open']) {
        this.openSubmenu(item);
      }
    }, 150);
  }

  private handleSubmenuMouseLeave() {
    this.scheduleSubmenuClose();
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-list': PpList;
  }
}
