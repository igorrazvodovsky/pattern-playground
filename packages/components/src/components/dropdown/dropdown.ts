import { animateTo, stopAnimations } from '../../utility/animate.ts';
import { announce } from '../../utility/announce.ts';
import { getTabbableBoundary } from '../../utility/tabbable.ts';
import { getAnimation, setDefaultAnimation } from '../../utility/animation-registry.ts';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { waitForEvent } from '../../utility/event.ts';
import { watch } from '../../utility/watch.ts';
import { PpPopup } from '../popup/popup.ts';
import { getDeepestActiveElement, computeClosestContaining, getRootContainingElement } from '../../utility/shadow-dom.ts';
import type { PpList } from '../list/list';
import type { PpListItem } from '../list-item/list-item';

/**
 * @summary Show additional content that "drops down" in a panel.
 * @status draft
 * @since 0.1
 *
 * @dependency pp-popup
 *
 * Composite enhancement (rung 2): the author composes a trigger marked
 * `data-slot="trigger"` and a `pp-popup` panel child holding the dropdown
 * content (usually a `pp-list`). The element wires trigger interaction and
 * aria state, configures and drives the popup, and manages submenu popups it
 * owns. Styles: `src/styles/dropdown.css`.
 *
 * @event pp-show - Emitted when the dropdown opens.
 * @event pp-after-show - Emitted after the dropdown opens and all animations are complete.
 * @event pp-hide - Emitted when the dropdown closes.
 * @event pp-after-hide - Emitted after the dropdown closes and all animations are complete.
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
  static dependencies = { 'pp-popup': PpPopup };

  protected createRenderRoot() {
    return this;
  }

  private closeWatcher: CloseWatcher | null = null;
  private submenuPopups: Map<PpListItem, { popup: PpPopup; content: HTMLElement }> = new Map();

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

  @property({ type: Boolean, reflect: true }) flip = true;
  @property({ type: Boolean, reflect: true }) shift = true;
  @property({ attribute: 'auto-size', reflect: true }) autoSize: 'horizontal' | 'vertical' | 'both' | undefined = 'vertical';
  @property({ attribute: 'auto-size-padding', type: Number }) autoSizePadding = 10;
  @property({ attribute: 'flip-padding', type: Number }) flipPadding = 0;
  @property({ attribute: 'shift-padding', type: Number }) shiftPadding = 0;

  /** The author-composed panel popup. */
  get popup(): PpPopup | null {
    return this.querySelector<PpPopup>(':scope > pp-popup');
  }

  /** The author-composed trigger element. */
  get triggerEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>(':scope > [data-slot="trigger"]');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('keydown', this.handleHostKeyDown);
    this.addEventListener('keyup', this.handleHostKeyUp);
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    if (!this.containingElement) {
      this.containingElement = getRootContainingElement(this);
    }
    this.syncPopup();
    this.updateAccessibleTrigger();
  }

  /** Push this dropdown's positioning configuration onto the author's popup child. */
  private syncPopup() {
    const popup = this.popup;
    if (!popup) return;

    popup.classList.add('dropdown__panel');
    popup.anchor = this.triggerEl ?? '';
    popup.placement = this.placement;
    popup.distance = this.distance;
    popup.skidding = this.skidding;
    popup.strategy = this.hoist ? 'fixed' : 'absolute';
    popup.flip = this.flip;
    popup.shift = this.shift;
    if (this.autoSize) popup.autoSize = this.autoSize;
    popup.autoSizePadding = this.autoSizePadding;
    popup.flipPadding = this.flipPadding;
    popup.shiftPadding = this.shiftPadding;
    if (this.sync) popup.sync = this.sync;
    popup.setAttribute('aria-hidden', this.open ? 'false' : 'true');
  }

  firstUpdated() {
    this.syncPopup();
    this.updateAccessibleTrigger();

    if (this.open) {
      this.addOpenListeners();
      const popup = this.popup;
      if (popup) popup.active = true;
    }
  }

  protected updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    this.syncPopup();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('keydown', this.handleHostKeyDown);
    this.removeEventListener('keyup', this.handleHostKeyUp);
    this.removeOpenListeners();
    this.cleanupSubmenuPopups();

    // Ensure we clean up any remaining state
    if (this.open) {
      this.open = false;
    }
  }

  focusOnTrigger() {
    const trigger = this.triggerEl;
    if (typeof trigger?.focus === 'function') {
      trigger.focus();
    }
  }

  getList() {
    return this.popup?.querySelector<PpList>('pp-list') ?? undefined;
  }

  private isFromTrigger(event: Event) {
    const target = event.target as Element | null;
    const trigger = target?.closest('[data-slot="trigger"]');
    return !!trigger && trigger === this.triggerEl;
  }

  private handleHostClick = (event: MouseEvent) => {
    if (!this.isFromTrigger(event)) return;
    this.handleTriggerClick();
  };

  private handleHostKeyDown = (event: KeyboardEvent) => {
    if (!this.isFromTrigger(event)) return;
    this.handleTriggerKeyDown(event);
  };

  private handleHostKeyUp = (event: KeyboardEvent) => {
    if (!this.isFromTrigger(event)) return;
    this.handleTriggerKeyUp(event);
  };

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
          if (popup.popup.contains(activeElement)) {
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
    for (const { popup } of this.submenuPopups.values()) {
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

  // The trigger can be arbitrary content, but we need to link it to the dropdown panel with `aria-haspopup` and
  // `aria-expanded`. These must be applied to the "accessible trigger" (the tabbable portion of the trigger element)
  // so screen readers will understand them.
  updateAccessibleTrigger() {
    const triggerEl = this.triggerEl;
    if (!triggerEl) return;

    const accessibleTrigger = getTabbableBoundary(triggerEl).start ? triggerEl : undefined;
    let target: HTMLElement;

    if (accessibleTrigger) {
      switch (accessibleTrigger.tagName.toLowerCase()) {
        case 'button':
        case 'a':
        case 'input':
          target = accessibleTrigger;
          break;

        default: {
          // For custom elements or other components, look for a button/link inside
          const innerButton = accessibleTrigger.querySelector('button, a, [role="button"]') as HTMLElement;
          target = innerButton || accessibleTrigger;
        }
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
    this.popup?.reposition();
  }

  addOpenListeners() {
    const popup = this.popup;
    if (popup) {
      popup.addEventListener('pp-select', this.handlePanelSelect as EventListener);
      popup.addEventListener('pp-submenu-open', this.handleSubmenuOpen as EventListener);
      popup.addEventListener('pp-submenu-close', this.handleSubmenuClose as EventListener);
    }
    if ('CloseWatcher' in window) {
      this.closeWatcher?.destroy();
      this.closeWatcher = new CloseWatcher();
      this.closeWatcher.onclose = () => {
        this.hide();
        this.focusOnTrigger();
      };
    } else {
      popup?.addEventListener('keydown', this.handleKeyDown);
    }
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    document.addEventListener('mousedown', this.handleDocumentMouseDown);
  }

  removeOpenListeners() {
    const popup = this.popup;
    if (popup) {
      popup.removeEventListener('pp-select', this.handlePanelSelect as EventListener);
      popup.removeEventListener('pp-submenu-open', this.handleSubmenuOpen as EventListener);
      popup.removeEventListener('pp-submenu-close', this.handleSubmenuClose as EventListener);
      popup.removeEventListener('keydown', this.handleKeyDown);
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

    const popup = this.popup;
    if (!popup) return;

    if (this.open) {

      this.dispatchEvent(new Event('pp-show', { bubbles: true, cancelable: false, composed: true }))
      this.addOpenListeners();

      // Announce dropdown opening to screen readers
      const list = this.getList();
      const itemCount = list ? list.getAllItems().length : 0;
      announce(`Dropdown opened with ${itemCount} ${itemCount === 1 ? 'option' : 'options'}`);

      await stopAnimations(this);
      popup.setAttribute('aria-hidden', 'false');
      popup.active = true;
      const { keyframes, options } = getAnimation(this, 'dropdown.show');
      await animateTo(popup, keyframes, options);

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
      announce('Dropdown closed');

      await stopAnimations(this);
      const { keyframes, options } = getAnimation(this, 'dropdown.hide');
      await animateTo(popup, keyframes, options);
      popup.setAttribute('aria-hidden', 'true');
      popup.active = false;

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

    const submenuContent = item.querySelector('[data-slot="submenu"], [slot="submenu"]') as HTMLElement;
    if (!submenuContent) return;

    const popup = document.createElement('pp-popup') as PpPopup;
    popup.anchor = item;
    popup.placement = item.submenuPlacement || 'right-start';
    popup.distance = 4;
    popup.strategy = this.hoist ? 'fixed' : 'absolute';
    popup.flip = this.flip;
    popup.shift = this.shift;
    popup.autoSize = 'vertical';
    popup.autoSizePadding = this.autoSizePadding;
    popup.flipPadding = this.flipPadding;
    popup.shiftPadding = this.shiftPadding;

    // Move the live element (not a clone) so reactivity and event listeners are preserved.
    // It is restored to its original slot in destroySubmenuPopup.
    submenuContent.removeAttribute('slot');
    submenuContent.removeAttribute('data-slot');
    popup.appendChild(submenuContent);

    document.body.appendChild(popup);
    this.submenuPopups.set(item, { popup, content: submenuContent });

    await popup.updateComplete;
    await new Promise(resolve => requestAnimationFrame(resolve));

    popup.active = true;
    requestAnimationFrame(() => popup.reposition());

    popup.addEventListener('pp-select', (e) => {
      this.dispatchEvent(new CustomEvent('pp-select', {
        detail: (e as CustomEvent).detail,
        bubbles: true,
        composed: true
      }));
      if (!this.stayOpenOnSelect) {
        this.hide();
      }
    });

    popup.addEventListener('mouseenter', () => {
      const list = this.getList();
      if (list) {
        list.cancelSubmenuClose();
        list.setCurrentItem(item);
      }
    });

    popup.addEventListener('mouseleave', () => {
      const list = this.getList();
      if (list) {
        list.scheduleSubmenuClose();
      }
    });
  }

  private destroySubmenuPopup(item: PpListItem) {
    const entry = this.submenuPopups.get(item);
    if (!entry) return;
    const { popup, content } = entry;
    // Restore content to its original slot before removing the popup
    content.setAttribute('data-slot', 'submenu');
    item.appendChild(content);
    popup.remove();
    this.submenuPopups.delete(item);
  }

  private cleanupSubmenuPopups() {
    this.submenuPopups.forEach(({ popup, content }, item) => {
      content.setAttribute('data-slot', 'submenu');
      item.appendChild(content);
      popup.remove();
    });
    this.submenuPopups.clear();
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
