import { Elena } from '@elenajs/core';

/**
 * @summary Inputs collect data from the user.
 * @status draft
 * @since 0.0.1
 *
 * The element is the bordered field box and
 * enhances the native `<input>` (and optional `<label>`) the author composes
 * inside it. Leading/trailing adornments are children marked
 * `data-slot="prefix"` / `data-slot="suffix"`. Label association, validation,
 * and form participation are the native input's own. With `clearable`, the
 * element appends a clear button it owns. Styles: `src/styles/input.css`.
 */

export interface InputProps {
  value: string;
}

export class PpInput extends Elena(HTMLElement) {
  static tagName = 'pp-input';

  static props = ['clearable'];

  clearable = false;

  private clearButton: HTMLButtonElement | null = null;

  get input(): HTMLInputElement | null {
    return this.querySelector('input');
  }

  get value(): string {
    return this.input?.value ?? '';
  }

  set value(value: string) {
    if (this.input) this.input.value = value;
    this.reflectEmptiness();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('input', this.handleInput);
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('input', this.handleInput);
  }

  private init() {
    this.reflectEmptiness();
    if (this.clearable && !this.clearButton) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'input__clear';
      button.setAttribute('aria-label', 'Clear');
      button.tabIndex = -1;
      button.innerHTML = '<iconify-icon icon="ph:x-circle-fill"></iconify-icon>';
      button.addEventListener('click', this.handleClear);
      this.append(button);
      this.clearButton = button;
    }
  }

  private reflectEmptiness() {
    this.toggleAttribute('data-empty', !this.input?.value);
  }

  private handleInput = () => {
    this.reflectEmptiness();
  };

  private handleClear = () => {
    const input = this.input;
    if (!input) return;
    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  blur() {
    this.input?.blur();
  }

  select() {
    this.input?.select();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-input": PpInput;
  }
}
