import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};