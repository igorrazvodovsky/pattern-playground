import { deriveAttributeLabel, referenceBinding, type LaidOutPair } from '@shared/data/bindings';

// The fields the reference binding names, which show in their own places.
const claimed = new Set(
  referenceBinding.attributes
    .map((attribute) => attribute.path)
    .filter((path) => path !== 'metadata'),
);

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Leftover reference metadata: whatever the binding's named entries didn't
    claim, so a material or service reference still shows its attributes.
    A list reads as its entries joined, as a bound list does. */
export const referenceMetadataEntries = (item: object): LaidOutPair[] => {
  const metadata = (item as { metadata?: Record<string, unknown> }).metadata;
  if (!metadata) return [];
  return Object.entries(metadata)
    .filter(([key, value]) => !claimed.has(key) && value != null)
    .map(([key, value]) => ({
      key,
      label: deriveAttributeLabel(key),
      text: Array.isArray(value)
        ? value.join(', ')
        : isPlainRecord(value)
          ? JSON.stringify(value)
          : String(value),
    }));
};
