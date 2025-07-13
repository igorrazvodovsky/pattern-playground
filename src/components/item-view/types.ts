export type ViewScope = 'micro' | 'mini' | 'mid' | 'maxi';

export type InteractionMode = 'preview' | 'inspect' | 'edit' | 'transform';

export interface BaseItem {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface ViewScopeConfig {
  scope: ViewScope;
  trigger?: 'hover' | 'click' | 'focus' | 'keydown';
  delay?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  mode?: InteractionMode;
}

export interface ItemInteractionProps<T extends BaseItem = BaseItem> {
  item: T;
  contentType: string;
  children: React.ReactNode;
  initialScope?: ViewScope;
  enableEscalation?: boolean;
  scopeConfig?: Partial<Record<ViewScope, ViewScopeConfig>>;
  onScopeChange?: (scope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: T) => void;
}

export interface ItemViewProps<T extends BaseItem = BaseItem> {
  item: T;
  contentType: string;
  scope: ViewScope;
  mode?: InteractionMode;
  onEscalate?: (targetScope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: T) => void;
}

export interface ContentAdapter<T extends BaseItem = BaseItem> {
  contentType: string;
  render: (props: ItemViewProps<T>) => React.ReactNode;
}