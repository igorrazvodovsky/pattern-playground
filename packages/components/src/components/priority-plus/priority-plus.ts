import { LitElement } from 'lit';
import { PpDropdown } from '../dropdown/dropdown';
import priorityPlus from './p-plus'

/**
 * @summary An implementation of the priority plus navigation pattern.
 * @status draft
 * @since 0.0.1
 *
 * Composite enhancement (rung 2): the element renders nothing; the
 * priority-plus engine takes the author's child `<div>` of items and manages
 * the visible/overflow split. Styles live in `src/styles/p-plus.css`.
 */

export class PpPriorityPlus extends LitElement {
  static dependencies = { 'pp-dropdown': PpDropdown }

  protected createRenderRoot() {
    return this;
  }

  firstUpdated() {
    const target = this.querySelector("div");
    if (target) priorityPlus(target);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-p-plus': PpPriorityPlus;
  }
}
