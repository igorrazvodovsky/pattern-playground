// Custom element type declarations for web components
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-dropdown': {
        ref?: React.Ref<any>;
        placement?: string;
        open?: boolean;
        'onPp-show'?: () => void;
        'onPp-hide'?: () => void;
        children?: React.ReactNode;
        [key: string]: any;
      };
      'pp-list': {
        children?: React.ReactNode;
        [key: string]: any;
      };
      'pp-list-item': {
        type?: string;
        checked?: boolean;
        onClick?: () => void;
        children?: React.ReactNode;
        [key: string]: any;
      };
      'iconify-icon': {
        icon?: string;
        className?: string;
        slot?: string;
        [key: string]: any;
      };
      'pp-avatar': {
        size?: string;
        children?: React.ReactNode;
        [key: string]: any;
      };
    }
  }
}