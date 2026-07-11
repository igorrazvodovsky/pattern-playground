/**
 * @summary Organize and display information from a data set.
 * @status draft
 * @since 0.0.1
 */


export class SimpleTable extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Scrollable table');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-table": SimpleTable;
  }
}
