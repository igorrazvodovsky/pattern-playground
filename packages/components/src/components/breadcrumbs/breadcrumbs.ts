import { LitElement } from 'lit';

/**
 * Composite enhancement (rung 2): renders nothing and enhances the trail it
 * is given — navigation role, link and disguised-select interception.
 * Styles live in `src/styles/breadcrumbs.css`.
 */
export class PpBreadcrumbs extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('change', this.handleChange);
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('change', this.handleChange);
  }

  private init() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'navigation');
    }
  }

  private emitNavigation(value: string) {
    this.dispatchEvent(new CustomEvent('breadcrumb-navigation', {
      bubbles: true,
      composed: true,
      detail: { value },
    }));
  }

  private handleClick = (event: Event) => {
    const link = (event.target as Element).closest('a');
    if (!link || !this.contains(link)) return;
    event.preventDefault();
    this.emitNavigation(link.textContent || '');
  };

  private handleChange = (event: Event) => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement)) return;
    this.emitNavigation(select.options[select.selectedIndex]?.text || '');
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-breadcrumbs': PpBreadcrumbs;
  }
}
