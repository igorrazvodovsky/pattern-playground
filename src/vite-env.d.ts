/// <reference types="vite/client" />

import { DetailedHTMLProps, HTMLAttributes, ButtonHTMLAttributes, TableHTMLAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-input': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        clearable?: boolean;
        autofocus?: boolean;
      };
      'pp-button': DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      'pp-avatar': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-spinner': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-table': DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      'pp-tab': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        panel?: string | number;
        active?: boolean;
        disabled?: boolean;
        slot?: string;
      };
      'pp-tab-panel': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string | number;
        active?: boolean;
      };
      'pp-tab-group': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        activation?: 'auto' | 'manual';
        'no-scroll-controls'?: boolean;
      };
      'pp-list': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-list-item': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'checkbox' | 'radio';
        disabled?: boolean;
        defaultChecked?: boolean;
      };
      'pp-dropdown': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        open?: boolean;
        disabled?: boolean;
        placement?: string;
        hoist?: boolean;
      };
      'pp-popup': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        open?: boolean;
        placement?: string;
        distance?: number;
        skidding?: number;
      };
      'pp-p-plus': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-breadcrumbs': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        role?: string;
      };
      'pp-tooltip': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        content?: string;
        placement?: string;
        disabled?: boolean;
      };
      'iconify-icon': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        slot?: string;
      };
    }
  }
}
