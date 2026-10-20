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

// Filtering is keyed on the attribute's path, so an attribute is filterable
// the moment it shows. The narrow layout's drawer does not block the page, so
// a row can still be dragged from it onto the overview. A watch on `/view`
// rewrites `/derived` because a spec cannot filter or sort a list. While the
// sorted attribute is hidden, the rows sort by name.

// A handful keeps the overview from taking over the page.
const CATALOGUE = products.slice(0, 7);

// The name titles each row and the detail shows the description in full.
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
// as shown, so it is not pressable.
const pressable = (path: string) => findAttribute(productBinding, path)?.valueType !== 'date';

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

const surface = ({ shown, path }: Record<string, unknown>) => {
  const current = list(shown);
  return typeof path !== 'string' || current.includes(path) ? current : [...current, path];
};

const toggleShown = ({ shown, path }: Record<string, unknown>) => {
  const current = list(shown);
  return current.includes(String(path)) ? current.filter(each => each !== path) : [...current, String(path)];
};

// One clause per attribute: a clause that keeps items by their values widens
// to the pressed value; one that excludes or compares is replaced.
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
