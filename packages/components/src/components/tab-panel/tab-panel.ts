import { Elena } from '@elenajs/core';

let id = 0;

/**
 * @summary Tab panels are used inside tab groups to display tab content.
 * @status draft
 * @since 0.0.1
 *
 * The element renders nothing and enhances
 * itself with `role="tabpanel"` and visibility driven by `active`.
 * Styles live in `src/styles/tabs.css`.
 */

export class PpTabPanel extends Elena(HTMLElement) {
  static tagName = 'pp-tab-panel';

  static props = ['name', 'active'];

  private readonly attrId = ++id;
  private readonly componentId = `pp-tab-panel-${this.attrId}`;

  name = '';
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
    this.id = this.id.length > 0 ? this.id : this.componentId;
    this.setAttribute('role', 'tabpanel');
  }

  updated() {
    this.setAttribute('aria-hidden', this.active ? 'false' : 'true');
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab-panel': PpTabPanel;
  }
}
