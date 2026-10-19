import type { Spec } from '@json-render/core';
import Fuse from 'fuse.js';
import { nanoid } from 'nanoid';
import { products } from '@shared/data';
import {
  applyFilters,
  attributeLabelFromBinding,
  isNumericValueType,
  productBinding,
  resolveAttributeSelection,
  type AttributeFilter,
} from '@shared/data/bindings';
import type { Product } from '@shared/data/types';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { formatAttributeValue, getAttributeValue, getAvailableAttributes } from '../../templates/collection-view/AttributeUtils';
import { getUniqueAttributeValues } from '../../templates/collection-view/FilterOperations';
import { firstOfRole, isIdentity } from '../../templates/collection-view/renderers/shared';
import { sortItems } from '../../templates/collection-view/SortingUtils';
import {
  applySpecPatch,
  groupItems,
  isAxisMalleable,
  makeSpec,
  type MakeSpecOptions,
  type MalleabilityBlock,
  type ViewSpec,
} from '../../templates/collection-view/spec';
import { filterClauses } from './filter-clauses';
import spec from './data-view.json' with { type: 'json' };

// A data view over the product collection: the same items framed by a query
// (which items), a representation (cards or a table) and an arrangement
// (sorted and grouped by what). The toolbar edits the framing: the filter
// adds and edits conditions of the query, the switcher changes the
// representation, sort and group change the arrangement, and the attributes
// menu changes what each item shows.
//
// `/view` is the framing as one object, the collection template's ViewSpec,
// so a saved view is that object swapped whole. A watch on it rewrites
// `/derived`, the items in order and grouped, laid out for the
// representation in force, and what the toolbar offers, because a repeat
// reads a list from state and a spec cannot filter, sort or group one.
//
// The pattern pages that show one move of the framing (sorting, grouping)
// embed the same view with the other controls left out. A control the
// framing does not allow is left out too: `controls` is the designer's say
// over the toolbar, kept as the framing's malleability block, so a framing
// that cannot be changed is still a framing.

const PRODUCTS = products as Product[];
const AVAILABLE = getAvailableAttributes(PRODUCTS);

// Attributes that cluster the collection into a few legible groups.
const GROUPABLE = ['lifecycle.repairability', 'category', 'availability.status'];

// The attributes a filter is built on, and so the ones the filter field
// offers: a view decision, not a binding field.
const FILTERABLE = [
  'category',
  'availability.status',
  'lifecycle.repairability',
  'lifecycle.upgradeability',
  'pricing.msrp',
  'sustainability.certifications',
  'availability.regions',
  'availability.channels',
];

const label = (path: string) => attributeLabelFromBinding(productBinding, path);
const show = (item: Product, path: string) => formatAttributeValue(getAttributeValue(item, path), path, productBinding);

export interface DataViewControls {
  /** A menu of saved views, each a whole framing. */
  views?: boolean;
  viewSwitcher?: boolean;
  search?: boolean;
  filter?: boolean;
  attributes?: boolean;
  sort?: boolean;
  group?: boolean;
}

/** The controls a designer turned off, as the framing's malleability. Search is a control, not an axis. */
const malleabilityOf = (controls: DataViewControls): MalleabilityBlock | undefined => {
  const block: MalleabilityBlock = {};
  if (controls.filter === false) block.query = { disabled: true };
  if (controls.viewSwitcher === false) block.representation = { disabled: true };
  if (controls.attributes === false) block.content = { disabled: true };
  if (controls.sort === false && controls.group === false) block.arrangement = { disabled: true };
  return Object.keys(block).length > 0 ? block : undefined;
};

const search = (items: Product[], query: string) => {
  if (!query.trim()) return items;
  const fuse = new Fuse(items, {
    threshold: 0.3,
    keys: [
      { name: 'name', weight: 0.5 },
      { name: 'description', weight: 0.3 },
      { name: 'searchableText', weight: 0.2 },
    ],
  });
  return fuse.search(query).map(result => result.item);
};

const emptyMessage = (query: string, filtered: boolean) => {
  if (query && filtered) return `No products match “${query}” with the current filters. Try changing the search or the filters.`;
  if (query) return `No products match “${query}”. Try other words.`;
  if (filtered) return 'No products match the current filters. Try changing them.';
  return 'No products found.';
};

const { keeping, chip, applyEdit, removeFilter } = filterClauses(PRODUCTS, productBinding);

/** Everything the spec shows of the framing, worked out from it. */
const deriveWith = (controls: DataViewControls) => ({ view, query }: Record<string, unknown>) => {
  const framing = view as ViewSpec;
  const typed = typeof query === 'string' ? query : '';
  const shown = framing.representation.shownAttributes;
  const resolved = resolveAttributeSelection(productBinding, shown);
  const { sortBy, groupBy } = framing.arrangement;

  const matching = applyFilters(search(PRODUCTS, typed), framing.query, productBinding);
  const ordered = sortBy ? sortItems(matching, sortBy.field, sortBy.order) : matching;

  // A card as the collection template draws it: the title and description by
  // role, and every other shown attribute as a labelled badge.
  const title = firstOfRole(resolved, 'title');
  const description = firstOfRole(resolved, 'description');
  const badges = resolved.filter(attribute => !isIdentity(attribute));
  const cardOf = (item: Product) => ({
    id: item.id,
    name: title ? show(item, title.path) : null,
    description: description ? show(item, description.path) : '',
    attributes: badges.map(attribute => ({ label: label(attribute.path), value: show(item, attribute.path) })),
  });

  // A table puts the identity columns first, and sets figures on the right.
  const columns = [...resolved.filter(isIdentity), ...resolved.filter(attribute => !isIdentity(attribute))];
  const alignOf = (path: string) =>
    isNumericValueType(columns.find(column => column.path === path)!.valueType) ? 'end' : null;
  const rowOf = (item: Product) => ({
    id: item.id,
    cells: columns.map(column => ({ text: show(item, column.path), align: alignOf(column.path) })),
  });

  const groupOf = (key: string, items: Product[]) => ({
    key,
    count: String(items.length),
    cards: items.map(cardOf),
    rows: items.map(rowOf),
  });
  const groups = groupBy
    ? [...groupItems(ordered, groupBy, productBinding)].map(([key, items]) => groupOf(key, items))
    : [groupOf('', ordered)];

  const allowed = (axis: Parameters<typeof isAxisMalleable>[1]) => isAxisMalleable(framing, axis);
  const sortField = sortBy?.field ?? 'name';

  return {
    show: {
      views: controls.views === true,
      viewSwitcher: controls.viewSwitcher !== false && allowed('representation'),
      search: controls.search !== false && allowed('query'),
      filter: controls.filter !== false && allowed('query'),
      attributes: controls.attributes !== false && allowed('content'),
      sort: controls.sort !== false && allowed('arrangement'),
      group: controls.group !== false && allowed('arrangement'),
    },
    as:
      framing.representation.type === 'table' ? 'table' : framing.arrangement.layout === 'list' ? 'list' : 'cards',
    grouped: Boolean(groupBy),
    groupBy: groupBy ?? '',
    groups,
    columns: columns.map(column => ({ label: label(column.path), align: alignOf(column.path) })),
    noAttributes: shown.length === 0,
    empty: shown.length > 0 && ordered.length === 0,
    emptyMessage: emptyMessage(typed, framing.query.length > 0),
    // What the items can be sorted by: the name and what they show, and the
    // sort in force even if the attribute it reads is no longer shown.
    sortField,
    sortOrder: sortBy?.order ?? 'asc',
    sortFields: [...new Set(['name', ...shown.filter(path => path !== 'description'), sortField])].map(path => ({
      path,
      label: path === 'name' ? 'Name' : label(path),
    })),
    filtered: framing.query.length > 0,
    clauses: framing.query.map(chip),
  };
};

const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);
const framing = (view: unknown) => view as ViewSpec;

/**
 * What the filter field offers for what has been typed. Outside an
 * attribute, the attributes whose names match, each of which narrows the
 * field to its values, and from two letters on the values themselves, under
 * their attribute's name. Within an attribute, its values that match.
 */
const candidates = ({ query, scope }: Record<string, unknown>) => {
  const typed = String(query ?? '').trim().toLowerCase();
  const matches = (text: string) => text.toLowerCase().includes(typed);
  const valuesOf = (path: string) =>
    getUniqueAttributeValues(PRODUCTS, path, productBinding).map(value => ({
      value: JSON.stringify([path, value]),
      label: value,
      narrows: null,
    }));
  if (typeof scope === 'string' && scope !== '') {
    return [{ heading: label(scope), options: valuesOf(scope).filter(option => matches(option.label)) }];
  }
  return [
    {
      heading: 'Attributes',
      options: FILTERABLE.filter(path => matches(label(path))).map(path => ({ value: path, label: label(path), narrows: true })),
    },
    {
      heading: 'Values',
      options:
        typed.length < 2
          ? []
          : FILTERABLE.flatMap(path =>
              valuesOf(path)
                .filter(option => matches(option.label) || matches(label(path)))
                .map(option => ({ ...option, label: `${label(path)}: ${option.label}` })),
            ),
    },
  ];
};

export function dataViewDemo({
  view,
  controls = {},
  saved = [],
}: {
  view: Omit<MakeSpecOptions, 'id' | 'malleability'>;
  controls?: DataViewControls;
  /** Saved views offered in a menu, each a whole framing. The first is where the demo starts. */
  saved?: ViewSpec[];
}) {
  const derive = deriveWith(controls);
  const start = saved[0] ?? makeSpec({ id: 'data-view', ...view, malleability: malleabilityOf(controls) });
  const savedById = (id: unknown) => saved.find(candidate => candidate.id === id) ?? start;

  return {
    spec: spec as Spec,
    setup: {
      initialState: {
        view: start,
        query: '',
        derived: derive({ view: start, query: '' }),
        attributes: AVAILABLE.map(path => ({ path, label: label(path) })),
        groupable: [{ path: '', label: 'No grouping' }, ...GROUPABLE.map(path => ({ path, label: label(path) }))],
        saved: saved.map(({ id, label: name }) => ({ id, label: name ?? id })),
        activeView: start.id,
        // The titles of the groups the actor closed.
        closed: [],
        filterOpen: false,
        filterQuery: '',
        filterScope: null,
        filterEdit: null,
      },
      functions: {
        // An action's `$item` names the item's path; inside `$computed` it is the value.
        value: ({ value }) => value,
        includes: ({ list: values, value }) => list(values).includes(String(value)),
        excludes: ({ list: values, value }) => !list(values).includes(String(value)),
        toggleIn: ({ list: values, value }) => {
          const current = list(values);
          return current.includes(String(value)) ? current.filter(each => each !== value) : [...current, String(value)];
        },
        derive,
        candidates,
        placeholder: ({ scope }) => (typeof scope === 'string' && scope !== '' ? `${label(scope)}…` : 'Filter products…'),
        savedView: ({ id }) => savedById(id),
        savedLabel: ({ id }) => savedById(id).label ?? '',
        representAs: ({ view: current, as }) =>
          applySpecPatch(framing(current), {
            representation: { type: as === 'table' ? 'table' : 'card' },
            arrangement: { layout: as === 'list' ? 'list' : 'grid' },
          }),
        sortBy: ({ view: current, field }) => {
          const order = framing(current).arrangement.sortBy?.order ?? 'asc';
          return applySpecPatch(framing(current), { arrangement: { sortBy: { field: String(field), order } } });
        },
        sortOrder: ({ view: current, order }) => {
          const field = framing(current).arrangement.sortBy?.field ?? 'name';
          return applySpecPatch(framing(current), {
            arrangement: { sortBy: { field, order: order === 'desc' ? 'desc' : 'asc' } },
          });
        },
        groupBy: ({ view: current, path }) => {
          const by = typeof path === 'string' && path !== '' ? path : undefined;
          return applySpecPatch(framing(current), {
            arrangement: { groupBy: by, groupLayout: by ? 'sections' : undefined },
          });
        },
        toggleAttribute: ({ view: current, path }) => {
          const shown = framing(current).representation.shownAttributes;
          const next = shown.includes(String(path)) ? shown.filter(each => each !== path) : [...shown, String(path)];
          return applySpecPatch(framing(current), { representation: { shownAttributes: next } });
        },
        /** The framing with a condition added for the value the filter field picked. */
        addFilter: ({ view: current, picked }) => {
          const [path, value] = JSON.parse(String(picked)) as [string, string];
          const query: AttributeFilter[] = [...framing(current).query, keeping(nanoid(), path, value)];
          return applySpecPatch(framing(current), { query });
        },
        editFilter: ({ view: current, id, edit }) =>
          applySpecPatch(framing(current), {
            query: applyEdit({ filters: framing(current).query, id, edit }) as AttributeFilter[],
          }),
        removeFilter: ({ view: current, id }) =>
          applySpecPatch(framing(current), {
            query: removeFilter({ filters: framing(current).query, id }) as AttributeFilter[],
          }),
        clearFilters: ({ view: current }) => applySpecPatch(framing(current), { query: [] }),
      },
    } satisfies SpecSetup,
  };
}

export default dataViewDemo({
  view: {
    representation: {
      type: 'table',
      shownAttributes: ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
    },
    arrangement: { sortBy: { field: 'name', order: 'asc' } },
  },
});
