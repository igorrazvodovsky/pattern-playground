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
   * or Escape) — i.e. when `pp-modal` dispatches `pp-modal-close`. A programmatic
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
  /**
   * Where focus goes when the surface is dismissed. Defaults to whatever held
   * focus when it opened, which is wrong when that element goes away with
   * the surface it sat in (a drawer replaced by a dialog, say).
   */
  returnFocus?: HTMLElement | null;
}

const MODAL_DEFINE_TIMEOUT_MS = 2000;

/** Calls `onCommit` once its tree is in the DOM. */
function Committed({ onCommit }: { onCommit: () => void }) {
  React.useLayoutEffect(onCommit, [onCommit]);
  return null;
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
    const { position = 'right', title, className = '', closable = true, modal = true } = options;
    return this.mount('drawer', content, options, (modalId, contentId, actionsId) =>
      createDrawerDOM(modalId, position, className, title, closable, contentId, modal, actionsId));
  }

  /**
   * Open a dialog with React content
   */
  openDialog(content: React.ReactElement, options: ModalOptions = {}): string {
    const { size = 'medium', title, className = '', closable = true } = options;
    return this.mount('dialog', content, options, (modalId, contentId, actionsId) =>
      createDialogDOM(modalId, size, className, title, closable, contentId, actionsId));
  }

  /**
   * Build a `pp-modal` around the surface `buildDialog` returns, render the
   * React content and header actions into it, and open it once the element is
   * upgraded and the content is in the DOM, so pp-modal can find the content's
   * own focus target.
   */
  private mount(
    kind: 'drawer' | 'dialog',
    content: React.ReactElement,
    { onClose, headerActions, returnFocus }: ModalOptions,
    buildDialog: (modalId: string, contentId: string, actionsId: string) => HTMLDialogElement,
  ): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const actionsContainerId = headerActions ? `${modalId}-header-actions` : '';

    const ppModal = document.createElement('pp-modal');
    ppModal.appendChild(buildDialog(modalId, reactContainerId, actionsContainerId));
    document.body.appendChild(ppModal);

    const { promise: committed, resolve: commit } = Promise.withResolvers<void>();

    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      root.render(React.createElement(
        React.Fragment,
        null,
        this.wrapReactContent(content),
        React.createElement(Committed, { onCommit: commit }),
      ));

      const headerRoot = this.renderHeaderActions(actionsContainerId, headerActions);

      // Store React modal state for cleanup
      this.reactModals.set(modalId, { root, container, ppModal, headerRoot });

      ppModal.addEventListener('pp-modal-close', () => {
        onClose?.();
        this.cleanupReactModal(modalId);
      });
    } else {
      commit();
    }

    // pp-modal registers through register-all; if nothing registered it, or the
    // content never renders, fail and tear down rather than leave a dead
    // surface in <body>.
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('pp-modal is not defined, or its content did not render')), MODAL_DEFINE_TIMEOUT_MS);
    });
    const ready = Promise.all([customElements.whenDefined('pp-modal'), committed]);
    Promise.race([ready, timeout]).then(() => {
      if (!ppModal.isConnected) return;
      if (returnFocus) ppModal.setReturnFocus(returnFocus);
      ppModal.open();
    }).catch((error) => {
      console.error(`Failed to initialize ${kind} modal:`, error);
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
      reactModal.ppModal.remove();
      this.reactModals.delete(modalId);
      // Callers often close from a React effect cleanup, and a root can't be
      // unmounted synchronously while another root is rendering.
      queueMicrotask(() => {
        reactModal.root.unmount();
        reactModal.headerRoot?.unmount();
      });
    }
  }

  private generateModalId(): string {
    return `modal-${Date.now()}-${++this.modalCounter}`;
  }

  private wrapReactContent(content: React.ReactElement): React.ReactElement {
    return React.createElement(
      ModalErrorBoundary,
      {
        onError: (error) => {
          console.error('Modal content error:', error);
          // Could send to error reporting service
        },
        children: content
      }
    );
  }

}

// Export singleton instance
export const modalService = new ModalService();