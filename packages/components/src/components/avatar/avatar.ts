export class PpAvatar extends HTMLElement {
  private _size: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';

  constructor() {
    super();
  }

  get size(): 'xsmall' | 'small' | 'medium' | 'large' {
    return this._size;
  }

  set size(value: 'xsmall' | 'small' | 'medium' | 'large') {
    if (this._size !== value) {
      this._size = value;
      this.setAttribute('size', value);
    }
  }

  connectedCallback() {
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.classList.add('pp-avatar', 'pp-avatar__container');
    this.setAttribute('size', this._size);
    this.setAttribute('role', 'img');
    this.setAttribute('aria-label', this.querySelector('img')?.alt || 'Avatar');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-avatar": PpAvatar;
  }
}
