import { html, LitElement, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query, state } from 'lit/decorators.js';
import type { CSSResultGroup } from 'lit';
import styles from './range.css?inline';

/**
 * @summary Range lets the actor commit to a value on a continuum by direct manipulation.
 * @status draft
 * @since 0.0.1
 *
 * @slot prefix - Leading unit, min label, or icon.
 * @slot suffix - Trailing unit, max label, live value readout, or icon.
 *
 * @csspart base - The component's base wrapper.
 * @csspart input - The internal `<input type="range">` control.
 * @csspart track - The track (styled via documented custom properties).
 * @csspart thumb - The thumb (styled via documented custom properties).
 * @csspart marks - The container rendered when `marks` is true.
 * @csspart prefix - The container that wraps the prefix slot.
 * @csspart suffix - The container that wraps the suffix slot.
 *
 * @cssproperty --range-fill - Colour of the filled portion of the track. Defaults to `--c-accent-600`.
 * @cssproperty --range-track-color - Colour of the unfilled track. Defaults to `--c-border`.
 * @cssproperty --range-thumb-size - Diameter of the thumb. Defaults to `1rem`.
 */

export interface RangeProps {
  value: number;
  min: number;
  max: number;
  step: number;
}

export class PpRange extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @query('.range__control') input!: HTMLInputElement;

  @state() private hasFocus = false;

  @property({ type: Number, reflect: true }) min = 0;
  @property({ type: Number, reflect: true }) max = 100;
  @property({ type: Number }) step = 1;
  @property({ type: Number, reflect: true }) value = 0;
  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = '';
  @property() label = '';
  @property() labelledby = '';
  @property() describedby = '';
  @property({ type: Boolean, reflect: true }) marks = false;
  @property({ type: Boolean, attribute: 'hide-value', reflect: true }) hideValue = false;
  @property({ attribute: 'value-text' }) valueText = '';

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    if (this.value < this.min) this.value = this.min;
    if (this.value > this.max) this.value = this.max;
  }

  private handleInput = () => {
    this.value = Number(this.input.value);
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  };

  private handleFocus = () => {
    this.hasFocus = true;
  };

  private handleBlur = () => {
    this.hasFocus = false;
  };

  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  blur() {
    this.input.blur();
  }

  private renderMarks() {
    if (!this.marks || this.step <= 0) return '';
    const span = this.max - this.min;
    if (span <= 0) return '';
    const count = Math.floor(span / this.step);
    if (count <= 0) return '';
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const percent = (i * this.step / span) * 100;
      ticks.push(html`<span class="range__mark" style="left: ${percent}%"></span>`);
    }
    return html`<div part="marks" class="range__marks" aria-hidden="true">${ticks}</div>`;
  }

  render() {
    const span = this.max - this.min;
    const percent = span > 0 ? ((this.value - this.min) / span) * 100 : 0;

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
      range: true,
      'range--small': this.size === 'small',
      'range--medium': this.size === 'medium',
      'range--large': this.size === 'large',
      'range--disabled': this.disabled,
      'range--focused': this.hasFocus,
      'range--with-marks': this.marks,
    })}
            style="--range-percent: ${percent}%"
          >
            <span part="prefix" class="range__prefix">
              <slot name="prefix"></slot>
            </span>

            <div class="range__track-wrapper">
              <input
                part="input"
                id="input"
                class="range__control"
                type="range"
                name=${ifDefined(this.name || undefined)}
                min=${this.min}
                max=${this.max}
                step=${this.step}
                ?disabled=${this.disabled}
                .value=${live(String(this.value))}
                aria-label=${ifDefined(this.label || undefined)}
                aria-labelledby=${ifDefined(this.labelledby || undefined)}
                aria-describedby=${ifDefined(this.describedby || undefined)}
                aria-valuetext=${ifDefined(this.valueText || undefined)}
                @input=${this.handleInput}
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
              />
              ${this.renderMarks()}
            </div>

            <span part="suffix" class="range__suffix">
              <slot name="suffix">
                ${this.hideValue ? '' : html`<span class="range__value" aria-hidden="true">${this.value}</span>`}
              </slot>
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-range": PpRange;
  }
}
