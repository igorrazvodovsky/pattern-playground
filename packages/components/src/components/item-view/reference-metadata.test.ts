import { describe, expect, test } from 'vitest';
import { referenceMetadataEntries } from './reference-metadata';

describe('referenceMetadataEntries', () => {
  test('leaves out what the binding names and reads lists as joined text', () => {
    const entries = referenceMetadataEntries({
      metadata: {
        description: 'Named by the binding',
        certification: ['ASI', 'LEED'],
        lastUpdated: '2024-01-15',
        dimensions: { width: 2 },
        empty: null,
      },
    });
    expect(entries).toEqual([
      { key: 'certification', label: 'Certification', text: 'ASI, LEED' },
      { key: 'lastUpdated', label: 'Last updated', text: '2024-01-15' },
      { key: 'dimensions', label: 'Dimensions', text: '{"width":2}' },
    ]);
  });

  test('an item without metadata has no entries', () => {
    expect(referenceMetadataEntries({})).toEqual([]);
  });
});
