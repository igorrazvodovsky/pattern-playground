# React Portals Modal Implementation Plan

## Overview

Replace the existing modal service with a React Portals-based solution that follows React best practices and eliminates manual root management complexity.

## Current Problems

The existing modal service has several issues:
- Manual React root creation/cleanup leads to memory leaks
- Timing dependencies with `setTimeout()`
- Mixed HTML/React paradigms increase complexity
- Imperative API goes against React patterns
- Difficult to test and maintain

## Proposed Solution: React Portals with Context

Use React Portals with a context-based modal management system that:
- Leverages React's built-in portal system
- Provides declarative modal API
- Automatic lifecycle management
- Full React DevTools support
- Better TypeScript integration

## Implementation Plan

### Phase 1: Core Modal Context

#### 1.1 Modal Types and Interfaces

```typescript
// src/components/modal/types.ts

export type ModalPosition = 'left' | 'right';
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

export interface ModalOptions {
  position?: ModalPosition;
  size?: ModalSize;
  title?: string;
  closable?: boolean;
  backdrop?: boolean;
  className?: string;
}

export interface Modal {
  id: string;
  type: 'drawer' | 'dialog';
  content: React.ReactNode;
  options: ModalOptions;
  createdAt: Date;
}

export interface ModalContextValue {
  modals: Modal[];
  openDrawer: (content: React.ReactNode, options?: ModalOptions) => string;
  openDialog: (content: React.ReactNode, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
}
```

#### 1.2 Modal Context Provider

```typescript
// src/components/modal/ModalContext.tsx

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, ModalOptions, ModalContextValue } from './types';

const ModalContext = createContext<ModalContextValue | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

const generateModalId = () => `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const openDrawer = useCallback((content: React.ReactNode, options: ModalOptions = {}) => {
    const id = generateModalId();
    const modal: Modal = {
      id,
      type: 'drawer',
      content,
      options: { position: 'right', closable: true, backdrop: true, ...options },
      createdAt: new Date()
    };
    
    setModals(prev => [...prev, modal]);
    return id;
  }, []);

  const openDialog = useCallback((content: React.ReactNode, options: ModalOptions = {}) => {
    const id = generateModalId();
    const modal: Modal = {
      id,
      type: 'dialog',
      content,
      options: { size: 'medium', closable: true, backdrop: true, ...options },
      createdAt: new Date()
    };
    
    setModals(prev => [...prev, modal]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setModals([]);
  }, []);

  const value: ModalContextValue = {
    modals,
    openDrawer,
    openDialog,
    closeModal,
    closeAll
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};
```

### Phase 2: Portal Components

#### 2.1 Modal Portal Container

```typescript
// src/components/modal/ModalPortal.tsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from './types';
import { DrawerPortal } from './DrawerPortal';
import { DialogPortal } from './DialogPortal';

interface ModalPortalProps {
  modal: Modal;
  onClose: (id: string) => void;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({ modal, onClose }) => {
  // Create portal root if it doesn't exist
  useEffect(() => {
    const existingRoot = document.getElementById('modal-root');
    if (!existingRoot) {
      const portalRoot = document.createElement('div');
      portalRoot.id = 'modal-root';
      portalRoot.className = 'modal-portal-root';
      document.body.appendChild(portalRoot);
    }
  }, []);

  const portalRoot = document.getElementById('modal-root');
  if (!portalRoot) return null;

  const handleClose = () => onClose(modal.id);

  const ModalComponent = modal.type === 'drawer' ? DrawerPortal : DialogPortal;

  return createPortal(
    <ModalComponent modal={modal} onClose={handleClose} />,
    portalRoot
  );
};
```

#### 2.2 Drawer Portal Component

```typescript
// src/components/modal/DrawerPortal.tsx

import React, { useEffect, useRef } from 'react';
import { Modal } from './types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface DrawerPortalProps {
  modal: Modal;
  onClose: () => void;
}

export const DrawerPortal: React.FC<DrawerPortalProps> = ({ modal, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { options } = modal;

  // Lock body scroll when drawer is open
  useBodyScrollLock(true);

  // Trap focus within drawer
  useFocusTrap(drawerRef, true);

  // Handle escape key
  useEffect(() => {
    if (!options.closable) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [options.closable, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (options.backdrop && options.closable && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={drawerRef}
        className={`drawer drawer--${options.position} ${options.className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={options.title ? `${modal.id}-title` : undefined}
      >
        {options.title && (
          <header className="drawer__header">
            <h2 id={`${modal.id}-title`} className="drawer__title">
              {options.title}
            </h2>
            {options.closable && (
              <button
                className="drawer__close-button"
                onClick={onClose}
                aria-label="Close drawer"
              >
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            )}
          </header>
        )}
        
        <div className="drawer__content">
          {modal.content}
        </div>
      </div>
    </div>
  );
};
```

#### 2.3 Dialog Portal Component

```typescript
// src/components/modal/DialogPortal.tsx

import React, { useEffect, useRef } from 'react';
import { Modal } from './types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface DialogPortalProps {
  modal: Modal;
  onClose: () => void;
}

export const DialogPortal: React.FC<DialogPortalProps> = ({ modal, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { options } = modal;

  useBodyScrollLock(true);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    if (!options.closable) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [options.closable, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (options.backdrop && options.closable && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className={`dialog dialog--${options.size} ${options.className || ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={options.title ? `${modal.id}-title` : undefined}
      >
        {options.title && (
          <header className="dialog__header">
            <h2 id={`${modal.id}-title`} className="dialog__title">
              {options.title}
            </h2>
            {options.closable && (
              <button
                className="dialog__close-button"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            )}
          </header>
        )}
        
        <div className="dialog__content">
          {modal.content}
        </div>
      </div>
    </div>
  );
};
```

### Phase 3: Modal Manager Component

#### 3.1 Modal Manager

```typescript
// src/components/modal/ModalManager.tsx

import React from 'react';
import { useModal } from './ModalContext';
import { ModalPortal } from './ModalPortal';

export const ModalManager: React.FC = () => {
  const { modals, closeModal } = useModal();

  return (
    <>
      {modals.map(modal => (
        <ModalPortal
          key={modal.id}
          modal={modal}
          onClose={closeModal}
        />
      ))}
    </>
  );
};
```

### Phase 4: Utility Hooks

#### 4.1 Focus Trap Hook

```typescript
// src/components/hooks/useFocusTrap.ts

import { useEffect } from 'react';

export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [containerRef, isActive]);
};
```

#### 4.2 Body Scroll Lock Hook

```typescript
// src/components/hooks/useBodyScrollLock.ts

import { useEffect } from 'react';

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
};
```

### Phase 5: Application Integration

#### 5.1 Root App Setup

```typescript
// src/App.tsx (or main application root)

import React from 'react';
import { ModalProvider } from './components/modal/ModalContext';
import { ModalManager } from './components/modal/ModalManager';

export const App: React.FC = () => {
  return (
    <ModalProvider>
      <div className="app">
        {/* Your existing app content */}
        <MainContent />
        
        {/* Modal portal manager */}
        <ModalManager />
      </div>
    </ModalProvider>
  );
};
```

#### 5.2 Backward Compatibility Layer

```typescript
// src/services/modal-service-legacy.ts

import { ModalContextValue } from '../components/modal/types';

/**
 * Legacy modal service for backward compatibility
 * Provides imperative API that delegates to React context
 */
export class LegacyModalService {
  private modalContext: ModalContextValue | null = null;

  setContext(context: ModalContextValue) {
    this.modalContext = context;
  }

  openDrawer(content: React.ReactNode, position: 'left' | 'right' = 'right', title?: string): string {
    if (!this.modalContext) {
      throw new Error('Modal context not initialized');
    }
    
    return this.modalContext.openDrawer(content, { position, title });
  }

  openDialog(content: React.ReactNode, title?: string): string {
    if (!this.modalContext) {
      throw new Error('Modal context not initialized');
    }
    
    return this.modalContext.openDialog(content, { title });
  }

  close(): void {
    if (!this.modalContext) return;
    this.modalContext.closeAll();
  }

  closeModal(id: string): void {
    if (!this.modalContext) return;
    this.modalContext.closeModal(id);
  }
}

export const modalService = new LegacyModalService();
```

### Phase 6: Migration Examples

#### 6.1 Quote Drawer Component

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

#### 6.2 Updated Quote Integration Hook

```typescript
// src/components/commenting/tiptap/use-tiptap-quote-integration.ts

import { useCallback } from 'react';
import { useModal } from '../../modal/ModalContext';
import { QuoteDrawerContent } from '../../quote/QuoteDrawerContent';

export const useTiptapQuoteIntegration = () => {
  const { openDrawer } = useModal();

  const handleQuoteClick = useCallback(async (quoteId: string) => {
    const quote = getQuote(quoteId);
    if (quote) {
      try {
        console.log('Opening quote in drawer:', quote);

        const currentUserObj = getUserById(currentUser) || {
          id: currentUser,
          name: currentUser
        };

        // Clean, declarative React component approach
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

## Implementation Timeline

### Week 1: Foundation
- [ ] Create modal types and interfaces
- [ ] Implement ModalContext and provider
- [ ] Create utility hooks (focus trap, body scroll lock)
- [ ] Set up basic portal structure

### Week 2: Portal Components
- [ ] Implement DrawerPortal component
- [ ] Implement DialogPortal component
- [ ] Create ModalManager component
- [ ] Add accessibility features and ARIA attributes

### Week 3: Integration and Migration
- [ ] Integrate ModalProvider into main App
- [ ] Create legacy modal service compatibility layer
- [ ] Migrate quote drawer implementation
- [ ] Update other modal usages

### Week 4: Polish and Testing
- [ ] Add error boundaries and error handling
- [ ] Implement comprehensive test suite
- [ ] Performance optimization and testing
- [ ] Documentation and migration guide

## Benefits

### 1. **React Native Approach**
- Uses React Portals (built-in React feature)
- Follows React patterns and conventions
- Automatic lifecycle management

### 2. **Simplified Architecture**
- No manual root management
- Declarative API instead of imperative
- Single responsibility components

### 3. **Better Developer Experience**
- Full React DevTools support
- Easy to test components
- Type safety throughout
- Context flows naturally

### 4. **Performance**
- React handles optimization automatically
- No timing dependencies
- Efficient re-renders with React's reconciliation

### 5. **Accessibility**
- Built-in focus management
- ARIA attributes handled properly
- Keyboard navigation support

## Migration Strategy

### Phase 1: Parallel Implementation
- Implement portal system alongside existing service
- No breaking changes to existing code

### Phase 2: Gradual Migration
- Update components one by one to use new system
- Keep legacy service for backward compatibility

### Phase 3: Legacy Removal
- Remove old modal service once all components migrated
- Clean up unused code and dependencies

## Risk Mitigation

### Portal-Specific Risks
- **Event Bubbling**: Use `stopPropagation()` where needed
- **CSS Isolation**: Use proper CSS classes and avoid conflicts
- **Context Flow**: Ensure ModalProvider wraps app root

### Testing Strategy
- Unit tests for each component
- Integration tests for modal workflows
- Accessibility testing with screen readers
- Performance testing for multiple modals

### Error Handling
- Error boundaries around portal content
- Graceful fallbacks for portal failures
- Proper cleanup on unmount

## Success Criteria

- [ ] All existing modal functionality preserved
- [ ] Cleaner, more maintainable codebase
- [ ] Better performance and user experience
- [ ] Full accessibility compliance
- [ ] Comprehensive test coverage
- [ ] Smooth migration path with no breaking changes

This implementation leverages React's built-in capabilities while providing a clean, maintainable solution that follows modern React best practices.