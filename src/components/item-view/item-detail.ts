import type { ViewScope } from './types';
import { BaseItemView } from './base-item-view';

/**
 * Progressive enhancement item detail component  
 * Renders mid scope view for drawers and side panels
 */
export class PPItemDetail extends BaseItemView {
  protected scope: ViewScope = 'mid';

  protected getDefaultClassName(): string {
    return 'flow';
  }

  protected getDefaultTemplate(): string {
    if (!this.item) return '';

    const hasMetadata = this.item.metadata && Object.keys(this.item.metadata).length > 0;
    
    return `
      <header class="inline-flow">
        <div>
          <small>${this.item.type}</small>
        </div>
        
        <div class="inline-flow">
          <button class="button" data-action="escalate" data-target="maxi" type="button" title="Open full view">
            ↗ <span class="sr-only">Open full view</span>
          </button>
          <button class="button" data-action="interaction" data-mode="edit" type="button" title="Edit item">
            ✎ <span class="sr-only">Edit item</span>
          </button>
        </div>
      </header>

      <div>
        <div>
          <strong>ID:</strong> ${this.item.id}
        </div>

        ${hasMetadata ? this.getMetadataSection() : ''}
      </div>
    `;
  }

  private getMetadataSection(): string {
    return `
      <div>
        <h3>Properties</h3>
        ${this.generateMetadataTemplate()}
      </div>
    `;
  }
}

customElements.define('pp-item-detail', PPItemDetail);

declare global {
  interface HTMLElementTagNameMap {
    'pp-item-detail': PPItemDetail;
  }
}