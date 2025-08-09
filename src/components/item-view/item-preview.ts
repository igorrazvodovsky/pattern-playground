import type { ViewScope } from './types';
import { BaseItemView } from './base-item-view';

/**
 * Progressive enhancement item preview component
 * Renders mini scope view for hover cards and tooltips
 */
export class PPItemPreview extends BaseItemView {
  protected scope: ViewScope = 'mini';

  constructor() {
    super();
    this.mode = 'preview'; // Override default mode for preview
  }

  protected getDefaultClassName(): string {
    return 'flow popover';
  }

  protected getDefaultTemplate(): string {
    if (!this.item) return '';

    const hasMetadata = this.item.metadata && Object.keys(this.item.metadata).length > 0;

    return `
      <header>
        <h4>${this.item.label}</h4>
        <small>${this.item.type}</small>
      </header>

      ${hasMetadata ? this.generateMetadataTemplate(3) : ''}

      <footer>
        <button class="button" data-action="escalate" data-target="mid" type="button">
          View details
        </button>
      </footer>
    `;
  }
}

customElements.define('pp-item-preview', PPItemPreview);

declare global {
  interface HTMLElementTagNameMap {
    'pp-item-preview': PPItemPreview;
  }
}