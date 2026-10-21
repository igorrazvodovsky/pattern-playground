import {
  deriveAttributeLabel,
  isPlainRecord,
  referenceBinding,
  type LaidOutPair,
} from '@shared/data/bindings';

// The metadata fields the reference binding names, which show in their own
// places. The title and subtitle read the reference's own label and type, so
// a `type` in the metadata, such as a document's kind, stays.
const ownFields = new Set(['label', 'type', 'metadata']);
const claimed = new Set(
  referenceBinding.attributes
    .map((attribute) => attribute.path)
    .filter((path) => !ownFields.has(path)),
);

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
