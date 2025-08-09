import type { BaseItem, InteractionMode, ViewScope } from './types';

/**
 * Base class for item view Web Components
 * Eliminates duplication in attribute parsing, adapter events, and common behaviors
 */
export abstract class BaseItemView extends HTMLElement {
  protected item: BaseItem | null = null;
  protected contentType = '';
  protected mode: InteractionMode = 'inspect';
  protected abstract scope: ViewScope;

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.handleEscalate = this.handleEscalate.bind(this);
    this.handleInteraction = this.handleInteraction.bind(this);
  }

  static get observedAttributes() {
    return ['content-type', 'mode', 'item-data'];
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.handleAttributeChange(name, newValue);
      this.render();
    }
  }

  protected init() {
    this.parseAttributes();
    this.render();
    this.setupEventListeners();
  }

  protected parseAttributes() {
    this.contentType = this.getAttribute('content-type') || '';
    this.mode = (this.getAttribute('mode') as InteractionMode) || 'inspect';
    
    const itemData = this.getAttribute('item-data');
    if (itemData) {
      try {
        this.item = JSON.parse(itemData);
      } catch (e) {
        console.warn('Invalid item-data JSON:', itemData);
      }
    }
  }

  protected handleAttributeChange(name: string, newValue: string) {
    switch (name) {
      case 'content-type':
        this.contentType = newValue;
        break;
      case 'mode':
        this.mode = newValue as InteractionMode;
        break;
      case 'item-data':
        try {
          this.item = JSON.parse(newValue);
        } catch (e) {
          console.warn('Invalid item-data JSON:', newValue);
        }
        break;
    }
  }

  protected render() {
    if (!this.item) return;

    // Check if there's a content adapter slot
    const adapterSlot = this.querySelector('[slot="adapter"]');
    if (adapterSlot) {
      this.applyAdapterStyling();
      return;
    }

    // Try to get custom adapter content
    if (this.tryAdapterContent()) {
      return;
    }

    // Render default content
    this.renderDefault();
  }

  protected tryAdapterContent(): boolean {
    const adapterEvent = new CustomEvent('pp-item-needs-adapter', {
      detail: {
        element: this,
        item: this.item,
        scope: this.scope,
        contentType: this.contentType
      },
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(adapterEvent);
    
    // If content was replaced by adapter, don't render default
    if (this.innerHTML.trim()) {
      this.applyAdapterStyling();
      return true;
    }
    
    return false;
  }

  protected applyAdapterStyling() {
    this.className = `item-${this.scope}-adapter`;
    this.setAttribute('data-content-type', this.contentType);
  }

  protected renderDefault() {
    this.className = this.getDefaultClassName();
    this.setAttribute('data-content-type', this.contentType);
    this.innerHTML = this.getDefaultTemplate();
  }

  protected setupEventListeners() {
    this.addEventListener('click', this.handleClick);
  }

  protected handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const actionButton = target.closest('[data-action]') as HTMLElement;
    
    if (actionButton) {
      e.preventDefault();
      const action = actionButton.getAttribute('data-action');
      const actionTarget = actionButton.getAttribute('data-target');
      
      if (action === 'escalate' && actionTarget) {
        this.handleEscalate(actionTarget);
      } else if (action === 'interaction') {
        const mode = actionButton.getAttribute('data-mode') as InteractionMode || 'edit';
        this.handleInteraction(mode);
      }
    }
  };

  protected handleEscalate(targetScope: string) {
    this.$emit('escalate', { targetScope });
  }

  protected handleInteraction(mode: InteractionMode) {
    this.$emit('interaction', { mode, item: this.item });
  }

  protected cleanup() {
    this.removeEventListener('click', this.handleClick);
  }

  protected $emit(eventName: string, detail: any) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  protected generateMetadataTemplate(maxItems = 10): string {
    if (!this.item?.metadata) return '';

    const entries = Object.entries(this.item.metadata).slice(0, maxItems);
    const items = entries.map(([key, value]) => `
      <div>
        <dt><strong>${key}${this.scope === 'mini' ? ':' : ''}</strong></dt>
        <dd>
          ${typeof value === 'object' && value !== null && this.scope === 'maxi'
            ? `<pre>${JSON.stringify(value, null, 2)}</pre>`
            : String(value)
          }
        </dd>
      </div>
    `).join('');

    return `
      <dl>
        ${items}
      </dl>
    `;
  }

  // Public API
  setItem(item: BaseItem) {
    this.item = item;
    this.setAttribute('item-data', JSON.stringify(item));
  }

  getItem(): BaseItem | null {
    return this.item;
  }

  // Abstract methods for subclasses
  protected abstract getDefaultClassName(): string;
  protected abstract getDefaultTemplate(): string;
}