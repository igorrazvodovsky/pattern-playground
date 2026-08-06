import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { PropertyValues } from 'lit';

let id = 0;

/**
 * @summary Tabs are used inside tab groups to represent and activate tab panels.
 * @status draft
 * @since 0.0.1
 *
 * Composite enhancement (rung 2): the element itself is the tab — it renders
 * nothing and enhances itself with `role="tab"`, focusability, and
 * `aria-selected`. Compose the label as text, with optional
 * `data-slot="icon"` (place it first) and `data-slot="subtitle"` children.
 * Styles live in `src/styles/tabs.css`.
 */

export class PpTab extends LitElement {
  protected createRenderRoot() {
    return this;
  }

  private readonly attrId = ++id;
  private readonly componentId = `tab-${this.attrId}`;

  @property({ reflect: true }) panel = '';
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
    this.setAttribute('role', 'tab');
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    this.id = this.id.length > 0 ? this.id : this.componentId;
  }

  protected updated(changed: PropertyValues<this>) {
    if (changed.has('active')) {
      this.setAttribute('aria-selected', this.active ? 'true' : 'false');
    }
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab': PpTab;
  }
}
