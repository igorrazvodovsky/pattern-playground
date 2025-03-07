/**
 * @summary Organize and display information from a data set.
 * @status draft
 * @since 0.0.1
 */


export class SimpleTable extends HTMLElement {
}

customElements.define('pp-table', SimpleTable);
declare global {
  interface HTMLElementTagNameMap {
    "pp-table": SimpleTable;
  }
}