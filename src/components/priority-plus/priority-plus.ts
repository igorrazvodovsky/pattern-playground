// TODO: Fix!

import { html, LitElement, unsafeCSS } from 'lit';
import type { CSSResultGroup } from 'lit';
import styles from './priority-plus.css?inline';
import { PpDropdown } from '../dropdown/dropdown';
import priorityPlus from './p-plus'

/**
 * @summary An implementation of the priority plus navigation pattern.
 * @status draft
 * @since 0.0.1
 */

export class PpPriorityPlus extends LitElement {
  static styles: CSSResultGroup = [unsafeCSS(styles)]
  static dependencies = { 'pp-dropdown': PpDropdown }

  firstUpdated() {
    priorityPlus(this.querySelector("div"))
  }

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('pp-p-plus', PpPriorityPlus);
declare global {
  interface HTMLElementTagNameMap {
    'pp-p-plus': PpPriorityPlus;
  }
}