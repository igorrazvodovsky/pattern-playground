import React from 'react';
import type { ContentAdapter } from '../item-view/types';
import { ReferencePreviewAdapter } from './adapters/ReferencePreviewAdapter';
import { ReferenceDetailAdapter } from './adapters/ReferenceDetailAdapter';
import { ReferenceFullViewAdapter } from './adapters/ReferenceFullViewAdapter';

export const referenceContentAdapter: ContentAdapter<'reference'> = {
  contentType: 'reference',
  render: (props) => {
    const AdapterComponent = (() => {
      switch (props.scope) {
        case 'mini':
          return ReferencePreviewAdapter;
        case 'mid':
          return ReferenceDetailAdapter;
        case 'maxi':
          return ReferenceFullViewAdapter;
        default:
          return null;
      }
    })();

    if (!AdapterComponent) return null;

    return <AdapterComponent {...props} />;
  },
};