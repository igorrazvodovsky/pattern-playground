/**
 * @summary Organize and display information from a data set.
 * @status draft
 * @since 0.0.1
 */


export class SimpleTable extends HTMLElement {
}

customElements.define('ir-table', SimpleTable);
declare global {
  interface HTMLElementTagNameMap {
    "ir-table": SimpleTable;
  }
}