import type { Spec } from '@json-render/core';
import { products } from '@shared/data';
import { applyFilters, findAttribute, productBinding, type AttributeFilter } from '@shared/data/bindings';
import type { Product } from '@shared/data/types';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { getAvailableAttributes } from '../../templates/collection-view/AttributeUtils';
import { sortItems } from '../../templates/collection-view/SortingUtils';
import { filterClauses, KEEPS } from './filter-clauses';
import { attributeLabel, cardAttributes } from './product-view';
import spec from './fluid-attributes.json' with { type: 'json' };

// Fluid attributes over an overview and its detail. The overview opens
// showing little beyond each item's name, category and price. Any attribute
// in the detail can be carried into every card by dragging its row onto the
// overview; the attributes menu is the same control without a drag, and lists
// what the cards carry, so clearing one takes it away again. What the actor
// surfaced can then be sorted by, and a value pressed on a card filters by it.
// Pressing another value of an attribute already filtered widens its clause
// to either value: one clause per attribute. Each clause is a chip the actor
// edits in place, as in the filter bar: its operator, and its values from
// those the attribute takes in the collection.
//
// Filtering uses the filtering pattern's own clause type and matcher, keyed
// on the attribute's path, so an attribute is filterable the moment it shows.
//
// Side by side, the detail sits beside the overview. When the Split has no
// room, picking a card opens the detail in a drawer that does not block the
// page, so a row can still be dragged from the drawer onto the overview. The
// drawer closes when the room returns and the detail goes back beside it.
//
// `/view` is what the actor chose: the attributes shown, the sort and the
// filters. A watch on it rewrites `/derived`, the cards in order and what the
// toolbar offers, because a repeat reads a list from state and a spec cannot
// filter or sort one. The cards can be sorted only by what they show: while
// the attribute the actor sorted by is hidden, they are sorted by name, and
// the chosen sort comes back with the attribute.

// A handful of items is enough to show the cards growing, and keeps the
// overview from taking over the page.
const CATALOGUE = products.slice(0, 7);

// What the actor can surface: everything but the name, which titles each
// card, and the description, which the detail already shows in full.
const SURFACEABLE = getAvailableAttributes(products).filter(path => path !== 'name' && path !== 'description');

const valuesOf = cardAttributes(SURFACEABLE);

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

interface View {
  shown: string[];
  sort: Sort;
  filters: AttributeFilter[];
}

const { operatorsFor, operatorAfter, keeping, chip, applyEdit, removeFilter } = filterClauses(CATALOGUE, productBinding);

// A date can be filtered only by a phrase or a boundary, never by the value
// as shown, so a date on a card is not pressable.
const pressable = (path: string) => findAttribute(productBinding, path)?.valueType !== 'date';

/** The cards in order, with the shown attributes each has, and what the toolbar offers. */
const derive = ({ view }: Record<string, unknown>) => {
  const { shown, sort, filters } = view as View;
  const matching: Product[] = applyFilters(CATALOGUE, filters, productBinding);
  const sortField = shown.includes(sort.field) ? sort.field : 'name';
  const ordered = sortItems(matching, sortField, sort.order);
  const cardOf = cardAttributes(shown);
  return {
    sortField,
    empty: ordered.length === 0,
    cards: ordered.map(item => ({
      id: item.id,
      name: item.name,
      attributes: cardOf(item).map(attribute => ({ ...attribute, pressable: pressable(attribute.path) })),
    })),
    sortFields: [{ path: 'name', label: 'Name' }, ...shown.map(path => ({ path, label: attributeLabel(path) }))],
    clauses: filters.map(chip),
  };
};

const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);

/** The shown attributes with `path` added, if it is not there already. */
const surface = ({ shown, path }: Record<string, unknown>) => {
  const current = list(shown);
  return typeof path !== 'string' || current.includes(path) ? current : [...current, path];
};

/** The shown attributes with `path` added, or taken away if it is there. */
const toggleShown = ({ shown, path }: Record<string, unknown>) => {
  const current = list(shown);
  return current.includes(String(path)) ? current.filter(each => each !== path) : [...current, String(path)];
};

/**
 * The filters narrowed by `value` on `path`. Pressing another value of an
 * attribute whose clause keeps items by their values widens that clause to
 * either value rather than replacing it: one clause per attribute, however
 * many presses. A clause that excludes values or compares them is replaced by
 * one that keeps the pressed value, since that is what the press asks for.
 */
const filterBy = ({ filters, path, value }: Record<string, unknown>) => {
  const current = (filters ?? []) as AttributeFilter[];
  const attribute = String(path);
  const shown = String(value);
  const existing = current.find(filter => filter.path === attribute);
  const fresh = () => keeping(attribute, attribute, shown);
  if (!existing) return [...current, fresh()];
  if (!KEEPS.includes(existing.operator)) return current.map(filter => (filter === existing ? fresh() : filter));
  if (existing.values.includes(shown)) return current;
  const values = [...existing.values, shown];
  return current.map(filter =>
    filter === existing ? { ...filter, values, operator: operatorAfter(filter.operator, operatorsFor({ path: attribute, values })) } : filter,
  );
};

const view: View = {
  shown: ['category', 'pricing.msrp'],
  sort: { field: 'name', order: 'asc' },
  filters: [],
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      products: CATALOGUE.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        rows: valuesOf(item).map(({ path, label, value }) => ({ id: path, label, value })),
      })),
      attributes: SURFACEABLE.map(path => ({ path, label: attributeLabel(path) })),
      view,
      derived: derive({ view }),
      selected: CATALOGUE[0].id,
      room: false,
      detailOpen: false,
      dropped: null,
      filterEdit: null,
    },
    functions: {
      // An action's `$item` names the item's path; inside `$computed` it is the value.
      value: ({ value }) => value,
      includes: ({ list: values, value }) => list(values).includes(String(value)),
      nameOf: ({ id }) => CATALOGUE.find(item => item.id === id)?.name ?? '',
      derive,
      surface,
      toggleShown,
      filterBy,
      applyEdit,
      removeFilter,
    },
  } satisfies SpecSetup,
};
