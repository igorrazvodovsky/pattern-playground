import { html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import styles from './input.css?inline';

/**
 * @summary Inputs collect data from the user.
 * @status draft
 * @since 0.0.1
 *
 * @slot prefix - Used to prepend a presentational icon or similar element to the input.
 * @slot suffix - Used to append a presentational icon or similar element to the input.
 *
 * @csspart base - The component's base wrapper.
 * @csspart input - The internal `<input>` control.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart suffix - The container that wraps the suffix.
 * @csspart clear-button - The clear button.
 */

export interface InputProps {
  value: string;
}

export class PpInput extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @query('.input__control') input: HTMLInputElement;

  @state() private hasFocus = false;
  @property() title = ''; // make reactive to pass through

  private __numberInput = Object.assign(document.createElement('input'), { type: 'number' });
  private __dateInput = Object.assign(document.createElement('input'), { type: 'date' });

  /**
   * The type of input. Works the same as a native `<input>` element, but only a subset of types are supported.
   */
  @property({ reflect: true }) type:
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'number'
    | 'password'
    | 'search'
    | 'tel'
    | 'text'
    | 'time'
    | 'url' = 'text';
  // @property() inputmode: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  @property() name = '';
  @property() value = '';
  @property() initialValue = '';
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean }) clearable = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() placeholder = '';
  @property() autocomplete: string;
  @property({ type: Boolean }) autofocus: boolean;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.initialValue = this.value;
  }

  private handleInput() {
    this.value = this.input.value;
  }

  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  render() {
    const hasClearIcon = this.clearable && !this.disabled;
    const isClearIconVisible = hasClearIcon && (typeof this.value === 'number' || this.value.length > 0);

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
      input: true,

      'input--small': this.size === 'small',
      'input--medium': this.size === 'medium',
      'input--large': this.size === 'large',
      'input--updated': this.value !== this.initialValue,
      'input--disabled': this.disabled,
      'input--focused': this.hasFocus,
      'input--empty': !this.value,
    })}
          >
            <span part="prefix" class="input__prefix">
              <slot name="prefix"></slot>
            </span>

            <input
              part="input"
              id="input"
              class="input__control"
              type="text"
              name=${ifDefined(this.name)}
              title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
              ?disabled=${this.disabled}
              placeholder=${ifDefined(this.placeholder)}
              .value=${live(this.value)}
              autocapitalize=${ifDefined(this.autocapitalize)}
              autocomplete=${ifDefined(this.autocomplete)}
              ?autofocus=${this.autofocus}
              spellcheck=${this.spellcheck}
              aria-describedby="help-text"
              @input=${this.handleInput}
            />
            ${hasClearIcon
        ? html`
                  <button
                    part="clear-button"
                    class=${classMap({
          input__clear: true,
          'input__clear--visible': isClearIconVisible
        })}
                    type="button"
                    aria-label="Clear"
                    tabindex="-1"
                  >
                    <slot name="clear-icon">
                      <iconify-icon icon="ph:x-circle-fill"></iconify-icon>
                    </slot>
                  </button>
                `
        : ''}

            <span part="suffix" class="input__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-input": PpInput;
  }
}
