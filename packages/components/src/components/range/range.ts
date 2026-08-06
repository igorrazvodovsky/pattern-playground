import { Elena, html, unsafeHTML, nothing } from '@elenajs/core';
import { textFromIdRefs } from '../../utility/accessible-name.js';

/**
 * @summary Range lets the actor commit to a value on a continuum by direct manipulation.
 * @status draft
 * @since 0.0.1
 *
 * Light-DOM render (rung 3): the element owns the track, input, marks, and
 * value readout it renders. Author-provided children are re-adopted into the
 * render — mark leading/trailing content with `data-slot="prefix"` /
 * `data-slot="suffix"` (units, endpoint labels, icons); they are captured
 * before the first render and re-emitted in place, so element identity (and
 * any listeners attached to them) does not survive. CSS places them around
 * the track. Styles live in `src/styles/range.css`.
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

type Fragment = ReturnType<typeof unsafeHTML> | typeof nothing;

export class PpRange extends Elena(HTMLElement) {
  static tagName = 'pp-range';

  static props = [
    'min',
    'max',
    'step',
    'value',
    'size',
    'disabled',
    'name',
    'label',
    'labelledby',
    'describedby',
    'marks',
    'hide-value',
    'value-text',
  ];

  min = 0;
  max = 100;
  step = 1;
  value = 0;
  size: 'small' | 'medium' | 'large' = 'medium';
  disabled = false;
  name = '';
  label = '';
  labelledby = '';
  describedby = '';
  marks = false;
  'hide-value' = false;
  'value-text' = '';

  // Author children captured before Elena's first render clears the host;
  // stable fragments keep re-renders on the patch path.
  private slotParts: { prefix: Fragment; suffix: Fragment } | null = null;
  private marksCache: { key: string; fragment: Fragment } | null = null;

  private get input(): HTMLInputElement | null {
    return this.querySelector('.range__control');
  }

  connectedCallback() {
    if (!this.slotParts) {
      const grab = (name: string): Fragment => {
        const els = [...this.querySelectorAll(`:scope > [data-slot="${name}"]`)];
        return els.length ? unsafeHTML(els.map(el => el.outerHTML).join('')) : nothing;
      };
      this.slotParts = { prefix: grab('prefix'), suffix: grab('suffix') };
    }
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
    this.value = Number(this.input!.value);
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

  willUpdate() {
    const span = this.max - this.min;
    const percent = span > 0 ? ((this.value - this.min) / span) * 100 : 0;
    this.style.setProperty('--range-percent', `${percent}%`);
  }

  private renderMarks(): Fragment {
    if (!this.marks || this.step <= 0) return nothing;
    const span = this.max - this.min;
    if (span <= 0) return nothing;
    const count = Math.floor(span / this.step + 1e-9);
    if (count <= 0) return nothing;

    const key = `${this.min}|${this.max}|${this.step}`;
    if (this.marksCache?.key === key) return this.marksCache.fragment;

    const ticks = [];
    for (let i = 0; i <= count; i++) {
      const percent = (i * this.step / span) * 100;
      ticks.push(`<span class="range__mark" style="inset-inline-start: ${percent}%"></span>`);
    }
    const fragment = unsafeHTML(`<div class="range__marks" aria-hidden="true">${ticks.join('')}</div>`);
    this.marksCache = { key, fragment };
    return fragment;
  }

  render() {
    return html`
      ${this.slotParts?.prefix ?? nothing}
      <div class="range__track-wrapper">
        <input
          class="range__control"
          type="range"
          min="${this.min}"
          max="${this.max}"
          step="${this.step}"
          value="${this.value}"
        />
        ${this.renderMarks()}
      </div>
      <span class="range__value" aria-hidden="true">${this.value}</span>
      ${this.slotParts?.suffix ?? nothing}
    `;
  }

  firstUpdated() {
    this.input?.addEventListener('input', this.handleInput);
  }

  // Everything conditional stays out of the template so re-renders keep the
  // patch path (boolean and absent-when-empty attributes have no template
  // form that survives Elena's clone parser).
  updated() {
    const input = this.input;
    if (!input) return;

    input.disabled = this.disabled;
    if (input.value !== String(this.value)) input.value = String(this.value);

    const sync = (attr: string, value: string | null) => {
      if (value === null) input.removeAttribute(attr);
      else input.setAttribute(attr, value);
    };
    const accessibleName = this.label || textFromIdRefs(this.labelledby, this.getRootNode() as Document | ShadowRoot);
    sync('name', this.name || null);
    sync('aria-label', accessibleName || null);
    sync('aria-labelledby', accessibleName ? null : this.labelledby || null);
    sync('aria-describedby', this.describedby || null);
    sync('aria-valuetext', this['value-text'] || null);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.input?.removeEventListener('input', this.handleInput);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-range": PpRange;
  }
}
