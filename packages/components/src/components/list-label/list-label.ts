/**
 * @summary A section heading inside a `pp-list` — a clarifier for options that
 * read as bare values ("Move to" over a list of destinations). A list can carry
 * several, each heading the run of items that follows it.
 * @status draft
 * @since 0.1
 *
 * Renders nothing: the label is its own text, styled from the cascade. The role
 * is presentational because `pp-list` is a `role="menu"`, whose children must be
 * menu items, groups, or separators — a heading among them would be invalid
 * content. `pp-list.getAllItems()` already skips anything that isn't an item, so
 * keyboard navigation steps over it. Assistive tech therefore reads the items
 * flat: keep each item's own text unambiguous rather than leaning on the
 * heading to disambiguate it.
 */
export class PpListLabel extends HTMLElement {
  connectedCallback() {
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  private init() {
    this.setAttribute('role', 'presentation');
  }
}

// Component registration is handled by the centralized registry
declare global {
  interface HTMLElementTagNameMap {
    'pp-list-label': PpListLabel;
  }
}
