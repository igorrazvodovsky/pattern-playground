import type {
  AttributeBinding,
  AttributeSelection,
  BoundEntity,
  EntityBinding,
  ItemScope,
} from '@shared/data/bindings';

export type ViewScope = ItemScope;

export type InteractionMode = 'preview' | 'inspect' | 'edit' | 'transform';

export type { BoundEntity };

/** The generic reference shape — the no-binding fallback contract, and what
    inline mentions carry for entity types without a binding of their own. */
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

export interface ItemInteractionProps {
  item: BoundEntity;
  /** The entity type — the key into the bindings map. */
  contentType: string;
  children: React.ReactNode;
  /** Applied to the inline trigger span — the consumer supplies the chrome
      (e.g. the reference-mention classes); the component supplies the behaviour. */
  className?: string;
  initialScope?: ViewScope;
  enableEscalation?: boolean;
  scopeConfig?: Partial<Record<ViewScope, ViewScopeConfig>>;
  onScopeChange?: (scope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: BoundEntity) => void;
}

export interface ItemViewProps {
  item: BoundEntity;
  /** The entity type — the key into the bindings map. */
  contentType: string;
  scope: ViewScope;
  mode?: InteractionMode;
  /** Overrides the binding's default attribute set for this scope — the
      detail-subtraction move (show everything the overview doesn't). Entries
      are paths or roles; 'all' shows the whole binding. */
  shownAttributes?: AttributeSelection;
  onEscalate?: (targetScope: ViewScope) => void;
  onInteraction?: (mode: InteractionMode, item: BoundEntity) => void;
}

/** Props a registered custom component receives for a `valueType: 'custom'`
    attribute — the behavioural residue a binding can't describe. */
export interface CustomAttributeProps {
  item: BoundEntity;
  entityType: string;
  attribute: AttributeBinding;
  scope: ViewScope;
  onInteraction?: (mode: InteractionMode, item: BoundEntity) => void;
}

/** Registry of custom components, keyed `entityType.path` ('task.history'). */
export type CustomComponents = Record<string, React.ComponentType<CustomAttributeProps>>;

export type { AttributeBinding, EntityBinding };
