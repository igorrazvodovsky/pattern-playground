import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Progressive enhancement modal component
 * Enhances a child <dialog> with trigger, close, focus, and backdrop behaviour
 */
export class PPModal extends HTMLElement {
  private modal: HTMLDialogElement | null = null;
  private triggers: HTMLElement[] = [];
  private lastFocusedElement: HTMLElement | null = null;
  // Set by closeModal, so the native close event it causes is not handled twice.
  private closingHere = false;
  private reactRoot: Root | null = null;
  private reactContainer: HTMLElement | null = null;

  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleDialogClick = this.handleDialogClick.bind(this);
    this.handleNativeClose = this.handleNativeClose.bind(this);
  }

  connectedCallback() {
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  disconnectedCallback() {
    this.cleanup();
  }

  private init() {
    this.findModalElement();
    this.findTriggerElements();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  private findModalElement() {
    this.modal = this.querySelector('dialog');
  }

  // Buttons inside the dialog are never triggers, or a dialog with actions
  // would reopen itself on every click.
  private findTriggerElements() {
    const triggers = this.querySelectorAll<HTMLElement>('button:not([data-close]), [data-trigger]');
    this.triggers = Array.from(triggers).filter(el => !this.modal?.contains(el) || el.hasAttribute('data-trigger'));
  }

  private setupEventListeners() {
    // Trigger buttons
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', this.handleTriggerClick);
    });

    // Keyboard events
    document.addEventListener('keydown', this.handleKeydown);

    // Close buttons, backdrop clicks, and closes the browser makes itself
    if (this.modal) {
      this.modal.addEventListener('click', this.handleDialogClick);
      this.modal.addEventListener('close', this.handleNativeClose);
    }
  }

  private setupAccessibility() {
    if (!this.modal) return;

    // Set up ARIA attributes
    const modalId = this.modal.id || `modal-${Math.random().toString(36).substr(2, 9)}`;
    this.modal.id = modalId;

    // Connect triggers to modal
    this.triggers.forEach(trigger => {
      trigger.setAttribute('aria-controls', modalId);
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  private handleTriggerClick(event: Event) {
    event.preventDefault();
    this.lastFocusedElement = event.target as HTMLElement;
    this.openModal();
  }

  // Matched at click time so content rendered into the dialog later can carry
  // its own close buttons.
  private handleDialogClick(event: MouseEvent) {
    if (!this.modal) return;
    const button = (event.target as Element).closest('button');
    if (button && this.modal.contains(button)) {
      if (button.matches('[data-close]')) {
        event.preventDefault();
        this.closeModal();
      }
      return;
    }
    this.handleBackdropClick(event);
  }

  private handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'Escape':
        // An Escape a widget on the page has already handled was meant for it.
        if (event.defaultPrevented) break;
        event.preventDefault();
        if (this.closedBy !== 'none') this.closeModal();
        break;
      case 'Tab':
        // A non-modal side peek leaves the page reachable — don't trap.
        if (this.isModal) this.trapFocus(event);
        break;
    }
  }

  private handleBackdropClick(event: MouseEvent) {
    if (!this.modal || event.target !== this.modal) return;
    if (this.closedBy !== 'any') return;
    
    // Check if click is on backdrop (outside modal content)
    const rect = this.modal.getBoundingClientRect();
    const isOutside = (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
    
    if (isOutside) {
      this.closeModal();
    }
  }

  private get closedBy(): 'any' | 'closerequest' | 'none' {
    const value = this.modal?.getAttribute('closedby');
    return value === 'closerequest' || value === 'none' ? value : 'any';
  }

  /**
   * A drawer opened with `data-modal="false"` is a non-blocking side peek:
   * `show()` instead of `showModal()`, no focus trap, no scroll lock.
   */
  private get isModal(): boolean {
    return !this.modal || this.modal.dataset.modal !== 'false';
  }

  private openModal() {
    if (!this.modal) return;

    // Remember where focus was so closing can put it back. A trigger inside
    // this element has already been recorded by handleTriggerClick; an
    // `open()` driven from outside (the modal service, opening from a button
    // that lives in the page rather than in the surface) has no trigger, so
    // fall back to whatever held focus at the moment of opening.
    if (!this.lastFocusedElement) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body) {
        this.lastFocusedElement = active;
      }
    }

    // A close event that never arrived (the element left the page mid-close)
    // must not swallow the next one.
    this.closingHere = false;

    if (this.isModal) {
      this.modal.showModal();
    } else {
      this.modal.show();
    }

    // Update trigger states
    this.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'true');
    });

    // Focus management
    this.focusModal();

    // Emit custom event
    this.dispatchEvent(new CustomEvent('pp-modal-open', {
      bubbles: true,
      composed: true,
      detail: { modal: this.modal }
    }));
  }

  private closeModal() {
    // With closedby="any" the browser may already have closed the dialog for
    // this click, and handled that close.
    if (!this.modal?.open) return;

    // Emit close event before cleanup (for service to listen)
    this.dispatchClose();
    this.closingHere = true;
    this.modal.close();
    this.finishClose();
  }

  // The browser, or a caller's own dialog.close(), can close the dialog
  // without going through closeModal.
  private handleNativeClose() {
    if (this.closingHere) {
      this.closingHere = false;
      return;
    }
    // The close event is queued, so the dialog may have been reopened in the
    // same task; that close has already been handled.
    if (this.modal?.open) return;
    this.dispatchClose();
    this.finishClose();
  }

  private dispatchClose() {
    this.dispatchEvent(new CustomEvent('pp-modal-close', {
      bubbles: true,
      composed: true,
      detail: { modal: this.modal }
    }));
  }

  private finishClose() {
    // Update trigger states
    this.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Restore focus, then forget: a surface reopened later should return to
    // wherever focus is then, not to a trigger from a previous session that
    // may no longer be in the document.
    if (this.lastFocusedElement?.isConnected) {
      this.lastFocusedElement.focus();
    }
    this.lastFocusedElement = null;
  }

  private isOpen(): boolean {
    return this.modal?.open ?? false;
  }

  private focusModal() {
    if (!this.modal) return;

    // data-autofocus is for frameworks that will not render autofocus.
    const marked = this.modal.querySelector<HTMLElement>('[autofocus], [data-autofocus]');
    if (marked) {
      marked.focus();
      return;
    }

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else {
      this.modal.focus();
    }
  }

  private trapFocus(event: KeyboardEvent) {
    if (!this.modal) return;

    const focusableElements = Array.from(this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )) as HTMLElement[];

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  // For a caller whose opener is not the focused element, such as a surface
  // replacing another. Call before opening.
  public setReturnFocus(element: HTMLElement): void {
    this.lastFocusedElement = element;
  }

  /**
   * Set React content in the modal
   * @param reactElement React element to render
   * @param containerId Optional specific container ID
   */
  public setReactContent(reactElement: React.ReactElement, containerId?: string): void {
    if (typeof window === 'undefined' || !window.React) {
      console.warn('React is not available');
      return;
    }

    // Find or create container
    this.reactContainer = containerId ? 
      this.querySelector(`#${containerId}`) as HTMLElement :
      this.findReactContainer();

    if (!this.reactContainer) {
      console.warn('No suitable container found for React content');
      return;
    }

    // Clean up existing React root
    this.cleanupReactContent();

    // Create new React root and render
    this.reactRoot = createRoot(this.reactContainer);
    this.reactRoot.render(reactElement);
  }

  /**
   * Update React content without recreating the root
   */
  public updateReactContent(reactElement: React.ReactElement): void {
    if (this.reactRoot && this.reactContainer) {
      this.reactRoot.render(reactElement);
    } else {
      this.setReactContent(reactElement);
    }
  }

  /**
   * Clean up React content
   */
  public cleanupReactContent(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    this.reactContainer = null;
  }

  private findReactContainer(): HTMLElement | null {
    // Look for common content containers
    return this.querySelector('.drawer__content') ||
           this.querySelector('.dialog__content') ||
           this.querySelector('.modal__content') ||
           this.querySelector('.react-modal-content');
  }

  private cleanup() {
    this.cleanupReactContent();
    
    // Remove all event listeners
    this.triggers.forEach(trigger => {
      trigger.removeEventListener('click', this.handleTriggerClick);
    });

    document.removeEventListener('keydown', this.handleKeydown);

    if (this.modal) {
      this.modal.removeEventListener('click', this.handleDialogClick);
      this.modal.removeEventListener('close', this.handleNativeClose);
    }
  }

  // Public API methods
  public open() {
    this.openModal();
  }

  public close() {
    this.closeModal();
  }

  public toggle() {
    if (this.isOpen()) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-modal": PPModal;
  }
}