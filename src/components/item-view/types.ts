export type ViewScope = 'micro' | 'mini' | 'mid' | 'maxi';

export type InteractionMode = 'preview' | 'inspect' | 'edit' | 'transform';

export interface BaseItem {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

// Import the proper QuoteObject type
export interface QuoteObject {
  id: string;
  content: {
    plainText: string;
    html: string;
  };
  metadata: {
    sourceDocument: string;
    authorId: string;
    createdAt: string;
    [key: string]: any;
  };
  actions: {
    annotate: { enabled: boolean };
    cite: { enabled: boolean };
    challenge: { enabled: boolean };
    pin: { enabled: boolean };
  };
}

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

export interface ProjectObject {
  id: string;
  name: string;
  description: string;
  type: 'project';
  icon: string;
  searchableText: string;
  metadata?: {
    status?: 'planning' | 'active' | 'completed' | 'archived';
    phase?: string;
    updatedAt?: string;
    updatedBy?: string;
    [key: string]: any;
  };
}

// Discriminated union based on contentType
export type ItemObject<T extends string = string> = 
  T extends 'quote' ? QuoteObject :
  T extends 'task' ? TaskObject :
  T extends 'project' ? ProjectObject :
  T extends 'reference' ? BaseItem :
  BaseItem; // fallback for unknown types

export interface ViewScopeConfig {
  scope: ViewScope;
  trigger?: 'hover' | 'click' | 'focus' | 'keydown';
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  mode?: InteractionMode;
}

export interface ItemInteractionProps<T extends string = string> {
  item: ItemObject<T>;
  contentType: T;
  children: React.ReactNode;
  initialScope?: ViewScope;
  enableEscalation?: boolean;
  scopeConfig?: Partial<Record<ViewScope, ViewScopeConfig>>;
  onScopeChange?: (scope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: ItemObject<T>) => void;
}

export interface ItemViewProps<T extends string = string> {
  item: ItemObject<T>;
  contentType: T;
  scope: ViewScope;
  mode?: InteractionMode;
  onEscalate?: (targetScope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: ItemObject<T>) => void;
}

export interface ContentAdapter<T extends string = string> {
  contentType: T;
  render: (props: ItemViewProps<T>) => React.ReactNode;
  
  // Enhanced adapter capabilities
  supportedScopes?: ViewScope[];
  supportsCommenting?: boolean;
  supportsRichContent?: boolean;
}

// Comment integration support
export interface UniversalComment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  parentId?: string;
}

export interface CommentAwareAdapter<T extends string = string>
  extends ContentAdapter<T> {
  supportsCommenting: true;
  renderWithComments: (props: ItemViewProps<T> & {
    comments: UniversalComment[];
    onComment: (content: string) => void;
  }) => React.ReactNode;
}