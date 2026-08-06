import { html, LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query } from 'lit/decorators.js';
import { textFromIdRefs } from '../../utility/accessible-name.js';

/**
 * @summary Range lets the actor commit to a value on a continuum by direct manipulation.
 * @status draft
 * @since 0.0.1
 *
 * Light-DOM render (rung 3): the element owns the track, input, marks, and
 * value readout it renders. Author-provided children survive alongside them —
 * mark leading/trailing content with `data-slot="prefix"` / `data-slot="suffix"`
 * (units, endpoint labels, icons); CSS places them around the track.
 * Styles live in `src/styles/range.css`.
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
  protected createRenderRoot() {
    return this;
  }

  @query('.range__control') input!: HTMLInputElement;

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

  private handleInput = (event: Event) => {
    event.stopPropagation();
    this.value = Number(this.input.value);
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  };

  async focus(options?: FocusOptions) {
    await this.updateComplete;
    this.input?.focus(options);
  }

  async blur() {
    await this.updateComplete;
    this.input?.blur();
  }

  protected willUpdate() {
    const span = this.max - this.min;
    const percent = span > 0 ? ((this.value - this.min) / span) * 100 : 0;
    this.style.setProperty('--range-percent', `${percent}%`);
  }

  private renderMarks() {
    if (!this.marks || this.step <= 0) return '';
    const span = this.max - this.min;
    if (span <= 0) return '';
    const count = Math.floor(span / this.step + 1e-9);
    if (count <= 0) return '';
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const percent = (i * this.step / span) * 100;
      ticks.push(html`<span class="range__mark" style="inset-inline-start: ${percent}%"></span>`);
    }
    return html`<div class="range__marks" aria-hidden="true">${ticks}</div>`;
  }

  render() {
    const accessibleName = this.label || textFromIdRefs(this.labelledby, this.getRootNode() as Document | ShadowRoot);
    const labelledby = accessibleName ? undefined : this.labelledby || undefined;

    return html`
      <div class="range__track-wrapper">
        <input
          class="range__control"
          type="range"
          name=${ifDefined(this.name || undefined)}
          min=${this.min}
          max=${this.max}
          step=${this.step}
          ?disabled=${this.disabled}
          .value=${live(String(this.value))}
          aria-label=${ifDefined(accessibleName || undefined)}
          aria-labelledby=${ifDefined(labelledby)}
          aria-describedby=${ifDefined(this.describedby || undefined)}
          aria-valuetext=${ifDefined(this.valueText || undefined)}
          @input=${this.handleInput}
        />
        ${this.renderMarks()}
      </div>
      ${this.hideValue ? '' : html`<span class="range__value" aria-hidden="true">${this.value}</span>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-range": PpRange;
  }
}
