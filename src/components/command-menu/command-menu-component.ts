import React from 'react';
import ReactDOM from 'react-dom/client'; // or 'react-dom' for React 17
import reactToWebComponent from 'react-to-webcomponent';
import CommandMenu from './command-menu';

export const PpCommandMenu = reactToWebComponent(CommandMenu, React, ReactDOM);
customElements.define('pp-command-menu', PpCommandMenu);

declare global {
  interface HTMLElementTagNameMap {
    "pp-command-menu": typeof PpCommandMenu;
  }
}
