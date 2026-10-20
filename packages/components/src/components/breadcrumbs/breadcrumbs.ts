import { Elena } from '@elenajs/core';
import { observeTrailFit } from '../../utility/trail-fit';

/**
 * Renders nothing and enhances the trail it is given — navigation role,
 * link and disguised-select interception, and keeping the trail on one line
 * within its own width: when the items overflow, it sets `collapsed`, and the
 * styles fold the middle items into the trail's `.crumb--overflow` menu (or an
 * ellipsis, for a trail without one).
 * Styles live in `src/styles/breadcrumbs.css`.
 */
export class PpBreadcrumbs extends Elena(HTMLElement) {
  static tagName = 'pp-breadcrumbs';

  private stopFit?: () => void;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('change', this.handleChange);
    this.stopFit = observeTrailFit(this, 'collapsed');
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
    this.stopFit?.();
  }

  private init() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'navigation');
    }
  }

  private emitNavigation(value: string) {
    this.dispatchEvent(new CustomEvent('pp-breadcrumb-navigate', {
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
