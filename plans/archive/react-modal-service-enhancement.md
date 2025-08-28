# React Modal Service Enhancement Plan

## Current Problem

The modal service currently only accepts HTML strings, forcing us to use a fragile pattern:
1. Create HTML template with placeholder elements
2. Open modal with HTML string
3. Use `setTimeout()` to wait for DOM rendering
4. Find elements by ID and inject React components
5. No cleanup lifecycle management

This approach has several issues:
- **Timing dependencies**: Relies on arbitrary delays
- **XSS vulnerabilities**: Direct string interpolation without escaping
- **Memory leaks**: React roots not properly cleaned up
- **Complex state synchronization**: HTML and React portions disconnected

## Proposed Solution: Enhanced Modal Service

Extend the existing `modalService` to accept both HTML strings (backward compatibility) and React components (new functionality).

## Implementation Plan

### Phase 1: Core Modal Service Enhancement

#### 1.1 Update Modal Service Interface

```typescript
// src/services/modal-service.ts

import React, { ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

type ModalContent = string | ReactElement;

interface ReactModalState {
  root: Root;
  container: HTMLElement;
  cleanup: () => void;
}

export class ModalService {
  private currentModal: HTMLElement | null = null;
  private reactModals: Map<string, ReactModalState> = new Map();

  // Enhanced drawer method
  openDrawer(
    content: ModalContent, 
    position: ModalPosition = 'right', 
    title?: string
  ): string {
    if (typeof content === 'string') {
      return this.openHtmlDrawer(content, position, title);
    } else {
      return this.openReactDrawer(content, position, title);
    }
  }

  // Enhanced dialog method  
  openDialog(
    content: ModalContent,
    title?: string
  ): string {
    if (typeof content === 'string') {
      return this.openHtmlDialog(content, title);
    } else {
      return this.openReactDialog(content, title);
    }
  }

  // Close specific modal by ID
  closeModal(modalId: string): void {
    const reactModal = this.reactModals.get(modalId);
    if (reactModal) {
      reactModal.cleanup();
      this.reactModals.delete(modalId);
    } else {
      // Fallback to existing HTML modal close logic
      this.close();
    }
  }

  // Close all modals
  closeAll(): void {
    // Clean up all React modals
    this.reactModals.forEach((modal, id) => {
      modal.cleanup();
    });
    this.reactModals.clear();

    // Close existing HTML modal
    this.close();
  }
}
```

#### 1.2 React Modal Implementation

```typescript
// src/services/modal-service.ts (continued)

private openReactDrawer(
  component: ReactElement, 
  position: ModalPosition, 
  title?: string
): string {
  const modalId = `react-drawer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create modal container
  const container = document.createElement('div');
  container.id = modalId;
  container.className = 'react-modal-container';
  document.body.appendChild(container);

  // Create React root
  const root = createRoot(container);

  // Cleanup function
  const cleanup = () => {
    root.unmount();
    container.remove();
    this.reactModals.delete(modalId);
  };

  // Render drawer component
  root.render(
    React.createElement(DrawerWrapper, {
      position,
      title,
      modalId,
      onClose: cleanup,
      children: component
    })
  );

  // Store modal state
  this.reactModals.set(modalId, { root, container, cleanup });

  return modalId;
}

private openReactDialog(component: ReactElement, title?: string): string {
  const modalId = `react-dialog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create modal container
  const container = document.createElement('div');
  container.id = modalId;
  container.className = 'react-modal-container';
  document.body.appendChild(container);

  // Create React root
  const root = createRoot(container);

  // Cleanup function
  const cleanup = () => {
    root.unmount();
    container.remove();
    this.reactModals.delete(modalId);
  };

  // Render dialog component
  root.render(
    React.createElement(DialogWrapper, {
      title,
      modalId,
      onClose: cleanup,
      children: component
    })
  );

  // Store modal state
  this.reactModals.set(modalId, { root, container, cleanup });

  return modalId;
}

// Keep existing HTML methods for backward compatibility
private openHtmlDrawer(content: string, position: ModalPosition, title?: string): string {
  // Existing implementation
  return this.open({ type: 'drawer', position, title, content });
}

private openHtmlDialog(content: string, title?: string): string {
  // Existing implementation  
  return this.open({ type: 'dialog', title, content });
}
```

### Phase 2: React Wrapper Components

#### 2.1 Drawer Wrapper Component

```typescript
// src/components/modal/DrawerWrapper.tsx

import React, { useEffect } from 'react';

interface DrawerWrapperProps {
  position: 'left' | 'right';
  title?: string;
  modalId: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DrawerWrapper: React.FC<DrawerWrapperProps> = ({
  position,
  title,
  modalId,
  onClose,
  children
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className={`drawer drawer--${position}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalId}-title` : undefined}
      >
        {title && (
          <header className="drawer__header">
            <h2 id={`${modalId}-title`} className="drawer__title">
              {title}
            </h2>
            <button
              className="drawer__close-button"
              onClick={onClose}
              aria-label="Close drawer"
            >
              <iconify-icon icon="ph:x"></iconify-icon>
            </button>
          </header>
        )}
        
        <div className="drawer__content">
          {children}
        </div>
      </div>
    </div>
  );
};
```

#### 2.2 Dialog Wrapper Component

```typescript
// src/components/modal/DialogWrapper.tsx

import React, { useEffect } from 'react';

interface DialogWrapperProps {
  title?: string;
  modalId: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  title,
  modalId,
  onClose,
  children
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalId}-title` : undefined}
      >
        {title && (
          <header className="dialog__header">
            <h2 id={`${modalId}-title`} className="dialog__title">
              {title}
            </h2>
            <button
              className="dialog__close-button"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <iconify-icon icon="ph:x"></iconify-icon>
            </button>
          </header>
        )}
        
        <div className="dialog__content">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Phase 3: Migration and Usage Examples

#### 3.1 Migrate Quote Modal

```typescript
// src/components/quote/QuoteDrawerContent.tsx

import React from 'react';
import { UniversalCommentInterface } from '../commenting/universal/UniversalCommentInterface';
import type { QuoteObject } from '../../services/commenting/quote-service';
import type { User } from '../../stories/data';

interface QuoteDrawerContentProps {
  quote: QuoteObject;
  currentUser: User;
}

export const QuoteDrawerContent: React.FC<QuoteDrawerContentProps> = ({
  quote,
  currentUser
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

#### 3.2 Update Quote Integration Hook

```typescript
// src/components/commenting/tiptap/use-tiptap-quote-integration.ts

import { QuoteDrawerContent } from '../../quote/QuoteDrawerContent';

// Replace the handleQuoteClick function:
const handleQuoteClick = useCallback(async (quoteId: string) => {
  const quote = getQuote(quoteId);
  if (quote) {
    try {
      console.log('Opening quote in drawer:', quote);

      const currentUserObj = getUserById(currentUser) || {
        id: currentUser,
        name: currentUser
      };

      // Open React drawer - no timing issues, no HTML injection, proper cleanup
      const modalId = modalService.openDrawer(
        <QuoteDrawerContent 
          quote={quote} 
          currentUser={currentUserObj} 
        />,
        'right',
        quote.name
      );

      console.log('Quote drawer opened successfully:', modalId);
    } catch (error) {
      console.error('Failed to open quote drawer:', error);
    }
  } else {
    console.warn(`Quote not found: ${quoteId}`);
  }
}, [getQuote, currentUser]);
```

### Phase 4: Type Safety and Error Handling

#### 4.1 Enhanced Type Definitions

```typescript
// src/services/modal-service.ts (types section)

export type ModalPosition = 'left' | 'right';

export interface ModalServiceConfig {
  defaultPosition?: ModalPosition;
  enableEscapeClose?: boolean;
  enableBackdropClose?: boolean;
  animationDuration?: number;
}

export interface ModalState {
  id: string;
  type: 'drawer' | 'dialog';
  content: ModalContent;
  isReact: boolean;
  createdAt: Date;
}

export interface ModalServiceEvents {
  'modal:open': (modalId: string) => void;
  'modal:close': (modalId: string) => void;
  'modal:error': (error: Error, modalId?: string) => void;
}
```

#### 4.2 Error Boundaries

```typescript
// src/components/modal/ModalErrorBoundary.tsx

import React from 'react';

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ModalErrorBoundary extends React.Component<
  ModalErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ModalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Modal error caught:', error, errorInfo);
    this.props.onError(error);
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
    <p>{error.message}</p>
    <button onClick={retry} className="button button--primary">
      Try again
    </button>
  </div>
);
```

### Phase 5: Backward Compatibility and Migration

#### 5.1 Migration Guide

```typescript
// Migration examples:

// BEFORE (fragile HTML + setTimeout pattern):
const handleQuoteClick = useCallback(async (quoteId: string) => {
  const quoteDrawerContent = `
    <div class="quote-drawer">
      <div id="quote-comments-${quoteId}">
        <!-- React will render here -->
      </div>
    </div>
  `;
  
  modalService.openDrawer(quoteDrawerContent, 'right', quote.name);
  
  setTimeout(() => {
    const container = document.getElementById(`quote-comments-${quoteId}`);
    if (container) {
      const root = createRoot(container);
      root.render(React.createElement(UniversalCommentInterface, {...}));
    }
  }, 150);
}, []);

// AFTER (clean React component):
const handleQuoteClick = useCallback(async (quoteId: string) => {
  const quote = getQuote(quoteId);
  
  modalService.openDrawer(
    <QuoteDrawerContent quote={quote} currentUser={currentUser} />,
    'right',
    quote.name
  );
}, []);
```

#### 5.2 Feature Detection

```typescript
// Check if enhanced modal service is available
const hasReactModalSupport = typeof modalService.openDrawer === 'function' && 
  modalService.openDrawer.length >= 1;

if (hasReactModalSupport) {
  // Use React components
  modalService.openDrawer(<MyComponent />, 'right', 'Title');
} else {
  // Fallback to HTML strings
  modalService.openDrawer('<div>HTML content</div>', 'right', 'Title');
}
```

## Implementation Timeline

### Week 1: Core Service Enhancement
- [ ] Implement enhanced `ModalService` class with React support
- [ ] Create `DrawerWrapper` and `DialogWrapper` components
- [ ] Add TypeScript definitions and interfaces
- [ ] Write unit tests for modal service

### Week 2: Wrapper Components and Error Handling
- [ ] Implement `ModalErrorBoundary` component
- [ ] Add proper accessibility attributes (ARIA, focus management)
- [ ] Create CSS animations and styling for React modals
- [ ] Test modal lifecycle and cleanup

### Week 3: Migration and Integration
- [ ] Create `QuoteDrawerContent` component
- [ ] Migrate quote integration hook to use React modals
- [ ] Update other modal usages throughout the codebase
- [ ] Add migration utilities and documentation

### Week 4: Polish and Documentation
- [ ] Performance testing and optimization
- [ ] Complete test coverage
- [ ] Update documentation and usage examples
- [ ] Create migration guide for existing code

## Benefits

### 1. **Eliminated Timing Dependencies**
- No more `setTimeout()` delays
- React handles rendering lifecycle properly

### 2. **Type Safety**
- Full TypeScript support for modal content
- Compile-time checks for component props

### 3. **Security**
- React automatically escapes content
- No direct HTML string injection

### 4. **Proper Lifecycle Management**
- Automatic cleanup when modals close
- No memory leaks from orphaned React roots

### 5. **Developer Experience**
- Clean, declarative React components
- Easy to test and maintain
- Consistent with modern React patterns

### 6. **Backward Compatibility**
- Existing HTML string usage continues to work
- Gradual migration path

## Success Criteria

- [ ] All existing modal functionality preserved
- [ ] New React modal support working seamlessly
- [ ] No memory leaks or timing issues
- [ ] Full TypeScript coverage
- [ ] Performance equivalent or better than current implementation
- [ ] Clean migration path with clear documentation

## Risk Mitigation

### Backward Compatibility
- Keep all existing HTML modal methods intact
- Provide feature detection utilities
- Create comprehensive migration guide

### Performance
- Lazy load React wrapper components
- Optimize modal opening/closing animations
- Monitor memory usage and cleanup

### Error Handling
- Implement error boundaries for React modals
- Graceful fallbacks when React components fail
- Proper error logging and debugging

This enhancement will modernize the modal system while maintaining backward compatibility and eliminating the fragile timing-dependent patterns currently in use.