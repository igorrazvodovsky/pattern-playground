import React from 'react';
import { ViewSwitcherProps, ViewMode } from './types';

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
  const getViewIcon = (view: ViewMode) => {
    switch (view) {
      case 'card': return 'ph:squares-four';
      case 'list': return 'ph:list';
      case 'table': return 'ph:table';
    }
  };

  const getViewLabel = (view: ViewMode) => {
    switch (view) {
      case 'card': return 'Cards';
      case 'list': return 'List';
      case 'table': return 'Table';
    }
  };

  return (
    <pp-dropdown>
      <button className="button" is="pp-button" slot="trigger">
        <iconify-icon className="icon" icon={getViewIcon(currentView)}></iconify-icon>
        {getViewLabel(currentView)}
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-list>
        <pp-list-item
          onClick={() => onViewChange('card')}
        >
          <iconify-icon slot="prefix" className="icon" icon="ph:squares-four"></iconify-icon>
          Cards
        </pp-list-item>
        {/* <pp-list-item
          onClick={() => onViewChange('list')}
        >
          <iconify-icon slot="prefix" className="icon" icon="ph:list"></iconify-icon>
          List
        </pp-list-item> */}
        <pp-list-item
          onClick={() => onViewChange('table')}
        >
          <iconify-icon slot="prefix" className="icon" icon="ph:table"></iconify-icon>
          Table
        </pp-list-item>
      </pp-list>
    </pp-dropdown>
  );
};