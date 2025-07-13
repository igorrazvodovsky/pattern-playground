import type { ContentAdapter } from '../item-view/types';
import type { SelectedReference } from './types';
import { ReferencePreviewAdapter } from './adapters/ReferencePreviewAdapter';
import { ReferenceDetailAdapter } from './adapters/ReferenceDetailAdapter';
import { ReferenceFullViewAdapter } from './adapters/ReferenceFullViewAdapter';

/**
 * Content adapter for reference items
 * Routes different view scopes to appropriate adapters
 */
export const referenceContentAdapter: ContentAdapter<SelectedReference> = {
  contentType: 'reference',
  render: (props) => {
    const { scope } = props;
    
    switch (scope) {
      case 'mini':
        return <ReferencePreviewAdapter {...props} />;
      case 'mid':
        return <ReferenceDetailAdapter {...props} />;
      case 'maxi':
        return <ReferenceFullViewAdapter {...props} />;
      default:
        return null;
    }
  },
};