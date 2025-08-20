import React from 'react';
import type { BaseItem, ViewScope } from '../types';
import { createModalContent, getSizeForScope, getPlacementForScope } from './modal-service-integration';
import { modalService } from '../../../services/modal-service';

/**
 * Service for opening items in modal views using the enhanced modal system
 */
export class ItemViewModalService {
  private openModals = new Map<string, string>(); // item.id -> modalId

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
      // Close existing modal for this item if open
      this.closeItem(item.id);

      // Create the React content for the item
      const itemViewComponent = createModalContent(item, item.type, scope);
      
      const size = options.size || getSizeForScope(scope);
      const placement = options.placement || getPlacementForScope(scope);
      
      // Convert placement to our modal service format
      const modalOptions = {
        title: options.title || item.name || 'Item Details',
        className: `item-view-modal item-view-modal--${size}`,
        ...(placement === 'drawer-right' && { position: 'right' as const }),
        ...(placement === 'drawer-left' && { position: 'left' as const }),
        ...(size && ['small', 'medium', 'large'].includes(size) && { size: size as any })
      };

      // Open using the enhanced modal service
      let modalId: string;
      if (placement === 'drawer-right' || placement === 'drawer-left') {
        modalId = modalService.openDrawer(itemViewComponent as React.ReactElement, modalOptions);
      } else {
        modalId = modalService.openDialog(itemViewComponent as React.ReactElement, modalOptions);
      }

      // Store the modal ID for this item
      this.openModals.set(item.id, modalId);

      console.log(`✅ Successfully opened React item-view for ${item.type}:${item.id} at scope ${scope}`);
    } catch (error) {
      console.error('Failed to open item in modal:', error);
      throw error;
    }
  }

  /**
   * Closes the modal for a specific item
   */
  closeItem(itemId: string): void {
    const modalId = this.openModals.get(itemId);
    if (modalId) {
      modalService.closeModal(modalId);
      this.openModals.delete(itemId);
    }
  }

  /**
   * Closes the current modal if one is open
   */
  closeCurrentModal(): void {
    modalService.closeAll();
    this.openModals.clear();
  }

  /**
   * Check if an item has an open modal
   */
  isItemOpen(itemId: string): boolean {
    return this.openModals.has(itemId);
  }

  /**
   * Get all currently open item IDs
   */
  getOpenItems(): string[] {
    return Array.from(this.openModals.keys());
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