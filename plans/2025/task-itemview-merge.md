# Task and ItemView Merge Plan

## Executive Summary

This plan outlines the consolidation of the Task component into the ItemView architecture, making Task a specialized content type within the unified item viewing system. This aligns with the universal commenting architecture by treating all displayable entities consistently.

## Current State Analysis

### Task Component
- **Location**: `src/components/task/`
- **Structure**: Standalone component with custom rendering
- **Key features**:
  - Task-specific types (status, history, assignee)
  - Custom TaskView component
  - Time formatting utilities
  - HTML rendering capabilities

### ItemView Component
- **Location**: `src/components/item-view/`
- **Structure**: Adapter-based universal viewing system
- **Key features**:
  - Multi-scope viewing (micro, mini, mid, maxi)
  - Interaction modes (preview, inspect, edit, transform)
  - Content adapter registry
  - Comment-aware adapter support
  - Extensible architecture

## Architectural Decision

**Tasks will become a content type within the ItemView system**, maintaining all task-specific functionality while gaining:
- Unified viewing architecture
- Automatic comment support
- Consistent interaction patterns
- View scope flexibility

## Migration Strategy

### Phase 1: Create Task Adapter (1 day)

#### 1.1 Define Task as ItemObject Type
```typescript
// src/components/item-view/types.ts
export interface TaskObject {
  id: string;
  specification: string;
  status: 'submitted' | 'planning' | 'executing' | 'asking' | 'completed' | 'failed';
  history: TaskHistoryEntry[];
  assignee?: string;
  progress?: number;
  createdAt: Date;
  metadata?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    dueDate?: Date;
    [key: string]: any;
  };
}

export interface TaskHistoryEntry {
  id: string;
  timestamp: Date;
  actor: 'User' | 'System';
  action: string;
  details?: string;
}

// Update discriminated union
export type ItemObject<T extends string = string> = 
  T extends 'quote' ? QuoteObject :
  T extends 'task' ? TaskObject :
  T extends 'reference' ? BaseItem :
  BaseItem;
```

#### 1.2 Create TaskAdapter
```typescript
// src/components/item-view/adapters/TaskAdapter.tsx
import React from 'react';
import type { ContentAdapter, ItemViewProps, TaskObject } from '../types';
import { formatTimestamp } from '../../task/time-utils';

const renderMicroView = (task: TaskObject) => (
  <span className="task-micro">
    <span className={`status-indicator status-${task.status}`} />
    {task.specification.substring(0, 50)}...
  </span>
);

const renderMiniView = (task: TaskObject) => (
  <div className="task-mini">
    <h4>{task.specification}</h4>
    <div className="task-meta">
      <span className={getStatusBadgeClass(task.status)}>{task.status}</span>
      {task.assignee && <span className="assignee">{task.assignee}</span>}
    </div>
  </div>
);

const renderMidView = (task: TaskObject) => (
  <div className="task-mid">
    <header>
      <h3>{task.specification}</h3>
      <span className={getStatusBadgeClass(task.status)}>{task.status}</span>
    </header>
    {task.assignee && <div>Assignee: {task.assignee}</div>}
    {task.progress !== undefined && (
      <progress value={task.progress} max={100}>{task.progress}%</progress>
    )}
    {/* Recent history entries */}
    <div className="recent-history">
      {task.history.slice(-3).map(entry => (
        <div key={entry.id} className="history-entry">
          {entry.action} • {formatTimestamp(entry.timestamp)}
        </div>
      ))}
    </div>
  </div>
);

const renderMaxiView = (task: TaskObject) => (
  // Full TaskView content here
  <div className="task-maxi">
    {/* Complete task view with full history */}
  </div>
);

export const taskAdapter: ContentAdapter<'task'> = {
  contentType: 'task',
  supportedScopes: ['micro', 'mini', 'mid', 'maxi'],
  supportsCommenting: true,
  supportsRichContent: false,
  
  render: (props: ItemViewProps<'task'>) => {
    const task = props.item as TaskObject;
    
    switch (props.scope) {
      case 'micro':
        return renderMicroView(task);
      case 'mini':
        return renderMiniView(task);
      case 'mid':
        return renderMidView(task);
      case 'maxi':
        return renderMaxiView(task);
      default:
        return renderMiniView(task);
    }
  }
};

// Helper function to convert existing Task to TaskObject
export const taskToItemObject = (task: Task): TaskObject => ({
  ...task,
  metadata: {
    // Any additional metadata
  }
});
```

### Phase 2: Integration (1 day)

#### 2.1 Register Task Adapter
```typescript
// src/components/item-view/adapters/index.ts
export { taskAdapter, taskToItemObject } from './TaskAdapter';

// In app initialization
import { taskAdapter } from './adapters';
contentAdapterRegistry.register(taskAdapter);
```

#### 2.2 Create Compatibility Layer
```typescript
// src/components/task/TaskViewCompat.tsx
import React from 'react';
import { ItemView } from '../item-view';
import { taskToItemObject } from '../item-view/adapters';
import type { Task } from './types';

// Backward compatibility wrapper
export const TaskView: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <ItemView
      item={taskToItemObject(task)}
      contentType="task"
      scope="maxi"
      mode="preview"
    />
  );
};
```

### Phase 3: Comment Integration (1 day)

#### 3.1 Create Comment-Aware Task Adapter
```typescript
// src/components/item-view/adapters/CommentAwareTaskAdapter.tsx
export class CommentAwareTaskAdapter extends CommentAwareAdapterBase<TaskObject> {
  contentType = 'task' as const;
  
  renderContent(task: TaskObject, scope: ViewScope) {
    // Reuse rendering logic from TaskAdapter
    return taskAdapter.render({ item: task, contentType: 'task', scope });
  }
  
  getCommentPointer(task: TaskObject): CommentPointer {
    return new EntityPointer(`task-${task.id}`, 'task', task.id);
  }
}
```

### Phase 4: Migration & Testing (1 day)

#### 4.1 Update Imports
- Replace direct TaskView imports with ItemView
- Update story files to use new structure
- Ensure backward compatibility

#### 4.2 Test Coverage
- Task rendering at all view scopes
- Comment functionality on tasks
- Interaction modes (preview, inspect, edit)
- History display and formatting
- Status transitions

### Phase 5: Cleanup (0.5 days)

#### 5.1 Deprecate Old Code
- Mark original TaskView as deprecated
- Move utilities to shared location
- Update documentation

#### 5.2 Remove Redundant Code
- Remove standalone task rendering
- Consolidate time utilities
- Clean up exports

## Benefits of Consolidation

### 1. Unified Architecture
- Single system for all content types
- Consistent API across components
- Reduced code duplication

### 2. Enhanced Capabilities
- Tasks gain multi-scope viewing
- Automatic comment support
- Unified interaction patterns
- Extensible metadata support

### 3. Developer Experience
- Single mental model for content display
- Easy to add new content types
- Consistent patterns across codebase

### 4. Comment System Alignment
- Tasks become commentable through universal system
- No special handling needed
- Consistent pointer implementation

## Impact on Commenting Plan

### Positive Impacts
1. **Simplifies pointer implementation** - Tasks already fit EntityPointer pattern
2. **Reduces special cases** - No separate task commenting logic needed
3. **Validates architecture** - Proves ItemView can handle complex content types
4. **Accelerates Phase 4** - Task commenting comes "for free" with adapter

### Required Updates to Commenting Plan
1. **Phase 2**: Include TaskObject in pointer examples
2. **Phase 4**: TaskComments component uses ItemView with comments
3. **Phase 5**: Test task commenting specifically

### No Conflicts
- Architecture remains pointer-based
- Universal commenting still works everywhere
- Editor plugin independence maintained

## Implementation Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 1 day | Create Task adapter and types |
| Phase 2 | 1 day | Integration and registration |
| Phase 3 | 1 day | Comment-aware adapter |
| Phase 4 | 1 day | Migration and testing |
| Phase 5 | 0.5 days | Cleanup and documentation |
| **Total** | **4.5 days** | |

## Success Criteria

1. **Functional parity** - All task features work through ItemView
2. **Performance** - No degradation in rendering speed
3. **Backward compatibility** - Existing TaskView usage continues working
4. **Comment integration** - Tasks fully commentable
5. **Clean architecture** - No duplicate code or concepts

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing task usage | Compatibility wrapper maintains API |
| Complex task features don't fit | Adapter can import task utilities |
| Performance regression | Benchmark before/after, optimize if needed |
| Comment integration issues | Test thoroughly with mock data |

## Decision Record

**Status**: Proposed

**Context**: Two separate systems for displaying content create maintenance burden and inconsistency.

**Decision**: Merge Task into ItemView as a content type.

**Consequences**:
- (+) Unified architecture
- (+) Automatic comment support
- (+) Reduced code complexity
- (-) Initial migration effort
- (-) Need to maintain compatibility

## Next Steps

1. Review and approve plan
2. Create feature branch `feature/task-itemview-merge`
3. Implement Phase 1: Task Adapter
4. Validate with existing task data
5. Proceed with integration

## Notes

- This merge validates the ItemView architecture's flexibility
- Sets pattern for migrating other standalone components
- Aligns perfectly with universal commenting vision
- Consider migrating other entity types (Project, Document) similarly