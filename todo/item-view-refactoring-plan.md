# Item-View System Refactoring Plan

Strategic refactoring plan to consolidate and modernize the item-view system before implementing quote object adapters.

## 🎯 Refactoring Goals

### **Eliminate Component Duplication**
- **Current**: Three separate view components (`ItemPreview`, `ItemDetail`, `ItemFullView`) with nearly identical fallback logic
- **Target**: Single unified `ItemView` component with scope-based rendering
- **Benefit**: Reduced maintenance, consistent behavior, easier testing

### **Replace String Templates with React Components**
- **Current**: `ItemInteraction` uses massive HTML string concatenation for modal content
- **Target**: Full React component composition throughout the system
- **Benefit**: Type safety, component reusability, proper event handling

### **Prepare for Quote Object Integration**
- **Current**: No comment system integration points, rigid adapter patterns
- **Target**: Flexible adapter system ready for rich content and commenting integration
- **Benefit**: Clean foundation for quote objects with TipTap rendering and commenting

## 📊 Current Issues Analysis

### **Critical Issues**

#### **String Template Architecture**
```typescript
// src/components/item-view/ItemInteraction.tsx (Lines 79-141)
const content = `
  <div class="item-detail" data-content-type="${contentType}">
    <header class="item-header">
      <h2>${item.label}</h2>
      <small>${item.type}</small>
    </header>
    <!-- 60+ lines of HTML string concatenation -->
  </div>
`;

// Issue: Forces all adapters to generate HTML strings instead of React components
```

#### **Component Duplication Pattern**
```typescript
// Identical fallback logic in 3+ components
ItemPreview.tsx (lines 18-48)    // Nearly identical
ItemDetail.tsx (lines 19-50)     // Nearly identical
ItemFullView.tsx (lines 18-48)   // Nearly identical

// Issue: Same fallback rendering logic copied across all view components
```

#### **Missing Integration Points**
- No comment system integration interface
- No scope validation utilities
- No content type registry
- Hard-coded scope handling

### **Medium Priority Issues**

#### **Props Drilling**
- Deep props passing without context or state management
- Complex interaction handlers passed through multiple layers
- No centralized state for item-view system

#### **Inconsistent Patterns**
- Mixed import styles (some missing React imports)
- Inconsistent error handling approaches
- Different event handling patterns across components

#### **Type Safety Gaps**
- Generic type handling complicated by string template approach
- No validation for scope or content type parameters
- Missing TypeScript strict mode compliance

### **Low Priority Issues**

#### **Unused Code**
- Empty `quote-adapters/` directory
- Unused WeakMap cache in adapter registry
- Incomplete reference adapter implementation

## 🔄 Refactoring Strategy

### **Phase 1: Component Architecture Modernization**
**Goal**: Replace string templates with React component composition

#### **1.1 Create Unified ItemView Component**
```typescript
// File: src/components/item-view/ItemView.tsx

interface ItemViewProps<T extends BaseItem = BaseItem> {
  item: T;
  contentType: string;
  scope: ViewScope;
  mode?: InteractionMode;
  onEscalate?: (targetScope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: T) => void;
}

export const ItemView = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  scope,
  mode = 'preview',
  onEscalate,
  onInteraction,
}: ItemViewProps<T>) => {
  const adapter = useContentAdapter(contentType);

  if (!adapter) {
    return <DefaultFallbackRenderer {...props} />;
  }

  return adapter.render({
    item,
    contentType,
    scope,
    mode,
    onEscalate,
    onInteraction,
  });
};
```

#### **1.2 Replace ItemInteraction String Templates**
```typescript
// File: src/components/item-view/ItemInteraction.tsx

// ❌ Remove: Lines 79-141 (HTML string concatenation)
// ✅ Add: React component-based modal content

const ItemInteraction = ({ item, contentType, children, ...props }) => {
  const handleScopeChange = useCallback((targetScope: ViewScope) => {
    const modalContent = (
      <ItemView
        item={item}
        contentType={contentType}
        scope={targetScope}
        mode="inspect"
      />
    );

    modalService.show({
      content: modalContent,
      size: getSizeForScope(targetScope)
    });
  }, [item, contentType]);

  // React-based interaction handling
};
```

#### **1.3 Extract Shared Fallback Logic**
```typescript
// File: src/components/item-view/DefaultFallbackRenderer.tsx

export const DefaultFallbackRenderer: React.FC<ItemViewProps> = ({
  item,
  scope,
  onEscalate
}) => (
  <div className="flow" data-content-type="default" data-scope={scope}>
    <header>
      <h4>{item.label}</h4>
      <small className="text-secondary">{item.type}</small>
    </header>
    {item.metadata && <MetadataRenderer metadata={item.metadata} />}
    {onEscalate && scope !== 'maxi' && (
      <EscalationButton onEscalate={onEscalate} currentScope={scope} />
    )}
  </div>
);
```

### **Phase 2: Enhanced Adapter System**
**Goal**: Create flexible, type-safe adapter registration and management

#### **2.1 Scope-Aware Adapter Interface**
```typescript
// File: src/components/item-view/types.ts

export interface ContentAdapter<T extends BaseItem = BaseItem> {
  contentType: string;
  render: (props: ItemViewProps<T>) => React.ReactNode;

  // New: Scope-specific optimization
  supportedScopes?: ViewScope[];

  // New: Comment integration support
  supportsCommenting?: boolean;

  // New: Rich content support
  supportsRichContent?: boolean;
}

export interface CommentAwareAdapter<T extends BaseItem = BaseItem>
  extends ContentAdapter<T> {
  supportsCommenting: true;
  renderWithComments: (props: ItemViewProps<T> & {
    comments: UniversalComment[];
    onComment: (content: string) => void;
  }) => React.ReactNode;
}
```

#### **2.2 Enhanced Content Adapter Registry**
```typescript
// File: src/components/item-view/ContentAdapterRegistry.tsx

interface ContentAdapterContextValue {
  adapters: Map<string, ContentAdapter>;
  registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => void;
  getAdapter: (contentType: string) => ContentAdapter | undefined;

  // New: Validation utilities
  validateContentType: (contentType: string) => boolean;
  getSupportedScopes: (contentType: string) => ViewScope[];

  // New: Comment integration
  supportsCommenting: (contentType: string) => boolean;
}

export const ContentAdapterProvider: React.FC<{
  children: React.ReactNode;
  adapters?: ContentAdapter[];
}> = ({ children, adapters: initialAdapters = [] }) => {
  const value = useMemo(() => {
    const adapters = new Map<string, ContentAdapter>();

    // Auto-register adapters
    initialAdapters.forEach(adapter => {
      adapters.set(adapter.contentType, adapter);
    });

    return {
      adapters,
      registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => {
        // Validation logic
        validateAdapter(adapter);
        adapters.set(adapter.contentType, adapter as ContentAdapter);
      },
      getAdapter: (contentType: string) => adapters.get(contentType),
      validateContentType: (contentType: string) => adapters.has(contentType),
      getSupportedScopes: (contentType: string) => {
        const adapter = adapters.get(contentType);
        return adapter?.supportedScopes || ['mini', 'mid', 'maxi'];
      },
      supportsCommenting: (contentType: string) => {
        const adapter = adapters.get(contentType);
        return adapter?.supportsCommenting || false;
      },
    };
  }, [initialAdapters]);

  return (
    <ContentAdapterContext.Provider value={value}>
      {children}
    </ContentAdapterContext.Provider>
  );
};
```

#### **2.3 Validation and Utility Functions**
```typescript
// File: src/components/item-view/utils/validation.ts

export const validateScope = (scope: unknown): scope is ViewScope => {
  return typeof scope === 'string' &&
    ['micro', 'mini', 'mid', 'maxi'].includes(scope);
};

export const validateInteractionMode = (mode: unknown): mode is InteractionMode => {
  return typeof mode === 'string' &&
    ['preview', 'inspect', 'edit', 'transform'].includes(mode);
};

export const validateAdapter = <T extends BaseItem>(
  adapter: ContentAdapter<T>
): void => {
  if (!adapter.contentType || typeof adapter.contentType !== 'string') {
    throw new Error('ContentAdapter must have a valid contentType');
  }
  if (!adapter.render || typeof adapter.render !== 'function') {
    throw new Error('ContentAdapter must have a render function');
  }
};
```

### **Phase 3: Modal Service Integration**
**Goal**: Seamless integration with existing modal system using React components

#### **3.1 React-Based Modal Content**
```typescript
// File: src/components/item-view/services/modal-service-integration.ts

interface ModalContentConfig {
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  placement?: 'center' | 'drawer-right' | 'drawer-left';
  closeOnEscape?: boolean;
}

export const createModalContent = (
  item: BaseItem,
  contentType: string,
  scope: ViewScope,
  config?: Partial<ModalContentConfig>
): React.ReactNode => {
  return (
    <ItemView
      item={item}
      contentType={contentType}
      scope={scope}
      mode="inspect"
    />
  );
};

export const getSizeForScope = (scope: ViewScope): ModalContentConfig['size'] => {
  switch (scope) {
    case 'mini': return 'small';
    case 'mid': return 'medium';
    case 'maxi': return 'large';
    default: return 'medium';
  }
};
```

#### **3.2 Enhanced ItemInteraction Component**
```typescript
// File: src/components/item-view/ItemInteraction.tsx (Refactored)

export const ItemInteraction = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  children,
  initialScope = 'mini',
  enableEscalation = true,
  scopeConfig,
  onScopeChange,
  onInteraction,
}: ItemInteractionProps<T>) => {
  const [currentScope, setCurrentScope] = useState(initialScope);
  const modalService = useModalService();

  const handleScopeChange = useCallback((targetScope: ViewScope) => {
    const modalContent = createModalContent(item, contentType, targetScope);

    modalService.show({
      content: modalContent,
      size: getSizeForScope(targetScope),
      onClose: () => {
        onScopeChange?.(currentScope); // Restore previous scope
      }
    });

    setCurrentScope(targetScope);
    onScopeChange?.(targetScope);
  }, [item, contentType, currentScope, modalService, onScopeChange]);

  const handleInteraction = useCallback((mode: InteractionMode) => {
    onInteraction?.(mode, item);
  }, [item, onInteraction]);

  return (
    <div
      className="item-interaction"
      data-content-type={contentType}
      data-scope={currentScope}
    >
      <ItemView
        item={item}
        contentType={contentType}
        scope={currentScope}
        onEscalate={enableEscalation ? handleScopeChange : undefined}
        onInteraction={handleInteraction}
      />
      {children}
    </div>
  );
};
```

### **Phase 4: Quote Object Integration Preparation**
**Goal**: Create foundation for quote object adapters and commenting integration

#### **4.1 Comment-Aware Adapter Base Class**
```typescript
// File: src/components/item-view/adapters/CommentAwareAdapterBase.tsx

export abstract class CommentAwareAdapterBase<T extends BaseItem = BaseItem>
  implements CommentAwareAdapter<T> {

  abstract contentType: string;
  supportsCommenting = true as const;
  supportsRichContent = false;

  abstract render(props: ItemViewProps<T>): React.ReactNode;

  renderWithComments(props: ItemViewProps<T> & {
    comments: UniversalComment[];
    onComment: (content: string) => void;
  }): React.ReactNode {
    return (
      <div className="item-with-comments">
        {this.render(props)}
        <CommentSection
          comments={props.comments}
          onComment={props.onComment}
        />
      </div>
    );
  }
}
```

#### **4.2 Quote Adapter Foundation**
```typescript
// File: src/components/item-view/quote-adapters/QuoteAdapterBase.tsx

interface QuoteObject extends BaseItem {
  type: 'quote';
  plainText: string;
  richContent: any; // TipTap JSON
  metadata: {
    sourceDocument: string;
    sourceRange: { from: number; to: number };
    createdAt: Date;
    createdBy: string;
  };
}

export abstract class QuoteAdapterBase
  extends CommentAwareAdapterBase<QuoteObject> {

  contentType = 'quote';
  supportsRichContent = true;

  protected renderQuoteContent(quote: QuoteObject): React.ReactNode {
    return (
      <blockquote className="quote-content">
        <TipTapRenderer
          content={quote.richContent}
          readonly
        />
      </blockquote>
    );
  }

  protected renderSourceLink(quote: QuoteObject): React.ReactNode {
    return (
      <footer className="quote-source">
        <ItemViewLink itemId={quote.metadata.sourceDocument}>
          View Source
        </ItemViewLink>
      </footer>
    );
  }
}
```

## 🎯 Success Criteria

### **Architecture Quality Metrics**
- [ ] Single unified `ItemView` component replaces 3 separate view components
- [ ] Zero HTML string templates - all React components
- [ ] Type-safe adapter registration and validation
- [ ] React-based modal content integration
- [ ] Comment system integration points ready

### **Quote Object Readiness**
- [ ] `CommentAwareAdapter` interface supports rich content
- [ ] `QuoteAdapterBase` class ready for implementation
- [ ] TipTap rendering integration prepared
- [ ] Source document linking patterns established

### **Developer Experience**
- [ ] Consistent component patterns across all views
- [ ] Clear adapter development guidelines
- [ ] Type safety throughout the system
- [ ] Easy testing with mocked adapters

## 📋 Implementation Timeline

### ** 1: Component Unification**
1. Create unified `ItemView` component
2. Extract shared `DefaultFallbackRenderer`
3. Update all existing usage to use new `ItemView`
4. Remove deprecated view components

### ** 2: Modal System Integration**
1. Replace string templates in `ItemInteraction`
2. Implement React-based modal content
3. Create modal service integration utilities
4. Update interaction handling patterns

### ** 3: Enhanced Adapter System**
1. Implement scope-aware adapter interface
2. Add validation utilities and content type registry
3. Create `CommentAwareAdapter` base class
4. Update existing adapters to use new patterns

### ** 4: Quote Integration Preparation**
1. Implement `QuoteAdapterBase` foundation
2. Create TipTap rendering integration
3. Prepare comment system integration points
4. Validate quote object interface compatibility
5. Update tests and documentation

## 🔗 Integration with Other Plans

### **Dependencies**
- **Commenting System Refactoring** (@todo/commenting-system-refactoring-plan.md)
  - Provides clean comment integration interfaces
  - Should complete first for optimal integration

### **Enables**
- **Quote Object Implementation** (@todo/quote-object-commenting-plan.md)
  - Clean React component composition for quote adapters
  - Type-safe adapter registration for quote content type
  - Comment system integration ready out of the box

### **Timeline Coordination**
```
 1-4: Commenting System Refactoring
 3-6: Item-View System Refactoring (overlap 3-4)
 7+:   Quote Object Implementation
```

---

*This refactoring creates a modern, type-safe, React-based item-view system ready for quote object adapters and seamless commenting integration.*