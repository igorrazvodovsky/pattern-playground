import { classMap } from 'lit/directives/class-map.js';
import { LitElement, html, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import styles from './tab.css?inline';
import { customElement } from 'lit/decorators.js';

let id = 0;

/**
 * @summary Tabs are used inside tab groups to represent and activate tab panels.
 * @status draft
 * @since 0.0.1
 */

export class PpTab extends LitElement {
  static styles = unsafeCSS(styles);

  private readonly attrId = ++id;
  private readonly componentId = `tab-${this.attrId}`;

  @query('.tab') tab: HTMLElement;

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
  }

  handleActiveChange() {
    this.setAttribute('aria-selected', this.active ? 'true' : 'false');
  }

  focus(options?: FocusOptions) {
    this.tab.focus(options);
  }

  blur() {
    this.tab.blur();
  }

  render() {
    this.id = this.id.length > 0 ? this.id : this.componentId;

    return html`
      <div
        part="base"
        class=${classMap({
      tab: true,
      'tab--active': this.active,
    })}
        tabindex="0"}
      >
        <slot name="icon"></slot>
        <span part="label"><slot></slot></span>
        <span part="subtitle"><slot name="subtitle"></slot></span>
      </div>
    `;
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-tab': PpTab;
  }
}