export class PpAvatar extends HTMLElement {
  private _size: 'small' | 'medium' | 'large' = 'medium';

  constructor() {
    super();
    this.classList.add('pp-avatar', 'pp-avatar__container', `pp-avatar--${this._size}`);
  }

  get size(): 'small' | 'medium' | 'large' {
    return this._size;
  }

  set size(value: 'small' | 'medium' | 'large') {
    if (this._size !== value) {
      this.classList.remove(`pp-avatar--${this._size}`);
      this._size = value;
      this.classList.add(`pp-avatar--${this._size}`);
    }
  }

  connectedCallback() {
    this.setAttribute('role', 'img');
    this.setAttribute('aria-label', this.querySelector('img')?.alt || 'Avatar');
  }
}

customElements.define('pp-avatar', PpAvatar);

declare global {
  interface HTMLElementTagNameMap {
    "pp-avatar": PpAvatar;
  }
}
