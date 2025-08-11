import React from 'react';
import type { BaseItem, ViewScope } from '../types';
import { ItemView } from '../ItemView';
import { renderReactToHtmlString } from '../utils/render-to-string';

export interface ModalContentConfig {
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  placement?: 'center' | 'drawer-right' | 'drawer-left';
  closeOnEscape?: boolean;
}

export const createModalContent = (
  item: BaseItem,
  contentType: string,
  scope: ViewScope
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

export const createModalContentAsHtml = (
  item: BaseItem,
  contentType: string,
  scope: ViewScope
): string => {
  const content = createModalContent(item, contentType, scope);
  return renderReactToHtmlString(content);
};

export const getSizeForScope = (scope: ViewScope): ModalContentConfig['size'] => {
  switch (scope) {
    case 'mini': return 'small';
    case 'mid': return 'medium';
    case 'maxi': return 'large';
    default: return 'medium';
  }
};

export const getPlacementForScope = (scope: ViewScope): ModalContentConfig['placement'] => {
  switch (scope) {
    case 'mid': return 'drawer-right';
    case 'maxi': return 'center';
    default: return 'center';
  }
};