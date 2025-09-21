import { classMap } from 'lit/directives/class-map.js';
import { getTextContent } from '../../utility/slot.js';
import { html, LitElement, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { watch } from '../../utility/watch.js';
import styles from './list-item.css?inline';
import type { CSSResultGroup } from 'lit';

// TODO:icon as dependency

/**
 * @summary Option for the user to pick from in a list.
 * @status draft
 * @since 0.1
 *
 * @slot - The list item's label.
 * @slot prefix - Used to prepend an icon or similar element to the list item.
 * @slot suffix - Used to append an icon or similar element to the list item.
 *
 * @csspart base - The component's base wrapper.
 * @csspart checked-icon - The checked icon, which is only visible when the list item is checked.
 * @csspart prefix - The prefix container.
 * @csspart label - The list item label.
 * @csspart suffix - The suffix container.
 */

export class PpListItem extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  private cachedTextLabel!: string;

  @query('slot:not([name])') defaultSlot!: HTMLSlotElement;
  @query('.list-item') listItem!: HTMLElement;

  @property() type: 'normal' | 'checkbox' = 'normal';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property() value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // Submenu properties
  @property({ attribute: 'has-submenu', type: Boolean, reflect: true }) hasSubmenu = false;
  @property({ attribute: 'submenu-open', type: Boolean, reflect: true }) submenuOpen = false;
  @property({ attribute: 'submenu-placement', reflect: true }) submenuPlacement: 'right-start' | 'left-start' = 'right-start';

  // Enhanced accessibility properties
  @property({ attribute: 'aria-label', reflect: true }) ariaLabel = '';
  @property({ attribute: 'aria-describedby', reflect: true }) ariaDescribedby = '';
  @property({ attribute: 'aria-setsize', type: Number, reflect: true }) ariaSetsize?: number;
  @property({ attribute: 'aria-posinset', type: Number, reflect: true }) ariaPosinset?: number;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('focus', this.handleFocus);
    this.addEventListener('blur', this.handleBlur);

    // Ensure the role is set properly on connection
    this.handleTypeChange();
    this.handleDisabledChange();
    this.handleSubmenuChange();
    this.setupAccessibility();
  }

  private setupAccessibility() {
    // Enhanced focus management
    this.setAttribute('tabindex', '-1'); // Managed by parent list component

    // Set up ARIA attributes
    if (this.ariaLabel) {
      this.setAttribute('aria-label', this.ariaLabel);
    }

    if (this.ariaDescribedby) {
      this.setAttribute('aria-describedby', this.ariaDescribedby);
    }

    if (this.ariaSetsize) {
      this.setAttribute('aria-setsize', this.ariaSetsize.toString());
    }

    if (this.ariaPosinset) {
      this.setAttribute('aria-posinset', this.ariaPosinset.toString());
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('focus', this.handleFocus);
    this.removeEventListener('blur', this.handleBlur);
  }

  private handleDefaultSlotChange() {
    const textLabel = this.getTextLabel();

    if (typeof this.cachedTextLabel === 'undefined') {
      this.cachedTextLabel = textLabel;
      return;
    }
  }

  private handleHostClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private handleMouseOver = (event: MouseEvent) => {
    // Provide visual focus indication on hover for better UX
    if (!this.disabled) {
      this.focus();
    }
    event.stopPropagation();
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
    if (this.checked && this.type !== 'checkbox') {
      this.checked = false;
      console.error('The checked attribute can only be used on list items with type="checkbox"', this);
      return;
    }

    if (this.type === 'checkbox') {
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
      this.setAttribute('role', 'listitemcheckbox');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.setAttribute('role', 'listitem');
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

  /** Returns a text label based on the contents of the list item's default slot. */
  getTextLabel() {
    return getTextContent(this.defaultSlot);
  }

  render() {
    return html`
      <div
        id="anchor"
        part="base"
        class=${classMap({
      'list-item': true,
      'list-item--checked': this.checked,
      'list-item--disabled': this.disabled,
      'list-item--has-submenu': this.hasSubmenu,
      'list-item--submenu-open': this.submenuOpen,
    })}
      >
        <span part="checked-icon" class="list-item__check">
          <iconify-icon class="icon" icon="ph:check" aria-hidden="true"></iconify-icon>
        </span>
        <slot name="prefix" part="prefix" class="list-item__prefix"></slot>
        <slot part="label" class="list-item__label" @slotchange=${this.handleDefaultSlotChange}></slot>
        <slot name="suffix" part="suffix" class="list-item__suffix"></slot>
        <span part="chevron" class="list-item__chevron">
          <iconify-icon class="icon" icon="ph:caret-right" aria-hidden="true"></iconify-icon>
        </span>
      </div>
      <slot name="submenu" part="submenu" class="list-item__submenu"></slot>
    `;
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    "pp-list-item": PpListItem;
  }
}