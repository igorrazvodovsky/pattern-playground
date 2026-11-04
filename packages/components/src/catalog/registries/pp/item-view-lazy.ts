import { lazy } from 'react';

// ItemView's custom components bring the comment thread and its editor, so
// they load with the first demo that shows an item, not with the registry
// every spec demo loads.

export const PpItemView = lazy(() => import('./item-view').then((m) => ({ default: m.ItemView })));
