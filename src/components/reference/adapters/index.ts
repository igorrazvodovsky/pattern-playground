// Modern re-exports with explicit type exports
export { 
  ReferencePreviewAdapter,
  type ReferencePreviewAdapterProps 
} from './ReferencePreviewAdapter';

export { 
  ReferenceDetailAdapter,
  type ReferenceDetailAdapterProps 
} from './ReferenceDetailAdapter';

export { 
  ReferenceFullViewAdapter,
  type ReferenceFullViewAdapterProps 
} from './ReferenceFullViewAdapter';

// Modern adapter registry using const assertions
export const REFERENCE_ADAPTERS = {
  preview: 'ReferencePreviewAdapter',
  detail: 'ReferenceDetailAdapter',
  fullView: 'ReferenceFullViewAdapter'
} as const;

export type ReferenceAdapterType = typeof REFERENCE_ADAPTERS[keyof typeof REFERENCE_ADAPTERS];