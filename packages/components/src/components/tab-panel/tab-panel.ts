import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';

let id = 0;

/**
 * @summary Tab panels are used inside tab groups to display tab content.
 * @status draft
 * @since 0.0.1
 *
 * Composite enhancement (rung 2): the element renders nothing and enhances
 * itself with `role="tabpanel"` and visibility driven by `active`.
 * Styles live in `src/styles/tabs.css`.
 */

export class PpTabPanel extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private readonly attrId = ++id;
  private readonly componentId = `pp-tab-panel-${this.attrId}`;

  @property({ reflect: true }) name = '';
  @property({ type: Boolean, reflect: true }) active = false;

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

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('active')) {
      this.setAttribute('aria-hidden', this.active ? 'false' : 'true');
    }
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab-panel': PpTabPanel;
  }
}
