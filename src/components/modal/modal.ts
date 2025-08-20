import React from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Progressive enhancement modal component
 * Enhances existing dialog or div elements with modal behavior
 */
export class PPModal extends HTMLElement {
  private modal: HTMLDialogElement | HTMLElement | null = null;
  private triggers: HTMLElement[] = [];
  private closeButtons: HTMLElement[] = [];
  private lastFocusedElement: HTMLElement | null = null;
  private isDialogElement = false;
  private reactRoot: Root | null = null;
  private reactContainer: HTMLElement | null = null;

  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
  }

  connectedCallback() {
    this.init();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  private init() {
    this.findModalElement();
    this.findTriggerElements();
    this.findCloseElements();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  private findModalElement() {
    // Look for dialog first, then any element with modal-like classes
    this.modal = this.querySelector('dialog') || 
                 this.querySelector('.drawer') ||
                 this.querySelector('.modal') ||
                 this.querySelector('[role="dialog"]');
    
    if (this.modal) {
      this.isDialogElement = this.modal.tagName === 'DIALOG';
    }
  }

  private findTriggerElements() {
    // Find buttons that should open the modal
    this.triggers = Array.from(this.querySelectorAll('button:not([data-close])'));
    
    // Also look for elements with data-trigger attribute
    const dataTriggers = Array.from(this.querySelectorAll('[data-trigger]'));
    this.triggers.push(...dataTriggers);
  }

  private findCloseElements() {
    // Find close buttons within the modal
    if (this.modal) {
      this.closeButtons = Array.from(this.modal.querySelectorAll('button[data-close], .close-button'));
      
      // If no explicit close buttons found, look for buttons in header
      if (this.closeButtons.length === 0) {
        const headerButtons = Array.from(this.modal.querySelectorAll('header button'));
        this.closeButtons.push(...headerButtons);
      }
    }
  }

  private setupEventListeners() {
    // Trigger buttons
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', this.handleTriggerClick);
    });

    // Close buttons
    this.closeButtons.forEach(button => {
      button.addEventListener('click', this.handleCloseClick);
    });

    // Keyboard events
    document.addEventListener('keydown', this.handleKeydown);

    // Backdrop clicks for dialog elements
    if (this.modal && this.isDialogElement) {
      this.modal.addEventListener('click', this.handleBackdropClick);
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

    // Ensure modal has proper role if not a dialog
    if (!this.isDialogElement) {
      this.modal.setAttribute('role', 'dialog');
      this.modal.setAttribute('aria-modal', 'true');
    }
  }

  private handleTriggerClick(event: Event) {
    event.preventDefault();
    this.lastFocusedElement = event.target as HTMLElement;
    this.openModal();
  }

  private handleCloseClick(event: Event) {
    event.preventDefault();
    this.closeModal();
  }

  private handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen()) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeModal();
        break;
      case 'Tab':
        this.trapFocus(event);
        break;
    }
  }

  private handleBackdropClick(event: MouseEvent) {
    if (!this.modal || event.target !== this.modal) return;
    
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

  private openModal() {
    if (!this.modal) return;

    if (this.isDialogElement) {
      (this.modal as HTMLDialogElement).showModal();
    } else {
      this.modal.style.display = 'block';
      this.modal.setAttribute('aria-hidden', 'false');
    }

    // Update trigger states
    this.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'true');
    });

    // Focus management
    this.focusModal();

    // Emit custom event
    this.dispatchEvent(new CustomEvent('modal:open', {
      bubbles: true,
      detail: { modal: this.modal }
    }));
  }

  private closeModal() {
    if (!this.modal) return;

    // Emit close event before cleanup (for service to listen)
    this.dispatchEvent(new CustomEvent('modal:close', {
      bubbles: true,
      detail: { modal: this.modal }
    }));

    if (this.isDialogElement) {
      (this.modal as HTMLDialogElement).close();
    } else {
      this.modal.style.display = 'none';
      this.modal.setAttribute('aria-hidden', 'true');
    }

    // Update trigger states
    this.triggers.forEach(trigger => {
      trigger.setAttribute('aria-expanded', 'false');
    });

    // Restore focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  }

  private isOpen(): boolean {
    if (!this.modal) return false;
    
    if (this.isDialogElement) {
      return (this.modal as HTMLDialogElement).open;
    } else {
      return this.modal.style.display !== 'none' && 
             this.modal.getAttribute('aria-hidden') !== 'true';
    }
  }

  private focusModal() {
    if (!this.modal) return;

    // Try to focus the first focusable element or the modal itself
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

    this.closeButtons.forEach(button => {
      button.removeEventListener('click', this.handleCloseClick);
    });

    document.removeEventListener('keydown', this.handleKeydown);

    if (this.modal && this.isDialogElement) {
      this.modal.removeEventListener('click', this.handleBackdropClick);
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

// Register the custom element
if (!customElements.get('pp-modal')) {
  customElements.define('pp-modal', PPModal);
}

declare global {
  interface HTMLElementTagNameMap {
    "pp-modal": PPModal;
  }
}