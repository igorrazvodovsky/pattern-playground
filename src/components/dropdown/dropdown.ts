// TODO:
// Submenu
// Positioning glitch

import { animateTo, stopAnimations } from '../../utility/animate.ts';
import { classMap } from 'lit/directives/class-map.js';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry.ts';
import { getTabbableBoundary } from '../../utility/tabbable.ts';
import { LitElement, html, unsafeCSS } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query } from 'lit/decorators.js';
import { waitForEvent } from '../../utility/event.ts';
import { watch } from '../../utility/watch.ts';
import { PpPopup } from '../popup/popup.ts';
import { getDeepestActiveElement, computeClosestContaining, getRootContainingElement } from '../../utility/shadow-dom.ts';
import styles from './dropdown.css?inline';
import type { CSSResultGroup } from 'lit';
import type { PpList } from '../list/list';
import type { PpListItem } from '../list-item/list-item';

/**
 * @summary Show additional content that "drops down" in a panel.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * @slot - The dropdown's main content.
 * @slot trigger - The dropdown's trigger, usually a `<button>`.
 *
 * @event pp-show - Emitted when the dropdown opens.
 * @event pp-after-show - Emitted after the dropdown opens and all animations are complete.
 * @event pp-hide - Emitted when the dropdown closes.
 * @event pp-after-hide - Emitted after the dropdown closes and all animations are complete.
 *
 * @csspart base - The component's base wrapper.
 * @csspart trigger - The container that wraps the trigger.
 * @csspart panel - The panel that gets shown when the dropdown is open.
 *
 * @animation dropdown.show - The animation to use when showing the dropdown.
 * @animation dropdown.hide - The animation to use when hiding the dropdown.
 */

type PpSelectEvent = CustomEvent<{ item: PpListItem }>;

// Declare CloseWatcher for browsers that support it
declare global {
  interface Window {
    CloseWatcher: typeof CloseWatcher;
  }
  class CloseWatcher {
    constructor();
    destroy(): void;
    onclose: (() => void) | null;
  }
}

export class PpDropdown extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];
  static dependencies = { 'pp-popup': PpPopup };

  @query('.dropdown') popup!: PpPopup;
  @query('.dropdown__trigger') trigger!: HTMLSlotElement;
  @query('.dropdown__panel') panel!: HTMLSlotElement;

  private closeWatcher: CloseWatcher | null = null;
  private announcer: HTMLElement | null = null;
  private submenuPopups: Map<PpListItem, PpPopup> = new Map();

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'left'
    | 'left-start'
    | 'left-end' = 'bottom-start';

  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ attribute: 'stay-open-on-select', type: Boolean, reflect: true }) stayOpenOnSelect = false;
  @property({ attribute: false }) containingElement?: HTMLElement;
  @property({ type: Number }) distance = 4;
  @property({ type: Number }) skidding = 0;
  @property({ type: Boolean }) hoist = false;
  @property({ reflect: true }) sync: 'width' | 'height' | 'both' | undefined = undefined;

  // Missing popup properties that were being used in render but not declared
  @property({ type: Boolean, reflect: true }) flip = true;
  @property({ type: Boolean, reflect: true }) shift = true;
  @property({ attribute: 'auto-size', reflect: true }) autoSize: 'horizontal' | 'vertical' | 'both' | undefined = 'vertical';
  @property({ attribute: 'auto-size-padding', type: Number }) autoSizePadding = 10;
  @property({ attribute: 'flip-padding', type: Number }) flipPadding = 0;
  @property({ attribute: 'shift-padding', type: Number }) shiftPadding = 0;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    if (!this.containingElement) {
      // Use improved shadow DOM traversal to find the proper containing element
      this.containingElement = getRootContainingElement(this);
    }
    this.createScreenReaderAnnouncer();
  }

  private createScreenReaderAnnouncer() {
    // Create a live region for screen reader announcements
    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.style.position = 'absolute';
      this.announcer.style.left = '-10000px';
      this.announcer.style.width = '1px';
      this.announcer.style.height = '1px';
      this.announcer.style.overflow = 'hidden';
      document.body.appendChild(this.announcer);
    }
  }

  private announce(message: string) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  firstUpdated() {
    this.panel.hidden = !this.open;

    if (this.open) {
      this.addOpenListeners();
      this.popup.active = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeOpenListeners();

    // Clean up screen reader announcer
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }

    // Clean up submenu popups
    this.cleanupSubmenuPopups();

    // Ensure we clean up any remaining state
    if (this.open) {
      this.open = false;
    }
  }

  focusOnTrigger() {
    const trigger = this.trigger.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    if (typeof trigger?.focus === 'function') {
      trigger.focus();
    }
  }

  getList() {
    return this.panel.assignedElements({ flatten: true }).find(el => el.tagName.toLowerCase() === 'pp-list') as
      | PpList
      | undefined;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.open && event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
      this.focusOnTrigger();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.open && !this.closeWatcher) {
      event.stopPropagation();
      this.focusOnTrigger();
      this.hide();
      return;
    }

    if (event.key === 'Tab') {
      if (this.open && document.activeElement?.tagName.toLowerCase() === 'pp-list-item') {
        event.preventDefault();
        this.hide();
        this.focusOnTrigger();
        return;
      }

      // Use improved Shadow DOM traversal for better active element detection
      // Use requestAnimationFrame for better performance than setTimeout
      requestAnimationFrame(() => {
        const activeElement = getDeepestActiveElement();

        if (!this.containingElement || !activeElement) {
          this.hide();
          return;
        }

        // Check if focus is within the main dropdown
        if (computeClosestContaining(activeElement, this.containingElement.tagName.toLowerCase()) === this.containingElement) {
          return; // Focus is in main dropdown, keep open
        }

        // Check if focus is within any submenu popup
        for (const popup of this.submenuPopups.values()) {
          if (popup.contains(activeElement)) {
            return; // Focus is in submenu, keep open
          }
        }

        // Focus is outside both main dropdown and all submenus, so close
        this.hide();
      });
    }
  };

  private handleDocumentMouseDown = (event: MouseEvent) => {
    const path = event.composedPath();

    // Check if click is within the main dropdown
    if (this.containingElement && path.includes(this.containingElement)) {
      return;
    }

    // Check if click is within any submenu popup
    for (const popup of this.submenuPopups.values()) {
      if (path.includes(popup)) {
        return; // Don't close if clicking in submenu
      }
    }

    // Click is outside both main dropdown and all submenus, so close
    this.hide();
  };

  private handlePanelSelect = (event: PpSelectEvent) => {
    const target = event.target as HTMLElement;

    if (!this.stayOpenOnSelect && target.tagName.toLowerCase() === 'pp-list') {
      this.hide();
      this.focusOnTrigger();
    }
  };

  handleTriggerClick() {
    if (this.open) {
      this.hide();
    } else {
      this.show();
      this.focusOnTrigger();
    }
  }

  async handleTriggerKeyDown(event: KeyboardEvent) {
    if ([' ', 'Enter'].includes(event.key)) {
      event.preventDefault();
      this.handleTriggerClick();
      return;
    }

    const list = this.getList();

    if (list) {
      const listItems = list.getAllItems();
      const firstListItem = listItems[0];
      const lastListItem = listItems[listItems.length - 1];

      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();

        if (!this.open) {
          this.show();

          await this.updateComplete;
        }

        if (listItems.length > 0) {
          this.updateComplete.then(() => {
            if (event.key === 'ArrowDown' || event.key === 'Home') {
              list.setCurrentItem(firstListItem);
              firstListItem.focus();
            }

            if (event.key === 'ArrowUp' || event.key === 'End') {
              list.setCurrentItem(lastListItem);
              lastListItem.focus();
            }
          });
        }
      }
    }
  }

  handleTriggerKeyUp(event: KeyboardEvent) {
    // Prevent space from triggering a click event in Firefox
    if (event.key === ' ') {
      event.preventDefault();
    }
  }

  handleTriggerSlotChange() {
    this.updateAccessibleTrigger();
  }

  // Type guard for components with button property
  private hasButton(element: HTMLElement): element is HTMLElement & { button: HTMLElement } {
    return 'button' in element && element.button instanceof HTMLElement;
  }

  // Improved accessible trigger detection that handles more component types beyond just pp-button
  // Slotted triggers can be arbitrary content, but we need to link them to the dropdown panel with `aria-haspopup` and
  // `aria-expanded`. These must be applied to the "accessible trigger" (the tabbable portion of the trigger element
  // that gets slotted in) so screen readers will understand them.

  updateAccessibleTrigger() {
    const assignedElements = this.trigger.assignedElements({ flatten: true }) as HTMLElement[];
    const accessibleTrigger = assignedElements.find(el => getTabbableBoundary(el).start);
    let target: HTMLElement;

    if (accessibleTrigger) {
      // More generic component detection with improved type safety
      switch (accessibleTrigger.tagName.toLowerCase()) {
        case 'pp-button':
        case 'pp-icon-button':
          target = this.hasButton(accessibleTrigger) ? accessibleTrigger.button : accessibleTrigger;
          break;

        case 'button':
        case 'a':
        case 'input':
          target = accessibleTrigger;
          break;

        default:
          // For custom elements or other components, look for a button/link inside
          const innerButton = accessibleTrigger.querySelector('button, a, [role="button"]') as HTMLElement;
          target = innerButton || accessibleTrigger;
      }

      target.setAttribute('aria-haspopup', 'true');
      target.setAttribute('aria-expanded', this.open ? 'true' : 'false');
    }
  }

  async show() {
    if (this.open) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'pp-after-show');
  }

  async hide() {
    if (!this.open) {
      return undefined;
    }

    this.open = false;
    return waitForEvent(this, 'pp-after-hide');
  }

  reposition() {
    this.popup.reposition();
  }

  addOpenListeners() {
    this.panel.addEventListener('pp-select', this.handlePanelSelect as EventListener);
    this.panel.addEventListener('pp-submenu-open', this.handleSubmenuOpen as EventListener);
    this.panel.addEventListener('pp-submenu-close', this.handleSubmenuClose as EventListener);
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        this.hide();
        this.focusOnTrigger();
      };
    } else {
      this.panel.addEventListener('keydown', this.handleKeyDown);
    }
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
  }

  removeOpenListeners() {
    if (this.panel) {
      this.panel.removeEventListener('pp-select', this.handlePanelSelect as EventListener);
      this.panel.removeEventListener('pp-submenu-open', this.handleSubmenuOpen as EventListener);
      this.panel.removeEventListener('pp-submenu-close', this.handleSubmenuClose as EventListener);
      this.panel.removeEventListener('keydown', this.handleKeyDown);
    }
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown);

    // Ensure CloseWatcher is properly cleaned up
    if (this.closeWatcher) {
      this.closeWatcher.destroy();
      this.closeWatcher = null;
    }
  }

  @watch('open', { waitUntilFirstUpdate: true })
  async handleOpenChange() {
    if (this.disabled) {
      this.open = false;
      return;
    }

    this.updateAccessibleTrigger();

    if (this.open) {

      this.dispatchEvent(new Event('pp-show', { bubbles: true, cancelable: false, composed: true }))
      this.addOpenListeners();

      // Announce dropdown opening to screen readers
      const list = this.getList();
      const itemCount = list ? list.getAllItems().length : 0;
      this.announce(`Dropdown opened with ${itemCount} ${itemCount === 1 ? 'option' : 'options'}`);

      await stopAnimations(this);
      this.panel.hidden = false;
      this.popup.active = true;
      const { keyframes, options } = getAnimation(this, 'dropdown.show');
      await animateTo(this.popup, keyframes, options);

      this.dispatchEvent(new Event('pp-after-show', { bubbles: true, cancelable: false, composed: true }))

      // Focus first item for better keyboard navigation
      if (list) {
        const items = list.getAllItems();
        if (items.length > 0) {
          list.setCurrentItem(items[0]);
          // Don't focus automatically here - let keyboard navigation handle it
        }
      }

    } else {
      this.dispatchEvent(new Event('pp-hide', { bubbles: true, cancelable: false, composed: true }))
      this.removeOpenListeners();

      // Announce dropdown closing to screen readers
      this.announce('Dropdown closed');

      await stopAnimations(this);
      const { keyframes, options } = getAnimation(this, 'dropdown.hide');
      await animateTo(this.popup, keyframes, options);
      this.panel.hidden = true;
      this.popup.active = false;

      this.dispatchEvent(new Event('pp-after-hide', { bubbles: true, cancelable: false, composed: true }))
    }
  }

  // Submenu event handlers
  private handleSubmenuOpen = (event: CustomEvent) => {
    const item = event.detail.item as PpListItem;
    this.createSubmenuPopup(item);
  };

  private handleSubmenuClose = (event: CustomEvent) => {
    const item = event.detail.item as PpListItem;
    this.destroySubmenuPopup(item);
  };

  // Submenu popup management methods
  private async createSubmenuPopup(item: PpListItem) {
    if (this.submenuPopups.has(item)) return;

    // Find the submenu content (light DOM element with slot="submenu")
    const submenuContent = item.querySelector('[slot="submenu"]') as HTMLElement;
    if (!submenuContent) return;

    // Create a new popup for the submenu
    const popup = document.createElement('pp-popup') as PpPopup;

    // Set anchor BEFORE adding to DOM (critical for initialization)
    popup.anchor = item;

    // Set all properties before DOM insertion
    popup.placement = item.submenuPlacement || 'right-start';
    popup.distance = 4;
    popup.strategy = this.hoist ? 'fixed' : 'absolute';
    popup.flip = this.flip;
    popup.shift = this.shift;
    popup.autoSize = 'vertical';
    popup.autoSizePadding = this.autoSizePadding;
    popup.flipPadding = this.flipPadding;
    popup.shiftPadding = this.shiftPadding;

    // Clone and append content
    const clonedContent = submenuContent.cloneNode(true) as HTMLElement;
    clonedContent.removeAttribute('slot');
    popup.appendChild(clonedContent);

    // Add to document and wait for it to be fully rendered
    document.body.appendChild(popup);
    this.submenuPopups.set(item, popup);

    // Wait for the popup to complete its first render before activating
    await popup.updateComplete;

    // Wait an additional frame to ensure DOM is settled
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Now activate the popup
    popup.active = true;

    // Final positioning after activation
    requestAnimationFrame(() => {
      popup.reposition();
    });

    // Handle submenu selection events
    popup.addEventListener('pp-select', (e) => {
      // Bubble up the selection event to the main dropdown
      this.dispatchEvent(new CustomEvent('pp-select', {
        detail: e.detail,
        bubbles: true,
        composed: true
      }));

      // Close submenu and potentially the whole dropdown based on stayOpenOnSelect
      if (!this.stayOpenOnSelect) {
        this.hide();
      }
    });

    // Handle mouse events to prevent premature closing
    popup.addEventListener('mouseenter', () => {
      // Clear any pending close timeout when mouse enters submenu
      const list = this.panel.querySelector('pp-list');
      if (list && (list as any).submenuTimeout) {
        clearTimeout((list as any).submenuTimeout);
        (list as any).submenuTimeout = null;
      }

      // Keep the parent item as current when in submenu
      const parentList = this.panel.querySelector('pp-list');
      if (parentList) {
        (parentList as any).setCurrentItem(item);
      }
    });

    popup.addEventListener('mouseleave', () => {
      // Start a new timeout to close submenu when leaving
      const list = this.panel.querySelector('pp-list');
      if (list) {
        (list as any).submenuTimeout = window.setTimeout(() => {
          (list as any).closeAllSubmenus();
        }, 100);
      }
    });
  }

  private destroySubmenuPopup(item: PpListItem) {
    const popup = this.submenuPopups.get(item);
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
      this.submenuPopups.delete(item);
    }
  }

  private cleanupSubmenuPopups() {
    this.submenuPopups.forEach((popup) => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    });
    this.submenuPopups.clear();
  }

  render() {
    return html`
      <pp-popup
        part="base"
        id="dropdown"
        placement=${this.placement}
        distance=${this.distance}
        skidding=${this.skidding}
        strategy=${this.hoist ? 'fixed' : 'absolute'}
        ?flip=${this.flip}
        ?shift=${this.shift}
        auto-size=${ifDefined(this.autoSize)}
        auto-size-padding=${this.autoSizePadding}
        flip-padding=${this.flipPadding}
        shift-padding=${this.shiftPadding}
        sync=${ifDefined(this.sync ? this.sync : undefined)}
        class=${classMap({
      dropdown: true,
      'dropdown--open': this.open
    })}
      >
        <slot
          name="trigger"
          slot="anchor"
          part="trigger"
          class="dropdown__trigger"
          @click=${this.handleTriggerClick}
          @keydown=${this.handleTriggerKeyDown}
          @keyup=${this.handleTriggerKeyUp}
          @slotchange=${this.handleTriggerSlotChange}
        ></slot>

        <div aria-hidden=${this.open ? 'false' : 'true'} aria-labelledby="dropdown">
          <slot part="panel" class="dropdown__panel"></slot>
        </div>
      </pp-popup>
    `;
  }
}

setDefaultAnimation('dropdown.show', {
  keyframes: [
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1 }
  ],
  options: { duration: 100, easing: 'ease' }
});

setDefaultAnimation('dropdown.hide', {
  keyframes: [
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 0.9 }
  ],
  options: { duration: 100, easing: 'ease' }
});

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    "pp-dropdown": PpDropdown;
  }
}
