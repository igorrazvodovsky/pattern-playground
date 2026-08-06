import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { watch } from '../../utility/watch.js';

/**
 * @summary Option for the user to pick from in a list.
 * @status draft
 * @since 0.1
 *
 * Composite enhancement (rung 2): the element is the menu item row. Compose
 * the label as text or unmarked children; mark adornments with
 * `data-slot="prefix"` / `data-slot="suffix"` and a nested submenu list with
 * `data-slot="submenu"`. The element appends the check mark and submenu
 * chevron it owns, and manages roles and aria state.
 * Styles live in `src/styles/list-item.css`.
 */

export class PpListItem extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  @property() type: 'normal' | 'checkbox' | 'radio' = 'normal';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property() value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // Submenu properties
  @property({ attribute: 'has-submenu', type: Boolean, reflect: true }) hasSubmenu = false;
  @property({ attribute: 'submenu-open', type: Boolean, reflect: true }) submenuOpen = false;
  @property({ attribute: 'submenu-placement', reflect: true }) submenuPlacement: 'right-start' | 'left-start' = 'right-start';

  // Enhanced accessibility properties
  @property({ attribute: 'aria-setsize', type: Number, reflect: true }) ariaSetsize?: number;
  @property({ attribute: 'aria-posinset', type: Number, reflect: true }) ariaPosinset?: number;

  private initialized = false;
  private check: HTMLElement | null = null;
  private chevron: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    if (!this.initialized) {
      document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
    }
  }

  private init() {
    if (this.initialized) return;
    this.initialized = true;
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('focus', this.handleFocus);
    this.addEventListener('blur', this.handleBlur);

    if (!this.check) {
      this.check = document.createElement('span');
      this.check.className = 'list-item__check';
      this.check.innerHTML = '<iconify-icon class="icon" icon="ph:check" aria-hidden="true"></iconify-icon>';
      this.prepend(this.check);
    }
    if (!this.chevron) {
      this.chevron = document.createElement('span');
      this.chevron.className = 'list-item__chevron';
      this.chevron.innerHTML = '<iconify-icon class="icon" icon="ph:caret-right" aria-hidden="true"></iconify-icon>';
      this.append(this.chevron);
    }

    // Ensure the role is set properly on connection
    this.handleTypeChange();
    this.handleDisabledChange();
    this.handleSubmenuChange();

    // Focus is managed by the parent list component (roving tabindex)
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('focus', this.handleFocus);
    this.removeEventListener('blur', this.handleBlur);
  }

  private handleHostClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private handleMouseOver = () => {
    if (!this.disabled) {
      this.focus();
    }
  };

  private handleFocus = () => {
    // Announce focus to screen readers
    if (!this.disabled) {
      this.setAttribute('data-focused', 'true');
    }
  };

  private handleBlur = () => {
    this.removeAttribute('data-focused');
  };

  @watch('checked')
  handleCheckedChange() {
    if (this.checked && this.type !== 'checkbox' && this.type !== 'radio') {
      this.checked = false;
      console.error('The checked attribute can only be used on list items with type="checkbox" or type="radio"', this);
      return;
    }

    if (this.type === 'checkbox' || this.type === 'radio') {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.removeAttribute('aria-checked');
    }
  }

  @watch('disabled')
  handleDisabledChange() {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  @watch('type')
  handleTypeChange() {
    if (this.type === 'checkbox') {
      this.setAttribute('role', 'menuitemcheckbox');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else if (this.type === 'radio') {
      this.setAttribute('role', 'menuitemradio');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.setAttribute('role', 'menuitem');
      this.removeAttribute('aria-checked');
    }
  }

  @watch('hasSubmenu')
  handleSubmenuChange() {
    if (this.hasSubmenu) {
      this.setAttribute('aria-haspopup', 'true');
      this.setAttribute('aria-expanded', this.submenuOpen ? 'true' : 'false');
    } else {
      this.removeAttribute('aria-haspopup');
      this.removeAttribute('aria-expanded');
    }
  }

  @watch('submenuOpen')
  handleSubmenuOpenChange() {
    if (this.hasSubmenu) {
      this.setAttribute('aria-expanded', this.submenuOpen ? 'true' : 'false');

      // Emit custom events for submenu state changes
      const eventType = this.submenuOpen ? 'pp-submenu-open' : 'pp-submenu-close';
      this.dispatchEvent(new CustomEvent(eventType, {
        bubbles: true,
        composed: true,
        detail: { item: this }
      }));
    }
  }

  /** Returns a text label based on the item's label content (unmarked children). */
  getTextLabel() {
    return [...this.childNodes]
      .filter(node => {
        if (node.nodeType === Node.TEXT_NODE) return true;
        if (!(node instanceof HTMLElement)) return false;
        return !node.hasAttribute('data-slot') && node !== this.check && node !== this.chevron;
      })
      .map(node => node.textContent ?? '')
      .join('')
      .trim();
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    "pp-list-item": PpListItem;
  }
}
