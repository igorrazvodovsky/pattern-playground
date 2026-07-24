import React, { createContext, useContext, useMemo } from 'react';
import type { EntityBinding } from '@shared/data/bindings';
import { bindings as sharedBindings } from '@shared/data/bindings';
import type { CustomAttributeProps, CustomComponents } from './types';
import { defaultCustomComponents } from './custom-components';

/**
 * The item-view context, Meridian-style: entity bindings (declarative) and
 * custom components (the behavioural residue), looked up by entity type.
 *
 * The default value carries the shared bindings and the default registry, so
 * a host only mounts the provider to *extend* them — a demo-local entity
 * type, a story-specific component — never to get the standard behaviour.
 */

interface ItemViewContextValue {
  bindings: Record<string, EntityBinding>;
  customComponents: CustomComponents;
}

const defaultContextValue: ItemViewContextValue = {
  bindings: sharedBindings,
  customComponents: defaultCustomComponents,
};

const ItemViewContext = createContext<ItemViewContextValue>(defaultContextValue);

export interface ItemViewProviderProps {
  children: React.ReactNode;
  /** Merged over the shared bindings map. */
  bindings?: Record<string, EntityBinding>;
  /** Merged over the default registry, keyed `entityType.path`. */
  customComponents?: CustomComponents;
}

export const ItemViewProvider: React.FC<ItemViewProviderProps> = ({
  children,
  bindings,
  customComponents,
}) => {
  const parent = useContext(ItemViewContext);
  const value = useMemo(
    () => ({
      bindings: { ...parent.bindings, ...bindings },
      customComponents: { ...parent.customComponents, ...customComponents },
    }),
    [parent, bindings, customComponents]
  );
  return <ItemViewContext.Provider value={value}>{children}</ItemViewContext.Provider>;
};

export const useItemViewContext = (): ItemViewContextValue =>
  useContext(ItemViewContext);

export const useEntityBinding = (entityType: string): EntityBinding | undefined =>
  useContext(ItemViewContext).bindings[entityType];

export const useCustomComponent = (
  entityType: string,
  path: string
): React.ComponentType<CustomAttributeProps> | undefined =>
  useContext(ItemViewContext).customComponents[`${entityType}.${path}`];
