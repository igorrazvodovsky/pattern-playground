import { html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query, state } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import styles from './select.css?inline';

/**
 * @summary Choose one value from a short, bounded set of pre-defined options.
 * @status draft
 * @since 0.0.1
 *
 * @slot - Default slot for `<option>` and `<optgroup>` elements.
 * @slot prefix - Used to prepend a presentational icon or similar element to the control.
 * @slot suffix - Used to append a presentational icon or similar element to the control.
 * @slot hint - Supplementary guidance rendered beneath the control.
 * @slot error - Validation message rendered beneath the control when `invalid` is true.
 *
 * @csspart form-control - The outer form-control wrapper.
 * @csspart base - The component's base wrapper around the control.
 * @csspart select - The internal native `<select>` element.
 * @csspart prefix - The container that wraps the prefix slot.
 * @csspart suffix - The container that wraps the suffix slot.
 * @csspart caret - The decorative caret indicator.
 * @csspart hint - The hint region rendered beneath the control.
 * @csspart error - The error region rendered beneath the control.
 */

export interface SelectProps {
  value: string;
}

export class PpSelect extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @query('.select__control') select!: HTMLSelectElement;
  @query('slot:not([name])') defaultSlot!: HTMLSlotElement;

  @state() private hasFocus = false;

  @property() name = '';
  @property() value = '';
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) invalid = false;
  @property() placeholder = '';
  @property({ type: Boolean }) autofocus = false;
  @property() label = '';
  @property() labelledby = '';
  @property() describedby = '';

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.syncOptionsToNativeSelect();
  }

  private syncOptionsToNativeSelect() {
    // Light DOM <option>/<optgroup> children are projected via <slot> into the
    // internal native <select>. When the slotted nodes change, re-apply the
    // current value so the native control reflects it.
    if (this.select && this.value !== undefined) {
      this.select.value = this.value;
    }
  }

  private handleSlotChange = () => {
    this.syncOptionsToNativeSelect();
  };

  private handleChange = () => {
    this.value = this.select.value;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
    }));
  };

  private handleFocus = () => {
    this.hasFocus = true;
  };

  private handleBlur = () => {
    this.hasFocus = false;
  };

  focus(options?: FocusOptions) {
    this.select.focus(options);
  }

  blur() {
    this.select.blur();
  }

  render() {
    const describedbyIds = [
      this.describedby || null,
      'select-hint',
      this.invalid ? 'select-error' : null,
    ].filter(Boolean).join(' ') || undefined;

    return html`
      <div
        part="form-control"
        class=${classMap({
      'form-control': true,
      'form-control--small': this.size === 'small',
      'form-control--medium': this.size === 'medium',
      'form-control--large': this.size === 'large',
    })}
      >
        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${classMap({
      select: true,
      'select--small': this.size === 'small',
      'select--medium': this.size === 'medium',
      'select--large': this.size === 'large',
      'select--disabled': this.disabled,
      'select--focused': this.hasFocus,
      'select--invalid': this.invalid,
      'select--empty': !this.value,
    })}
          >
            <span part="prefix" class="select__prefix">
              <slot name="prefix"></slot>
            </span>

            <select
              part="select"
              id="select"
              class="select__control"
              name=${ifDefined(this.name || undefined)}
              ?disabled=${this.disabled}
              ?required=${this.required}
              ?autofocus=${this.autofocus}
              .value=${live(this.value)}
              aria-label=${ifDefined(this.label || undefined)}
              aria-labelledby=${ifDefined(this.labelledby || undefined)}
              aria-describedby=${ifDefined(describedbyIds)}
              aria-invalid=${this.invalid ? 'true' : 'false'}
              @change=${this.handleChange}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            >
              ${this.placeholder
        ? html`<option value="" disabled ?selected=${!this.value}>${this.placeholder}</option>`
        : ''}
              <slot @slotchange=${this.handleSlotChange}></slot>
            </select>

            <span part="caret" class="select__caret" aria-hidden="true">
              <iconify-icon icon="ph:caret-down"></iconify-icon>
            </span>

            <span part="suffix" class="select__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>

          <div part="hint" id="select-hint" class="select__hint">
            <slot name="hint"></slot>
          </div>

          ${this.invalid
        ? html`
                <div part="error" id="select-error" class="select__error">
                  <span class="visually-hidden">Error:</span>
                  <slot name="error"></slot>
                </div>
              `
        : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-select": PpSelect;
  }
}
