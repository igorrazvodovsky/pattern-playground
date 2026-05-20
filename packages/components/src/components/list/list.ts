import { announce } from '../../utility/announce.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
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

  @property({ reflect: true }) label = '';
  @property({ attribute: 'aria-label', reflect: true }) ariaLabel = '';
  @property({ attribute: 'aria-labelledby', reflect: true }) ariaLabelledby = '';
  @property({ attribute: 'aria-describedby', reflect: true }) ariaDescribedby = '';
  @property({ type: Boolean, attribute: 'multiselectable', reflect: true }) multiselectable = false;

  private openSubmenus: Set<PpListItem> = new Set();
  private currentSubmenu: PpListItem | null = null;
  private submenuTimeout: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up submenu state
    if (this.submenuTimeout) {
      clearTimeout(this.submenuTimeout);
      this.submenuTimeout = null;
    }
    this.openSubmenus.clear();
    this.currentSubmenu = null;
  }

  private init() {
    this.setAttribute('role', 'menu');
    this.setupAccessibility();
  }

  private setupAccessibility() {
    if (this.ariaLabel) {
      this.setAttribute('aria-label', this.ariaLabel);
    } else if (this.label) {
      this.setAttribute('aria-label', this.label);
    }

    if (this.ariaLabelledby) {
      this.setAttribute('aria-labelledby', this.ariaLabelledby);
    }

    if (this.ariaDescribedby) {
      this.setAttribute('aria-describedby', this.ariaDescribedby);
    }

    if (this.multiselectable) {
      this.setAttribute('aria-multiselectable', 'true');
    } else {
      this.removeAttribute('aria-multiselectable');
    }

    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-activedescendant', '');
  }

  private handleClick(event: MouseEvent) {
    const listItemTypes = ['menuitem', 'menuitemcheckbox', 'menuitemradio'];

    const target = event.composedPath().find((el: Element) => listItemTypes.includes(el?.getAttribute?.('role') || ''));

    if (!target) return;

    // This isn't true. But we use it for TypeScript checks below.
    const item = target as PpListItem;

    // Handle submenu items - toggle open/close instead of selecting
    if (item.hasSubmenu) {
      event.preventDefault();
      event.stopPropagation();

      if (item.submenuOpen) {
        this.closeCurrentSubmenu();
      } else {
        this.openSubmenu(item);
      }
      return;
    }

    // Handle regular items
    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }

    this.dispatchEvent(new CustomEvent('pp-select', { detail: { item } }));
  }

  private handleKeyDown(event: KeyboardEvent) {
    const items = this.getAllItems();
    const activeItem = this.getCurrentItem();
    const currentIndex = activeItem ? items.indexOf(activeItem) : 0;

    // Make a selection when pressing enter or space
    if (event.key === 'Enter' || event.key === ' ') {
      const item = this.getCurrentItem();
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
      if (item?.hasSubmenu) {
        event.preventDefault();
        event.stopPropagation();
        this.openSubmenu(item);
      }
    }

    else if (event.key === 'ArrowLeft') {
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
    else if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
      event.preventDefault();
      this.handleTypeAhead(event.key.toLowerCase());
    }

    // Escape key support
    else if (event.key === 'Escape') {
      // Allow parent components (like dropdown) to handle escape
      event.stopPropagation();
      announce('Navigation cancelled');
    }
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

  private handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isListItem(target)) {
      this.setCurrentItem(target as PpListItem);
    }
  }

  private handleMouseOver(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const listItem = target.closest('pp-list-item') as PpListItem;

    if (listItem && this.isListItem(listItem)) {
      this.setCurrentItem(listItem);

      // Close any existing submenus when moving to a different item
      const currentlyOpenSubmenu = this.getAllItems().find(item => item.submenuOpen);
      if (currentlyOpenSubmenu && currentlyOpenSubmenu !== listItem) {
        this.closeSubmenu(currentlyOpenSubmenu);
      }

      // Open submenu for the current item if it has one
      if (listItem.hasSubmenu) {
        this.handleSubmenuMouseEnter(listItem);
      }
    }
  }

  private handleMouseLeave() {
    this.handleSubmenuMouseLeave();
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
      ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(item.getAttribute('role') ?? '')
    );
  }

  // Gets all slotted list items, ignoring dividers, headers, and other elements.
  getAllItems() {
    return [...this.defaultSlot.assignedElements({ flatten: true })].filter((el: Element) => {
      if ((el as HTMLElement).inert || !this.isListItem(el as HTMLElement)) {
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
    const previousItem = this.getCurrentItem();

    items.forEach(i => {
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
    if (!item.hasSubmenu) return;

    // Close other submenus first
    this.closeAllSubmenus();

    // Open the new submenu
    item.submenuOpen = true;
    this.openSubmenus.add(item);
    this.currentSubmenu = item;

    // Announce to screen readers
    const itemText = item.getTextLabel();
    announce(`Opened submenu for ${itemText}`);

    // Find the submenu list and focus first item
    const submenuSlot = item.querySelector('slot[name="submenu"]') as HTMLSlotElement;
    if (submenuSlot) {
      const submenuList = submenuSlot.assignedElements().find(el => el.tagName.toLowerCase() === 'pp-list') as PpList;
      if (submenuList) {
        const submenuItems = submenuList.getAllItems();
        if (submenuItems.length > 0) {
          submenuList.setCurrentItem(submenuItems[0]);
          submenuItems[0].focus();
        }
      }
    }
  }

  closeCurrentSubmenu() {
    if (this.currentSubmenu) {
      this.currentSubmenu.submenuOpen = false;
      this.openSubmenus.delete(this.currentSubmenu);
      this.currentSubmenu = null;
      announce('Closed submenu');
    }
  }

  closeSubmenu(item: PpListItem) {
    if (item.submenuOpen) {
      item.submenuOpen = false;
      this.openSubmenus.delete(item);
      if (this.currentSubmenu === item) {
        this.currentSubmenu = null;
      }
    }
  }

  closeAllSubmenus() {
    this.openSubmenus.forEach(item => {
      item.submenuOpen = false;
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
      if (item.hasSubmenu && !item.submenuOpen) {
        this.openSubmenu(item);
      }
    }, 150);
  }

  private handleSubmenuMouseLeave() {
    this.scheduleSubmenuClose();
  }

  render() {
    return html`
      <slot
        @slotchange=${this.handleSlotChange}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}
        @mouseover=${this.handleMouseOver}
        @mouseleave=${this.handleMouseLeave}
      ></slot>
    `;
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    "pp-list": PpList;
  }
}