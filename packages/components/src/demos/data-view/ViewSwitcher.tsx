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
      case 'card': return 'Card view';
      case 'list': return 'List view';
      case 'table': return 'Table view';
    }
  };

  return (
    <pp-dropdown>
      <button className="button" data-slot="trigger">
        <iconify-icon className="icon" icon={getViewIcon(currentView)}></iconify-icon>
        {getViewLabel(currentView)}
        <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
      </button>
      <pp-popup>
        <pp-list>
          <pp-list-item
            onClick={() => onViewChange('card')}
          >
            <iconify-icon data-slot="prefix" className="icon" icon="ph:squares-four"></iconify-icon>
            Card view
          </pp-list-item>
          {/* <pp-list-item
            onClick={() => onViewChange('list')}
          >
            <iconify-icon data-slot="prefix" className="icon" icon="ph:list"></iconify-icon>
            List
          </pp-list-item> */}
          <pp-list-item
            onClick={() => onViewChange('table')}
          >
            <iconify-icon data-slot="prefix" className="icon" icon="ph:table"></iconify-icon>
            Table view
          </pp-list-item>
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  );
};