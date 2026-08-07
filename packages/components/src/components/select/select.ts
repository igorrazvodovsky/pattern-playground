import { Elena } from '@elenajs/core';

let id = 0;

/**
 * @summary Choose one value from a short, bounded set of pre-defined options.
 * @status draft
 * @since 0.0.1
 *
 * The author composes a native `<select>`
 * (with its own options, placeholder option, label association, and form
 * participation) inside the element; optional `data-slot="hint"` and
 * `data-slot="error"` children render beneath the control. The element
 * appends the caret it owns, wires `aria-describedby` to hint and error, and
 * reflects `invalid` onto the control. Styles: `src/styles/select.css`.
 */

export interface SelectProps {
  value: string;
}

export class PpSelect extends Elena(HTMLElement) {
  static tagName = 'pp-select';

  static props = ['invalid'];

  private readonly attrId = ++id;
  private caret: HTMLElement | null = null;

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
      this.caret.innerHTML = '<iconify-icon icon="ph:caret-down"></iconify-icon>';
      this.append(this.caret);
    }
    this.wireDescriptions();
    this.reflectInvalid();
  }

  private wireDescriptions() {
    const select = this.select;
    if (!select) return;

    const ids: string[] = [];
    const authored = select.getAttribute('aria-describedby');
    if (authored) ids.push(authored);

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
    "pp-select": PpSelect;
  }
}
