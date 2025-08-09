import type { ViewScope } from './types';
import { BaseItemView } from './base-item-view';

/**
 * Progressive enhancement item full view component  
 * Renders maxi scope view for full pages and workspaces
 */
export class PPItemFullView extends BaseItemView {
  protected scope: ViewScope = 'maxi';

  protected getDefaultClassName(): string {
    return 'layer flow';
  }

  protected getDefaultTemplate(): string {
    if (!this.item) return '';

    const hasMetadata = this.item.metadata && Object.keys(this.item.metadata).length > 0;
    
    return `
      <header class="inline-flow">
        <div>
          <h1>${this.item.label}</h1>
          <div class="inline-flow">
            <span>${this.item.type}</span>
            <span>#${this.item.id}</span>
          </div>
        </div>
        
        <div class="inline-flow">
          <button class="button" data-action="interaction" data-mode="edit" type="button">
            Edit
          </button>
          <button class="button" data-action="interaction" data-mode="transform" type="button">
            Transform
          </button>
        </div>
      </header>

      <main class="flow">
        <section>
          <h2>Overview</h2>
          <p>
            This is a ${this.item.type} item with ID ${this.item.id}.
          </p>
        </section>

        ${hasMetadata ? this.getMetadataSection() : ''}
      </main>
    `;
  }

  private getMetadataSection(): string {
    return `
      <section>
        <h2>Properties</h2>
        ${this.generateMetadataTemplate()}
      </section>
    `;
  }
}

customElements.define('pp-item-full-view', PPItemFullView);

declare global {
  interface HTMLElementTagNameMap {
    'pp-item-full-view': PPItemFullView;
  }
}