# Web Component Modal Enhancement Plan

## Overview

Enhance the existing `PPModal` Web Component and modal service to support React content while maintaining the progressive enhancement architecture and existing API compatibility.

## Current Architecture Strengths

The existing `PPModal` component already provides:
- ✅ Progressive enhancement pattern
- ✅ Native `<dialog>` element support
- ✅ Automatic element detection and enhancement
- ✅ Proper accessibility (ARIA, focus management, keyboard navigation)
- ✅ Event-driven API with custom events
- ✅ Smart auto-wiring of triggers and close buttons
- ✅ Framework-agnostic design

## Proposed Enhancement Strategy

Build upon the existing Web Component to add React content support without breaking existing functionality or architectural patterns.

## Implementation Plan

### Phase 1: Enhanced Modal Service

#### 1.1 Modernize Modal Service

```typescript
// src/services/modal-service.ts

export type ModalContent = string | React.ReactElement;
export type ModalPosition = 'left' | 'right';
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalOptions {
  position?: ModalPosition;
  size?: ModalSize;
  title?: string;
  className?: string;
  closable?: boolean;
  backdrop?: boolean;
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
   * Open a drawer with content (HTML string or React element)
   */
  openDrawer(content: ModalContent, options: ModalOptions = {}): string {
    if (typeof content === 'string') {
      return this.openHtmlDrawer(content, options);
    } else {
      return this.openReactDrawer(content, options);
    }
  }

  /**
   * Open a dialog with content (HTML string or React element)
   */
  openDialog(content: ModalContent, options: ModalOptions = {}): string {
    if (typeof content === 'string') {
      return this.openHtmlDialog(content, options);
    } else {
      return this.openReactDialog(content, options);
    }
  }

  /**
   * Close specific modal by ID
   */
  closeModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      this.cleanupReactModal(modalId);
    } else {
      // Handle HTML modals
      this.closeHtmlModal(modalId);
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

  private openHtmlDrawer(content: string, options: ModalOptions): string {
    const modalId = this.generateModalId();
    const { position = 'right', title, className = '', closable = true } = options;

    const ppModal = document.createElement('pp-modal');
    ppModal.innerHTML = `
      <div class="drawer drawer--${position} ${className}" id="${modalId}">
        ${this.buildModalHeader(title, closable)}
        <div class="drawer__content">
          ${this.escapeHtml(content)}
        </div>
      </div>
    `;

    document.body.appendChild(ppModal);
    
    // Auto-open after DOM insertion
    requestAnimationFrame(() => ppModal.open());

    return modalId;
  }

  private openReactDrawer(content: React.ReactElement, options: ModalOptions): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const { position = 'right', title, className = '', closable = true } = options;

    // Create PPModal with React container
    const ppModal = document.createElement('pp-modal');
    ppModal.innerHTML = `
      <div class="drawer drawer--${position} ${className}" id="${modalId}">
        ${this.buildModalHeader(title, closable)}
        <div class="drawer__content">
          <div id="${reactContainerId}" class="react-modal-content"></div>
        </div>
      </div>
    `;

    document.body.appendChild(ppModal);

    // Create React root and render content
    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      root.render(content);

      // Store React modal state for cleanup
      this.reactModals.set(modalId, { root, container, ppModal });

      // Set up cleanup listener
      ppModal.addEventListener('modal:close', () => {
        this.cleanupReactModal(modalId);
      });
    }

    // Auto-open after DOM insertion
    requestAnimationFrame(() => ppModal.open());

    return modalId;
  }

  private openHtmlDialog(content: string, options: ModalOptions): string {
    const modalId = this.generateModalId();
    const { size = 'medium', title, className = '', closable = true } = options;

    const ppModal = document.createElement('pp-modal');
    ppModal.innerHTML = `
      <dialog class="dialog dialog--${size} ${className}" id="${modalId}">
        ${this.buildModalHeader(title, closable)}
        <div class="dialog__content">
          ${this.escapeHtml(content)}
        </div>
      </dialog>
    `;

    document.body.appendChild(ppModal);
    requestAnimationFrame(() => ppModal.open());

    return modalId;
  }

  private openReactDialog(content: React.ReactElement, options: ModalOptions): string {
    const modalId = this.generateModalId();
    const reactContainerId = `${modalId}-react-content`;
    const { size = 'medium', title, className = '', closable = true } = options;

    const ppModal = document.createElement('pp-modal');
    ppModal.innerHTML = `
      <dialog class="dialog dialog--${size} ${className}" id="${modalId}">
        ${this.buildModalHeader(title, closable)}
        <div class="dialog__content">
          <div id="${reactContainerId}" class="react-modal-content"></div>
        </div>
      </dialog>
    `;

    document.body.appendChild(ppModal);

    const container = document.getElementById(reactContainerId);
    if (container) {
      const root = createRoot(container);
      root.render(content);

      this.reactModals.set(modalId, { root, container, ppModal });

      ppModal.addEventListener('modal:close', () => {
        this.cleanupReactModal(modalId);
      });
    }

    requestAnimationFrame(() => ppModal.open());

    return modalId;
  }

  private buildModalHeader(title?: string, closable: boolean = true): string {
    if (!title && !closable) return '';

    return `
      <header class="modal__header">
        ${title ? `<h2 class="modal__title">${this.escapeHtml(title)}</h2>` : ''}
        ${closable ? '<button class="modal__close" data-close aria-label="Close modal"><iconify-icon icon="ph:x"></iconify-icon></button>' : ''}
      </header>
    `;
  }

  private cleanupReactModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      reactModal.root.unmount();
      reactModal.ppModal.remove();
      this.reactModals.delete(modalId);
    }
  }

  private closeHtmlModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    const ppModal = modal?.closest('pp-modal') as PPModal;
    if (ppModal) {
      ppModal.close();
    }
  }

  private generateModalId(): string {
    return `modal-${Date.now()}-${++this.modalCounter}`;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton instance
export const modalService = new ModalService();
```

### Phase 2: Enhanced PPModal Component

#### 2.1 Add React Support Methods to PPModal

```typescript
// src/components/modal/modal.ts (additions to existing class)

import { createRoot, type Root } from 'react-dom/client';

export class PPModal extends HTMLElement {
  // ... existing properties
  private reactRoot: Root | null = null;
  private reactContainer: HTMLElement | null = null;

  // ... existing methods

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

  // Enhanced cleanup to include React content
  private cleanup() {
    this.cleanupReactContent();
    
    // ... existing cleanup code
  }

  // Enhanced close to trigger React cleanup
  private closeModal() {
    // ... existing close logic

    // Emit close event before cleanup (for service to listen)
    this.dispatchEvent(new CustomEvent('modal:close', {
      bubbles: true,
      detail: { modal: this.modal }
    }));
  }
}
```

### Phase 3: React Integration Hooks

#### 3.1 React Hook for Modal Service

```typescript
// src/hooks/useModalService.ts

import { useCallback, useRef } from 'react';
import { modalService, type ModalOptions } from '../services/modal-service';

export interface UseModalServiceReturn {
  openDrawer: (content: React.ReactNode, options?: ModalOptions) => string;
  openDialog: (content: React.ReactNode, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

export const useModalService = (): UseModalServiceReturn => {
  const openDrawer = useCallback((content: React.ReactNode, options?: ModalOptions) => {
    return modalService.openDrawer(content as React.ReactElement, options);
  }, []);

  const openDialog = useCallback((content: React.ReactNode, options?: ModalOptions) => {
    return modalService.openDialog(content as React.ReactElement, options);
  }, []);

  const closeModal = useCallback((id: string) => {
    modalService.closeModal(id);
  }, []);

  const closeAll = useCallback(() => {
    modalService.closeAll();
  }, []);

  return {
    openDrawer,
    openDialog,
    closeModal,
    closeAll
  };
};
```

#### 3.2 Imperative Modal Hook

```typescript
// src/hooks/useImperativeModal.ts

import { useCallback, useRef } from 'react';
import { useModalService } from './useModalService';
import type { ModalOptions } from '../services/modal-service';

export interface ImperativeModalRef {
  open: (content: React.ReactNode, options?: ModalOptions) => void;
  close: () => void;
  update: (content: React.ReactNode) => void;
}

export const useImperativeModal = (type: 'drawer' | 'dialog' = 'drawer') => {
  const { openDrawer, openDialog, closeModal } = useModalService();
  const currentModalId = useRef<string | null>(null);
  const currentPPModal = useRef<PPModal | null>(null);

  const open = useCallback((content: React.ReactNode, options?: ModalOptions) => {
    // Close existing modal if open
    if (currentModalId.current) {
      closeModal(currentModalId.current);
    }

    // Open new modal
    const modalId = type === 'drawer' ? 
      openDrawer(content, options) : 
      openDialog(content, options);

    currentModalId.current = modalId;

    // Find and store reference to PPModal for updates
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      currentPPModal.current = modalElement?.closest('pp-modal') as PPModal;
    }, 0);
  }, [type, openDrawer, openDialog, closeModal]);

  const close = useCallback(() => {
    if (currentModalId.current) {
      closeModal(currentModalId.current);
      currentModalId.current = null;
      currentPPModal.current = null;
    }
  }, [closeModal]);

  const update = useCallback((content: React.ReactNode) => {
    if (currentPPModal.current && currentModalId.current) {
      currentPPModal.current.updateReactContent(content as React.ReactElement);
    }
  }, []);

  return { open, close, update };
};
```

### Phase 4: Migration and Usage Examples

#### 4.1 Quote Drawer Migration

```typescript
// src/components/quote/QuoteDrawerContent.tsx

import React from 'react';
import { UniversalCommentInterface } from '../commenting/universal/UniversalCommentInterface';
import type { QuoteObject } from '../../services/commenting/quote-service';
import type { User } from '../../stories/data';

interface QuoteDrawerContentProps {
  quote: QuoteObject;
  currentUser: User;
  onClose?: () => void;
}

export const QuoteDrawerContent: React.FC<QuoteDrawerContentProps> = ({
  quote,
  currentUser,
  onClose
}) => {
  return (
    <div className="quote-drawer">
      <section className="quote-drawer__content flow">
        <small className="dimmed">
          From {quote.metadata.sourceDocument}
        </small>
        
        <UniversalCommentInterface
          entityType="quote"
          entityId={quote.id}
          currentUser={currentUser}
          className="quote-comments-drawer"
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </section>
    </div>
  );
};
```

#### 4.2 Updated Quote Integration Hook

```typescript
// src/components/commenting/tiptap/use-tiptap-quote-integration.ts

import { useCallback } from 'react';
import { useModalService } from '../../hooks/useModalService';
import { QuoteDrawerContent } from '../../quote/QuoteDrawerContent';

export const useTiptapQuoteIntegration = () => {
  const { openDrawer } = useModalService();

  const handleQuoteClick = useCallback(async (quoteId: string) => {
    const quote = getQuote(quoteId);
    if (quote) {
      try {
        console.log('Opening quote in drawer:', quote);

        const currentUserObj = getUserById(currentUser) || {
          id: currentUser,
          name: currentUser
        };

        // Clean React component approach using Web Component infrastructure
        const modalId = openDrawer(
          <QuoteDrawerContent 
            quote={quote} 
            currentUser={currentUserObj} 
          />,
          {
            position: 'right',
            title: quote.name,
            className: 'quote-drawer-modal'
          }
        );

        console.log('Quote drawer opened successfully:', modalId);
      } catch (error) {
        console.error('Failed to open quote drawer:', error);
      }
    } else {
      console.warn(`Quote not found: ${quoteId}`);
    }
  }, [openDrawer, getQuote, currentUser]);

  return { handleQuoteClick };
};
```

#### 4.3 Declarative Modal Component (Optional)

```typescript
// src/components/modal/DeclarativeModal.tsx

import React, { useEffect, useRef } from 'react';
import { useModalService } from '../../hooks/useModalService';
import type { ModalOptions } from '../../services/modal-service';

interface DeclarativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'drawer' | 'dialog';
  options?: ModalOptions;
  children: React.ReactNode;
}

export const DeclarativeModal: React.FC<DeclarativeModalProps> = ({
  isOpen,
  onClose,
  type = 'drawer',
  options = {},
  children
}) => {
  const { openDrawer, openDialog, closeModal } = useModalService();
  const modalId = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen && !modalId.current) {
      // Open modal
      const id = type === 'drawer' ? 
        openDrawer(children, options) : 
        openDialog(children, options);
      modalId.current = id;

      // Listen for close events from the Web Component
      const handleModalClose = () => {
        modalId.current = null;
        onClose();
      };

      document.addEventListener('modal:close', handleModalClose);
      return () => document.removeEventListener('modal:close', handleModalClose);
    } else if (!isOpen && modalId.current) {
      // Close modal
      closeModal(modalId.current);
      modalId.current = null;
    }
  }, [isOpen, type, children, options, openDrawer, openDialog, closeModal, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (modalId.current) {
        closeModal(modalId.current);
      }
    };
  }, [closeModal]);

  return null; // This component doesn't render anything itself
};
```

### Phase 5: Error Handling and Testing

#### 5.1 Error Boundary for React Modal Content

```typescript
// src/components/modal/ModalErrorBoundary.tsx

import React from 'react';

interface ModalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error) => void;
}

export class ModalErrorBoundary extends React.Component<
  ModalErrorBoundaryProps,
  ModalErrorBoundaryState
> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ModalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Modal content error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultModalErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultModalErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry
}) => (
  <div className="modal-error">
    <h3>Something went wrong</h3>
    <p className="error-message">{error.message}</p>
    <button onClick={retry} className="button button--primary">
      Try again
    </button>
  </div>
);
```

#### 5.2 Enhanced Modal Service with Error Handling

```typescript
// Add to ModalService class

private wrapReactContent(content: React.ReactElement): React.ReactElement {
  return (
    <ModalErrorBoundary
      onError={(error) => {
        console.error('Modal content error:', error);
        // Could send to error reporting service
      }}
    >
      {content}
    </ModalErrorBoundary>
  );
}

// Update React modal methods to use error boundary
private openReactDrawer(content: React.ReactElement, options: ModalOptions): string {
  // ... existing code
  
  const wrappedContent = this.wrapReactContent(content);
  root.render(wrappedContent);
  
  // ... rest of method
}
```

## Implementation Timeline

### Week 1: Service Enhancement
- [ ] Enhance modal service to support React content
- [ ] Add TypeScript definitions and interfaces
- [ ] Implement HTML escaping and security measures
- [ ] Create comprehensive test suite for service

### Week 2: PPModal Component Enhancement
- [ ] Add React content support methods to PPModal
- [ ] Implement proper React lifecycle management
- [ ] Add error handling and cleanup
- [ ] Test Web Component enhancements

### Week 3: React Integration
- [ ] Create React hooks for modal service
- [ ] Implement error boundaries
- [ ] Add declarative modal component (optional)
- [ ] Migrate quote drawer implementation

### Week 4: Polish and Documentation
- [ ] Performance testing and optimization
- [ ] Complete accessibility testing
- [ ] Write migration guide and documentation
- [ ] Final integration testing

## Benefits of This Approach

### 1. **Leverages Existing Investment**
- Builds on proven `PPModal` Web Component
- Maintains progressive enhancement pattern
- No breaking changes to existing API

### 2. **Best of Both Worlds**
- Framework-agnostic foundation
- React integration when needed
- Smaller bundle than full React Portal system

### 3. **Architectural Consistency**
- Follows existing Web Component patterns
- Maintains event-driven architecture
- Compatible with design system approach

### 4. **Progressive Enhancement**
- Works without JavaScript (basic functionality)
- Enhanced with Web Components
- Further enhanced with React content

### 5. **Maintainability**
- Single component to maintain
- Clear separation of concerns
- Easy to test and debug

## Migration Strategy

### Phase 1: Backward Compatibility
- All existing modal service calls continue to work
- No changes required to existing HTML modal usage

### Phase 2: Gradual React Adoption
- New features use React content
- Existing features can be migrated as needed
- Both approaches coexist peacefully

### Phase 3: Optimization
- Remove unused HTML modal patterns
- Optimize for React content delivery
- Enhance Web Component with learned patterns

## Risk Mitigation

### Technical Risks
- **React/Web Component interaction**: Careful lifecycle management prevents issues
- **Memory leaks**: Proper cleanup in both React and Web Component layers
- **Event conflicts**: Web Component events isolated from React events

### Migration Risks
- **Breaking changes**: Zero breaking changes due to backward compatibility
- **Performance**: Incremental adoption allows performance monitoring
- **Testing**: Existing tests continue to work, new tests added incrementally

## Success Criteria

- [ ] All existing modal functionality preserved
- [ ] React content support working seamlessly
- [ ] No memory leaks or performance regressions
- [ ] Full accessibility maintained
- [ ] Easy migration path for new React content
- [ ] Comprehensive test coverage for both modes

This approach provides the cleanest path forward by building on your existing excellent Web Component foundation while adding modern React capabilities where needed.