import { Elena } from '@elenajs/core';

let id = 0;

const ADORNMENTS = ['prefix', 'suffix'] as const;
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/**
 * @summary Choose one value from a short, bounded set of pre-defined options.
 * @status draft
 * @since 0.0.1
 *
 * The author composes a native `<select>`
 * (with its own options, placeholder option, label association, and form
 * participation) inside the element; optional `data-slot="prefix"` and
 * `data-slot="suffix"` children overlay the control as presentational
 * adornments, and optional `data-slot="hint"` and `data-slot="error"`
 * children render beneath it. The element
 * appends the caret it owns, measures the adornments so the value clears them,
 * wires `aria-describedby` to the adornments, hint, and error, and reflects
 * `invalid` onto the control. Styles: `src/styles/select.css`.
 */

export interface SelectProps {
  value: string;
}

export class PpSelect extends Elena(HTMLElement) {
  static tagName = 'pp-select';

  static props = ['invalid'];

  private readonly attrId = ++id;
  private caret: HTMLElement | null = null;
  private resizeObserver?: ResizeObserver;

  invalid = false;

  get select(): HTMLSelectElement | null {
    return this.querySelector('select');
  }

  get value(): string {
    return this.select?.value ?? '';
  }

  set value(value: string) {
    if (this.select) this.select.value = value;
  }

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    if (!this.caret) {
      this.caret = document.createElement('span');
      this.caret.className = 'select__caret';
      this.caret.setAttribute('aria-hidden', 'true');
      this.caret.innerHTML = '<iconify-icon icon="ik:chevron-down"></iconify-icon>';
      this.append(this.caret);
    }
    this.prepareAdornments();
    this.wireDescriptions();
    this.reflectInvalid();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  private adornment(slot: (typeof ADORNMENTS)[number]): HTMLElement | null {
    return this.querySelector<HTMLElement>(`:scope > [data-slot="${slot}"]`);
  }

  // Adornments overlay the control, so the select's padding has to clear their
  // measured width; a fixed reservation would let wider text run under the value.
  private prepareAdornments() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.measureAdornments());
    for (const slot of ADORNMENTS) {
      const adornment = this.adornment(slot);
      if (!adornment) continue;
      // The text reaches assistive technology through aria-describedby instead.
      adornment.setAttribute('aria-hidden', 'true');
      if (adornment.matches(FOCUSABLE) || adornment.querySelector(FOCUSABLE)) {
        console.warn(
          `pp-select: the ${slot} adornment holds a focusable element. Adornments are presentational; place the control outside pp-select.`,
          adornment,
        );
      }
      this.resizeObserver.observe(adornment);
    }
    this.measureAdornments();
  }

  private measureAdornments() {
    for (const slot of ADORNMENTS) {
      const adornment = this.adornment(slot);
      if (adornment) {
        this.style.setProperty(`--select-${slot}-w`, `${adornment.offsetWidth}px`);
      } else {
        this.style.removeProperty(`--select-${slot}-w`);
      }
    }
  }

  private wireDescriptions() {
    const select = this.select;
    if (!select) return;

    const ids: string[] = [];
    const authored = select.getAttribute('aria-describedby');
    if (authored) ids.push(authored);

    for (const slot of ADORNMENTS) {
      const adornment = this.adornment(slot);
      if (!adornment?.textContent?.trim()) continue;
      adornment.id = adornment.id || `select-${slot}-${this.attrId}`;
      ids.push(adornment.id);
    }

    const hint = this.querySelector<HTMLElement>(':scope > [data-slot="hint"]');
    if (hint) {
      hint.id = hint.id || `select-hint-${this.attrId}`;
      ids.push(hint.id);
    }

    const error = this.querySelector<HTMLElement>(':scope > [data-slot="error"]');
    if (error) {
      error.id = error.id || `select-error-${this.attrId}`;
      if (this.invalid) ids.push(error.id);
    }

    if (ids.length > 0) {
      select.setAttribute('aria-describedby', ids.join(' '));
    }
  }

  private reflectInvalid() {
    this.select?.setAttribute('aria-invalid', this.invalid ? 'true' : 'false');
  }

  updated() {
    this.reflectInvalid();
  }

  focus(options?: FocusOptions) {
    this.select?.focus(options);
  }

  blur() {
    this.select?.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-select': PpSelect;
  }
}
