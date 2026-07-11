import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-panel.css?inline';
import { watch } from '../../utility/watch';

let id = 0;

/**
 * @summary Tab panels are used inside tab groups to display tab content.
 * @status draft
 * @since 0.0.1
 */

export class PpTabPanel extends LitElement {
  static styles = unsafeCSS(styles);

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

  @watch('active')
  handleActiveChange() {
    this.setAttribute('aria-hidden', this.active ? 'false' : 'true');
  }

  render() {
    return html`
      <slot
        part="base"
        class=${classMap({
      'tab-panel': true,
      'tab-panel--active': this.active
    })}
      ></slot>
    `;
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab-panel': PpTabPanel;
  }
}