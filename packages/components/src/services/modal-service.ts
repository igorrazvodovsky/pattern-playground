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
  /**
   * Whether the surface blocks the page behind it. `true` (default) opens with
   * `showModal()` — top layer, backdrop, focus trap, the rest of the page inert.
   * `false` opens with `show()` — a side peek the actor can drag from and drop
   * onto the page beneath, with no scrim and no scroll lock. Drawers honour this;
   * dialogs are always modal.
   */
  modal?: boolean;
  /**
   * Called when the surface is dismissed by the user (close button, backdrop,
   * or Escape) — i.e. when `pp-modal` dispatches `modal:close`. A programmatic
   * {@link ModalService.closeModal} tears the surface down without dispatching,
   * so this does not fire then, which lets a caller driving the modal from its
   * own state tell a user-close apart from one it initiated itself.
   */
  onClose?: () => void;
  /**
   * React content rendered into the header, just before the close button, so
   * view controls group with it rather than floating over the body. Rendered
   * in its own root and torn down with the modal.
   */
  headerActions?: React.ReactElement;
}

interface ReactModalState {
  root: Root;
  container: HTMLElement;
  ppModal: PPModal;
  /** A second root for the header actions slot, when one was supplied. */
  headerRoot?: Root;
}

/**
 * Surfaces mount on `document.body` and are torn down only when dismissed — a
 * caller that opens one and walks away leaves it in the top layer, where it
 * makes the rest of the page inert. Storybook calls {@link ModalService.closeAll}
 * in its `beforeEach` (`.storybook/preview.ts`) for exactly that reason.
 */
export class ModalService {
  private reactModals = new Map<string, ReactModalState>();
  private modalCounter = 0;

  /**
   * Open a drawer with React content
   */
  openDrawer(content: React.ReactElement, options: ModalOptions = {}): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const { position = 'right', title, className = '', closable = true, modal = true, onClose, headerActions } = options;
    const actionsContainerId = headerActions ? `${modalId}-header-actions` : '';

    // Create PPModal with safe DOM methods
    const ppModal = document.createElement('pp-modal');
    const dialog = createDrawerDOM(modalId, position, className, title, closable, reactContainerId, modal, actionsContainerId);
    ppModal.appendChild(dialog);

    document.body.appendChild(ppModal);

    // Create React root and render content
    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      const wrappedContent = this.wrapReactContent(content);
      root.render(wrappedContent);

      const headerRoot = this.renderHeaderActions(actionsContainerId, headerActions);

      // Store React modal state for cleanup
      this.reactModals.set(modalId, { root, container, ppModal, headerRoot });

      // Set up cleanup listener
      ppModal.addEventListener('modal:close', () => {
        onClose?.();
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
    const { size = 'medium', title, className = '', closable = true, onClose, headerActions } = options;
    const actionsContainerId = headerActions ? `${modalId}-header-actions` : '';

    const ppModal = document.createElement('pp-modal');
    const dialog = createDialogDOM(modalId, size, className, title, closable, reactContainerId, actionsContainerId);
    ppModal.appendChild(dialog);

    document.body.appendChild(ppModal);

    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      const wrappedContent = this.wrapReactContent(content);
      root.render(wrappedContent);

      const headerRoot = this.renderHeaderActions(actionsContainerId, headerActions);

      this.reactModals.set(modalId, { root, container, ppModal, headerRoot });

      ppModal.addEventListener('modal:close', () => {
        onClose?.();
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


  /** Render the header actions slot into its container, if one was built. */
  private renderHeaderActions(
    actionsContainerId: string,
    headerActions?: React.ReactElement
  ): Root | undefined {
    if (!headerActions || !actionsContainerId) return undefined;
    const actionsContainer = document.getElementById(actionsContainerId);
    if (!actionsContainer) return undefined;
    const headerRoot = createRoot(actionsContainer);
    headerRoot.render(this.wrapReactContent(headerActions));
    return headerRoot;
  }

  private cleanupReactModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      reactModal.root.unmount();
      reactModal.headerRoot?.unmount();
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
      if (typeof (ppModal as PPModal).open === 'function') {
        resolve(ppModal as PPModal);
        return;
      }

      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loop

      // Wait for custom element to be defined and initialized
      const checkReady = () => {
        attempts++;
        
        if (typeof (ppModal as PPModal).open === 'function') {
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