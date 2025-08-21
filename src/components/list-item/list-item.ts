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

    // Ensure the role is set properly on connection
    this.handleTypeChange();
    this.handleDisabledChange();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
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
    // TODO:
    // this.focus();
    event.stopPropagation();
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
    })}
      >
        <span part="checked-icon" class="list-item__check">
          <iconify-icon class="icon" icon="ph:check" aria-hidden="true"></iconify-icon>
        </span>
        <slot name="prefix" part="prefix" class="list-item__prefix"></slot>
        <slot part="label" class="list-item__label" @slotchange=${this.handleDefaultSlotChange}></slot>
        <slot name="suffix" part="suffix" class="list-item__suffix"></slot>
      </div>
    `;
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    "pp-list-item": PpListItem;
  }
}