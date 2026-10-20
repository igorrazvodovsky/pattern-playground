import type { Spec } from '@json-render/core';
import {
  getProductById,
  getProjectById,
  getQuoteById,
  getReferenceContentById,
  getUserById,
  referenceCategories,
} from '@shared/data';
import { bindings, referenceBinding } from '@shared/data/bindings';
import type { iconNames } from '../../catalog/catalog';
import type { SpecSetup } from '../../catalog/SpecDemo';
import type { MentionPart, Paragraph } from '../../catalog/registries/mention-editor';
import { matchesQuery, maxMentionMatches, mentionQuery, toMention } from './shared/mentions';
import { itemView } from './shared/product-view';
import spec from './reference.json' with { type: 'json' };

type Icon = (typeof iconNames)[number];
type Source = { kind: string; heading: string; keywords: string; icon: Icon | null; itemIcon: Icon | null; options: MentionPart[] };

// The icon for each kind, and for an item of that kind, named by meaning.
const kindIcons: Record<string, [Icon, Icon]> = {
  users: ['people', 'person'],
  documents: ['document', 'document'],
  projects: ['project', 'project'],
  quotes: ['quote', 'quote'],
  materials: ['material', 'material'],
  components: ['part', 'part'],
  products: ['product', 'product'],
  services: ['service', 'service'],
};

const sources: Source[] = referenceCategories.map(category => ({
  kind: category.id,
  heading: category.name,
  keywords: category.searchableText,
  icon: kindIcons[category.id]?.[0] ?? null,
  itemIcon: kindIcons[category.id]?.[1] ?? null,
  options: category.children.map(toMention),
}));

const withIcon = (source: Source) => (option: MentionPart) => ({ ...option, icon: source.itemIcon });

const finders: Record<string, (id: string) => object | undefined> = {
  user: getUserById,
  project: getProjectById,
  product: getProductById,
  quote: getQuoteById,
};

// The generic reference binding names a few metadata fields and shows the
// rest under `metadata`, one row per field.
const claimed = new Set(referenceBinding.attributes.map(attribute => attribute.path));

const detail = (mention: MentionPart) => {
  const binding = bindings[mention.type];
  const found = finders[mention.type]?.(mention.id);
  if (binding && found) return { name: mention.label, ...itemView('mid', binding)(found) };
  const item = referenceCategories.flatMap(category => category.children).find(child => child.id === mention.id);
  const fields = Object.entries(item?.metadata ?? {});
  return {
    name: mention.label,
    ...itemView('mid', referenceBinding)({
      label: mention.label,
      type: mention.type,
      ...Object.fromEntries(fields.filter(([key]) => claimed.has(key))),
      metadata: Object.fromEntries(fields.filter(([key]) => !claimed.has(key))),
    }),
  };
};

const allMentions = sources.flatMap(source => source.options);
const byId = new Map(allMentions.map(mention => [mention.id, mention]));

// A reference shows the item's current name, since the label stored in the
// note can be out of date.
type Node = { type: string; text?: string; content?: Node[]; attrs?: { id: string; label: string; type: string } };
const note = (getReferenceContentById('sustainability-meeting-content')?.content ?? { content: [] }) as Node;
const content: Paragraph[] = (note.content ?? []).map(paragraph =>
  (paragraph.content ?? []).map(node =>
    node.type === 'reference' && node.attrs
      ? (byId.get(node.attrs.id) ?? { id: node.attrs.id, label: node.attrs.label, type: node.attrs.type })
      : (node.text ?? ''),
  ),
);

const isSource = (value: unknown): value is Source =>
  typeof value === 'object' && value !== null && 'options' in value && Array.isArray(value.options);

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      content,
      query: null,
      scope: null,
      sources,
      opened: null,
      views: Object.fromEntries(allMentions.map(mention => [mention.id, detail(mention)])),
      detail: detail(allMentions[0]),
      detailOpen: false,
    },
    functions: {
      candidates: args => {
        const query = mentionQuery(args.query);
        const groups = (Array.isArray(args.sources) ? args.sources : []).filter(isSource);
        const named = matchesQuery(query);
        const scoped = groups.find(group => group.kind === args.scope);
        if (scoped)
          return [{ heading: scoped.heading, options: scoped.options.filter(named).map(withIcon(scoped)) }];
        const kinds = groups
          .filter(group => !query || group.keywords.split(' ').some(word => word.startsWith(query)))
          .map(group => ({ id: group.kind, label: group.heading, narrows: true as const, icon: group.icon }));
        if (!query) return [{ heading: null, options: kinds }];
        let left = maxMentionMatches;
        const items = groups.map(group => {
          const options = group.options.filter(named).slice(0, left).map(withIcon(group));
          left -= options.length;
          return { heading: group.heading, options };
        });
        return [{ heading: 'Kinds', options: kinds }, ...items];
      },
      view: args => {
        const views = (args.views ?? {}) as Record<string, unknown>;
        return typeof args.id === 'string' ? views[args.id] : undefined;
      },
    },
  } satisfies SpecSetup,
};
