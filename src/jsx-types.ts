// JSX type definitions for web components
// Import this file in any component that uses web components

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        clearable?: boolean;
        autocomplete?: string;
        autofocus?: boolean;
        type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time';
      };
      'pp-button': React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      'pp-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-avatar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-table': React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      'pp-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        panel?: string | number;
        active?: boolean;
        disabled?: boolean;
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
        type?: 'checkbox' | 'radio' | string;
        disabled?: boolean;
        defaultChecked?: boolean;
        checked?: boolean;
        onClick?: () => void;
      };
      'pp-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
        open?: boolean;
        disabled?: boolean;
        placement?: string;
        hoist?: boolean;
        'onPp-show'?: () => void;
        'onPp-hide'?: () => void;
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
      'pp-toast': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
        closable?: boolean;
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

export {};