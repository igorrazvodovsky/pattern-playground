import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { BaseItem, ViewScope } from '../types';
import { createModalContent, getSizeForScope, getPlacementForScope } from './modal-service-integration';

/**
 * Service for opening items in modal views
 * Integrates the item-view system with the modal component
 */
export class ItemViewModalService {
  private currentModal: HTMLElement | null = null;
  private reactRoot: Root | null = null;

  /**
   * Opens an item in a modal using the item-view system
   */
  async openItem(
    item: BaseItem,
    scope: ViewScope = 'mid',
    options: {
      size?: 'small' | 'medium' | 'large' | 'fullscreen';
      placement?: 'center' | 'drawer-right' | 'drawer-left';
      title?: string;
    } = {}
  ): Promise<void> {
    try {
      // Create modal element
      const modal = this.createModalElement(item, scope, options);
      
      // Add to DOM
      document.body.appendChild(modal);
      
      // Store reference
      this.currentModal = modal;
      
      // Open the modal
      const ppModal = modal.querySelector('pp-modal') as any;
      if (ppModal && typeof ppModal.open === 'function') {
        ppModal.open();
      }

      // Set up cleanup on close
      modal.addEventListener('modal:close', () => {
        this.cleanup();
      });

    } catch (error) {
      console.error('Failed to open item in modal:', error);
      throw error;
    }
  }

  /**
   * Closes the current modal if one is open
   */
  closeCurrentModal(): void {
    if (this.currentModal) {
      const ppModal = this.currentModal.querySelector('pp-modal') as any;
      if (ppModal && typeof ppModal.close === 'function') {
        ppModal.close();
      }
    }
  }

  /**
   * Creates the modal DOM structure with item-view content
   */
  private createModalElement(
    item: BaseItem,
    scope: ViewScope,
    options: {
      size?: 'small' | 'medium' | 'large' | 'fullscreen';
      placement?: 'center' | 'drawer-right' | 'drawer-left';
      title?: string;
    }
  ): HTMLElement {
    const size = options.size || getSizeForScope(scope);
    const placement = options.placement || getPlacementForScope(scope);
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'item-view-modal-container';
    
    const modalHtml = `
      <pp-modal>
        <dialog class="item-view-modal item-view-modal--${size} item-view-modal--${placement}">
          <header class="item-view-modal__header">
            <h2 class="item-view-modal__title">
              <iconify-icon icon="${item.icon}" class="item-view-modal__title-icon"></iconify-icon>
              ${options.title || item.name || 'Item Details'}
            </h2>
            <button 
              type="button" 
              class="item-view-modal__close button button--small button--plain"
              data-close
              aria-label="Close"
            >
              <iconify-icon icon="ph:x"></iconify-icon>
            </button>
          </header>
          
          <div class="item-view-modal__content">
            <div id="item-view-content-${item.id}"></div>
          </div>
        </dialog>
      </pp-modal>
    `;
    
    modalContainer.innerHTML = modalHtml;
    
    // Render React content into the content div
    this.renderItemViewContent(modalContainer, item, scope);
    
    return modalContainer;
  }

  /**
   * Renders the item-view React component into the modal using React DOM
   */
  private async renderItemViewContent(
    modalContainer: HTMLElement,
    item: BaseItem,
    scope: ViewScope
  ): Promise<void> {
    const contentDiv = modalContainer.querySelector(`#item-view-content-${item.id}`);
    if (!contentDiv) {
      throw new Error('Content div not found');
    }

    try {
      // Clean up existing React root if present
      if (this.reactRoot) {
        this.reactRoot.unmount();
        this.reactRoot = null;
      }

      // Create the React component for the item
      const itemViewComponent = createModalContent(item, item.type, scope);
      
      // Create React root and render
      this.reactRoot = createRoot(contentDiv);
      this.reactRoot.render(itemViewComponent as React.ReactElement);
      
      console.log(`✅ Successfully rendered React item-view for ${item.type}:${item.id} at scope ${scope}`);
      console.log('✅ Quote comments should now be visible in the modal with proper React context');
    } catch (error) {
      console.error('Failed to render item-view content:', error);
      
      // Fallback to basic HTML if React rendering fails
      const fallbackContent = this.createFallbackHtml(item, scope, error as Error);
      contentDiv.innerHTML = fallbackContent;
    }
  }

  /**
   * Creates fallback HTML when React rendering fails
   */
  private createFallbackHtml(item: BaseItem, scope: ViewScope, error: Error): string {
    return `
      <div class="item-view-fallback">
        <div class="item-view-fallback__error">
          <iconify-icon icon="ph:warning" class="item-view-fallback__error-icon"></iconify-icon>
          <h3>Rendering Error</h3>
          <p>Failed to render React component for ${item.type}</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message}</pre>
          </details>
        </div>
        
        <div class="item-view-fallback__content">
          <div class="item-view-fallback__header">
            <iconify-icon icon="${item.icon}"></iconify-icon>
            <h3>${item.name}</h3>
          </div>
          <div class="item-view-fallback__details">
            <p><strong>Type:</strong> ${item.type}</p>
            <p><strong>Description:</strong> ${item.description || 'No description'}</p>
            <p><strong>Scope:</strong> ${scope}</p>
            <p><strong>ID:</strong> ${item.id}</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Cleans up the current modal
   */
  private cleanup(): void {
    // Clean up React root
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    
    if (this.currentModal) {
      // Remove from DOM
      this.currentModal.remove();
      this.currentModal = null;
    }
  }
}

// Create singleton instance
export const itemViewModalService = new ItemViewModalService();

/**
 * Convenience function for opening items in modals
 */
export const openItemInModal = (
  item: BaseItem,
  scope: ViewScope = 'mid',
  options?: {
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    placement?: 'center' | 'drawer-right' | 'drawer-left';
    title?: string;
  }
) => {
  return itemViewModalService.openItem(item, scope, options);
};