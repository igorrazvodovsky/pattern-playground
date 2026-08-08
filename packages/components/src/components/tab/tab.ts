import { Elena } from '@elenajs/core';

let id = 0;

/**
 * @summary Tabs are used inside tab groups to represent and activate tab panels.
 * @status draft
 * @since 0.0.1
 *
 * The element itself is the tab — it renders
 * nothing and enhances itself with `role="tab"` and `aria-selected`. It
 * starts focusable (`tabindex="0"`); inside a `pp-tab-group` the group roves
 * `tabindex` across its tabs so the tablist is a single tab stop.
 * Compose the label as text, with optional
 * `data-slot="icon"` (place it first) and `data-slot="subtitle"` children.
 * Styles live in `src/styles/tabs.css`.
 */

export class PpTab extends Elena(HTMLElement) {
  static tagName = 'pp-tab';

  static props = ['panel', 'active'];

  private readonly attrId = ++id;
  private readonly componentId = `tab-${this.attrId}`;

  panel = '';
  active = false;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.setAttribute('role', 'tab');
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    this.id = this.id.length > 0 ? this.id : this.componentId;
  }

  updated() {
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab': PpTab;
  }
}
