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

export interface ItemInteractionConfig<T extends BaseItem = BaseItem> {
  item: T;
  contentType: string;
  initialScope?: ViewScope;
  enableEscalation?: boolean;
  scopeConfig?: Partial<Record<ViewScope, ViewScopeConfig>>;
}