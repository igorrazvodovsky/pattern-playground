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
import type { SpecSetup } from '../../catalog/SpecDemo';
import type { MentionPart, Paragraph } from '../../catalog/registries/mention-editor';
import { itemView } from './product-view';
import spec from './reference.json' with { type: 'json' };

// The spec is a meeting note that names people, a project, documents and a
// product as references. Typing @ offers the kinds of item, then the items of
// the kind picked; pressing a reference opens the item's detail in a drawer.
//
// Every referenceable item is laid out here at the detail rung, through its
// own kind's binding where it has one and the generic reference binding
// otherwise, so a product reads the same here as at the page's other rungs.
// Pressing a reference copies its view into `/detail`.

type Source = { kind: string; heading: string; keywords: string; options: MentionPart[] };

const sources: Source[] = referenceCategories.map(category => ({
  kind: category.id,
  heading: category.name,
  keywords: category.searchableText,
  options: category.children.map(item => ({ id: item.id, label: item.name, type: item.type })),
}));

const maxMatches = 8;

// The kinds whose entities have a binding of their own, and how to find one.
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

// The note as paragraphs of text and references. A reference shows the
// item's current name, which the stored note may have kept from earlier.
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
      // Two steps, as a picker over many kinds of item works: with nothing
      // typed after @, the kinds; picking one narrows the list to its items,
      // filtered by what is typed next. Typing before choosing a kind offers
      // the kinds whose names match, then matching items of every kind, up to
      // a handful.
      candidates: args => {
        const query = typeof args.query === 'string' ? args.query.trim().toLocaleLowerCase() : '';
        const groups = (Array.isArray(args.sources) ? args.sources : []).filter(isSource);
        const named = (label: string) => label.toLocaleLowerCase().includes(query);
        const scoped = groups.find(group => group.kind === args.scope);
        if (scoped) return [{ heading: scoped.heading, options: scoped.options.filter(option => named(option.label)) }];
        const kinds = groups
          .filter(group => !query || group.keywords.split(' ').some(word => word.startsWith(query)))
          .map(group => ({ id: group.kind, label: group.heading, narrows: true as const }));
        if (!query) return [{ heading: null, options: kinds }];
        let left = maxMatches;
        const items = groups.map(group => {
          const options = group.options.filter(option => named(option.label)).slice(0, left);
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
