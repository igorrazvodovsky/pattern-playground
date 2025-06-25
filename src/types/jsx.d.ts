import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        clearable?: boolean;
        autofocus?: boolean;
      };
      'pp-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      'pp-avatar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-table': React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      'pp-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        panel?: string | number;
        active?: boolean;
        disabled?: boolean;
        slot?: string;
      };
      'pp-tab-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string | number;
        active?: boolean;
      };
      'pp-tab-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        activation?: 'auto' | 'manual';
        'no-scroll-controls'?: boolean;
      };
      'pp-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'checkbox' | 'radio';
        disabled?: boolean;
        defaultChecked?: boolean;
      };
      'pp-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        open?: boolean;
        disabled?: boolean;
        placement?: string;
        hoist?: boolean;
      };
      'pp-popup': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        open?: boolean;
        placement?: string;
        distance?: number;
        skidding?: number;
      };
      'pp-p-plus': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-breadcrumbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        role?: string;
      };
      'pp-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        content?: string;
        placement?: string;
        disabled?: boolean;
      };
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        slot?: string;
      };
    }
  }
}