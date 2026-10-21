import type { AttributeBinding, AttributeSelection, EntityBinding, ItemScope } from './types';
import {
  attributeLabel,
  deriveAttributeLabel,
  formatBoundValue,
  getValueAtPath,
  resolveAttributeSelection,
  resolveEntityTitle,
} from './access';

/**
 * Where each shown attribute of one item lands at a scope, already formatted.
 * Every renderer of an item view reads these slots and maps them onto its own
 * parts, so the placement rules live here once.
 */

export interface LaidOutText {
  key: string;
  text: string;
}

export interface LaidOutPair extends LaidOutText {
  label: string;
}

/** A badge carries a label when it shows an attribute that is not a badge by
    role, which happens at mini, where rows read as labelled badges. */
export interface LaidOutBadge extends LaidOutText {
  label: string | null;
}

export interface ItemLayout {
  /** Whether the selection shows the title; a host that names the item
      itself leaves it out. */
  hasTitle: boolean;
  title: string;
  /** The raw value: an icon name or an image URL, read by the renderer. */
  thumbnail: unknown;
  badges: LaidOutBadge[];
  keyAttributes: LaidOutText[];
  subtitles: LaidOutText[];
  descriptions: LaidOutText[];
  captions: LaidOutText[];
  rows: LaidOutPair[];
  tags: LaidOutText[];
  /** Label and value as one line, such as "Listed 3 Oct 2026". */
  footers: LaidOutText[];
  /** `valueType: 'custom'` attributes, rendered by a registered component
      whether or not they hold a value. */
  customs: AttributeBinding[];
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);

/** A spec attribute resolving to a plain record gives one row per key, which
    is how a dynamic group like a product's `specifications` stays declarative. */
const rowsOf = (attribute: AttributeBinding, value: unknown): LaidOutPair[] =>
  isPlainRecord(value)
    ? Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => ({
          key: `${attribute.path}.${key}`,
          label: deriveAttributeLabel(key),
          text: formatBoundValue(entry, attribute),
        }))
    : [
        {
          key: attribute.path,
          label: attributeLabel(attribute),
          text: formatBoundValue(value, attribute),
        },
      ];

/**
 * Lay out an item at a scope. `selection` overrides the scope's default
 * attribute set; null or undefined keeps the default. Attributes with no
 * value are dropped. Micro keeps only the title and thumbnail, for an inline
 * token. Mini shows rows as labelled badges and leaves out captions and tags.
 * Mid and maxi show everything the selection names.
 */
export function layoutByRole(
  binding: EntityBinding,
  scope: ItemScope,
  item: unknown,
  selection?: AttributeSelection | null,
): ItemLayout {
  const shown = resolveAttributeSelection(binding, selection ?? binding.scopes[scope]);
  const present = shown.filter(
    (attribute) => attribute.valueType === 'custom' || getValueAtPath(item, attribute.path) != null,
  );
  const byRole = (role: AttributeBinding['role']) =>
    present.filter((attribute) => attribute.role === role && attribute.valueType !== 'custom');
  const read = (attribute: AttributeBinding) => getValueAtPath(item, attribute.path);
  const text = (attribute: AttributeBinding): LaidOutText => ({
    key: attribute.path,
    text: formatBoundValue(read(attribute), attribute),
  });

  const [thumbnail] = byRole('thumbnail');
  const layout: ItemLayout = {
    hasTitle: present.some((attribute) => attribute.role === 'title'),
    title: resolveEntityTitle(item, binding),
    thumbnail: thumbnail ? read(thumbnail) : undefined,
    badges: [],
    keyAttributes: [],
    subtitles: [],
    descriptions: [],
    captions: [],
    rows: [],
    tags: [],
    footers: [],
    customs: [],
  };
  if (scope === 'micro') return layout;

  const rows = [...byRole('spec'), ...byRole('link')].flatMap((attribute) =>
    rowsOf(attribute, read(attribute)),
  );
  const badges = byRole('badge').map((attribute) => ({ ...text(attribute), label: null }));

  return {
    ...layout,
    badges: scope === 'mini' ? [...badges, ...rows] : badges,
    keyAttributes: byRole('key-attribute').map(text),
    subtitles: byRole('subtitle').map(text),
    descriptions: byRole('description').map(text),
    captions: scope === 'mini' ? [] : byRole('caption').map(text),
    rows: scope === 'mini' ? [] : rows,
    tags:
      scope === 'mini'
        ? []
        : byRole('tag').flatMap((attribute) => {
            const value = read(attribute);
            return (Array.isArray(value) ? value : [value]).map((entry) => ({
              key: `${attribute.path}-${String(entry)}`,
              text: String(entry),
            }));
          }),
    footers: byRole('footer').map((attribute) => ({
      key: attribute.path,
      text: `${attributeLabel(attribute)} ${formatBoundValue(read(attribute), attribute)}`,
    })),
    customs: present.filter((attribute) => attribute.valueType === 'custom'),
  };
}
