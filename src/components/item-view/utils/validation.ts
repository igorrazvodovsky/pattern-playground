import type { ViewScope, InteractionMode, ContentAdapter, BaseItem } from '../types';

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
  
  // Validate supported scopes if provided
  if (adapter.supportedScopes) {
    if (!Array.isArray(adapter.supportedScopes)) {
      throw new Error('ContentAdapter.supportedScopes must be an array');
    }
    
    const invalidScopes = adapter.supportedScopes.filter(scope => !validateScope(scope));
    if (invalidScopes.length > 0) {
      throw new Error(`ContentAdapter has invalid scopes: ${invalidScopes.join(', ')}`);
    }
  }
};