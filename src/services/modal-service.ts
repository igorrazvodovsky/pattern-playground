import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { PPModal } from '../components/modal/modal';
import { ModalErrorBoundary } from '../components/modal/ModalErrorBoundary';
import { createDrawerDOM, createDialogDOM } from '../components/modal/modal-dom';

export type ModalPosition = 'left' | 'right';
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalOptions {
  position?: ModalPosition;
  size?: ModalSize;
  title?: string;
  className?: string;
  closable?: boolean;
}

interface ReactModalState {
  root: Root;
  container: HTMLElement;
  ppModal: PPModal;
}

export class ModalService {
  private reactModals = new Map<string, ReactModalState>();
  private modalCounter = 0;

  /**
   * Open a drawer with React content
   */
  openDrawer(content: React.ReactElement, options: ModalOptions = {}): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const { position = 'right', title, className = '', closable = true } = options;

    // Create PPModal with safe DOM methods
    const ppModal = document.createElement('pp-modal');
    const dialog = createDrawerDOM(modalId, position, className, title, closable, reactContainerId);
    ppModal.appendChild(dialog);

    document.body.appendChild(ppModal);

    // Create React root and render content
    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      const wrappedContent = this.wrapReactContent(content);
      root.render(wrappedContent);

      // Store React modal state for cleanup
      this.reactModals.set(modalId, { root, container, ppModal });

      // Set up cleanup listener
      ppModal.addEventListener('modal:close', () => {
        this.cleanupReactModal(modalId);
      });
    }

    // Auto-open after DOM insertion and custom element initialization
    this.waitForElementReady(ppModal).then((modal) => {
      modal.open();
    }).catch((error) => {
      console.error('Failed to initialize drawer modal:', error);
      // Cleanup on failure
      ppModal.remove();
      this.cleanupReactModal(modalId);
    });

    return modalId;
  }

  /**
   * Open a dialog with React content
   */
  openDialog(content: React.ReactElement, options: ModalOptions = {}): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const { size = 'medium', title, className = '', closable = true } = options;

    const ppModal = document.createElement('pp-modal');
    const dialog = createDialogDOM(modalId, size, className, title, closable, reactContainerId);
    ppModal.appendChild(dialog);

    document.body.appendChild(ppModal);

    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      const wrappedContent = this.wrapReactContent(content);
      root.render(wrappedContent);

      this.reactModals.set(modalId, { root, container, ppModal });

      ppModal.addEventListener('modal:close', () => {
        this.cleanupReactModal(modalId);
      });
    }

    this.waitForElementReady(ppModal).then((modal) => {
      modal.open();
    }).catch((error) => {
      console.error('Failed to initialize dialog modal:', error);
      // Cleanup on failure
      ppModal.remove();
      this.cleanupReactModal(modalId);
    });

    return modalId;
  }

  /**
   * Close specific modal by ID
   */
  closeModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      this.cleanupReactModal(modalId);
    }
  }

  /**
   * Close all open modals
   */
  closeAll(): void {
    // Close all React modals
    for (const modalId of this.reactModals.keys()) {
      this.cleanupReactModal(modalId);
    }

    // Close any remaining HTML modals
    const allModals = document.querySelectorAll('pp-modal');
    allModals.forEach(modal => (modal as PPModal).close());
  }


  private cleanupReactModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      reactModal.root.unmount();
      reactModal.ppModal.remove();
      this.reactModals.delete(modalId);
    }
  }

  private generateModalId(): string {
    return `modal-${Date.now()}-${++this.modalCounter}`;
  }

  private waitForElementReady(ppModal: HTMLElement): Promise<PPModal> {
    return new Promise((resolve, reject) => {
      // Check if the element already has the open method
      if (typeof (ppModal as any).open === 'function') {
        resolve(ppModal as PPModal);
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loop

      // Wait for custom element to be defined and initialized
      const checkReady = () => {
        attempts++;
        
        if (typeof (ppModal as any).open === 'function') {
          resolve(ppModal as PPModal);
        } else if (attempts >= maxAttempts) {
          const error = new Error(`pp-modal failed to initialize after ${maxAttempts} attempts`);
          console.error(error);
          reject(error);
        } else {
          requestAnimationFrame(checkReady);
        }
      };

      requestAnimationFrame(checkReady);
    });
  }

  private wrapReactContent(content: React.ReactElement): React.ReactElement {
    return React.createElement(
      ModalErrorBoundary,
      {
        onError: (error) => {
          console.error('Modal content error:', error);
          // Could send to error reporting service
        }
      },
      content
    );
  }

}

// Export singleton instance
export const modalService = new ModalService();