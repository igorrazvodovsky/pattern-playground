import { Elena } from '@elenajs/core';
import { PpDropdown } from '../dropdown/dropdown';
import priorityPlus from './p-plus'

/**
 * @summary An implementation of the priority plus navigation pattern.
 * @status draft
 * @since 0.0.1
 *
 * The element renders nothing; the
 * priority-plus engine takes the author's child `<div>` of items and manages
 * the visible/overflow split. Overflowed items are copied into `pp-list-item`s
 * inside a dropdown, so adornments marked `data-slot="prefix"` /
 * `data-slot="suffix"` on an item's children carry their meaning into the
 * overflow menu. Styles live in `src/styles/p-plus.css`.
 */

export class PpPriorityPlus extends Elena(HTMLElement) {
  static tagName = 'pp-p-plus';

  static dependencies = { 'pp-dropdown': PpDropdown }

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
