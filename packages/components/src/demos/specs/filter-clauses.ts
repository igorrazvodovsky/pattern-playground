import {
  attributeLabelFromBinding,
  filterOperatorsFor,
  findAttribute,
  isNumericValueType,
  type AttributeFilter,
  type BoundEntity,
  type EntityBinding,
  type FilterOperator,
} from '@shared/data/bindings';
import type { FilterEdit } from '../../catalog/filter-edit';
import { getUniqueAttributeValues } from '../../templates/collection-view/FilterOperations';

// The filter conditions a spec's FilterTag chips edit, over one collection
// and its binding. Each condition offers the operators the filtering
// pattern's operator table gives its attribute and value count, and the
// values the attribute takes in the collection, as the filter bar lists them.
// A value picked or pressed is a value as shown, so a numeric attribute also
// offers the membership operators, which the matcher compares on the value
// as shown; the table offers only comparisons for it.

const NEGATING = new Set<FilterOperator>(['is not', 'do not include', 'exclude all of', 'exclude if any of']);
export const KEEPS: FilterOperator[] = ['is', 'is any of', 'include', 'include any of'];
const EXCLUDES: FilterOperator[] = ['is not', 'do not include', 'exclude if any of', 'exclude all of'];

export const filterClauses = (
  items: BoundEntity[],
  binding: EntityBinding,
  /** The values a condition on `path` can take, where the data records them rather than the collection. */
  optionsFor: (path: string) => string[] = path => getUniqueAttributeValues(items, path, binding),
) => {
  const operatorsFor = ({ path, values }: Pick<AttributeFilter, 'path' | 'values'>): FilterOperator[] => {
    const attribute = findAttribute(binding, path);
    const table = filterOperatorsFor(attribute, values);
    if (!attribute || !isNumericValueType(attribute.valueType)) return table;
    return [...((values.length > 1 ? ['is any of', 'is not'] : ['is', 'is not']) as FilterOperator[]), ...table];
  };

  /**
   * The operator a condition takes when its values change: its own while it
   * is still offered, else the offered one that says the same about the
   * values, keeping the items that have them or excluding them. One value is
   * stated as equality and several as alternatives.
   */
  const operatorAfter = (operator: FilterOperator, offered: FilterOperator[]) => {
    if (offered.includes(operator)) return operator;
    const same = NEGATING.has(operator) ? EXCLUDES : KEEPS;
    return same.find(candidate => offered.includes(candidate)) ?? offered[0] ?? operator;
  };

  /** A new condition keeping the items whose `path` shows `value`. */
  const keeping = (id: string, path: string, value: string): AttributeFilter => ({
    id,
    path,
    operator: operatorAfter('is', operatorsFor({ path, values: [value] })),
    values: [value],
  });

  /** One condition as its chip shows it. */
  const chip = (filter: AttributeFilter) => ({
    id: filter.id,
    label: attributeLabelFromBinding(binding, filter.path),
    // The binding names the attribute's icon by meaning, as the catalog does.
    icon: findAttribute(binding, filter.path)?.icon ?? null,
    operator: filter.operator,
    operators: operatorsFor(filter),
    values: filter.values,
    options: optionsFor(filter.path),
  });

  /**
   * The conditions with one chip's edit applied: a new operator, or a value
   * added or taken away. When the values change, the condition keeps what it
   * says about them (operatorAfter). A condition left with no values goes.
   */
  const applyEdit = ({ filters, id, edit }: Record<string, unknown>) => {
    const { kind, value } = (edit ?? {}) as Partial<FilterEdit>;
    return ((filters ?? []) as AttributeFilter[]).flatMap(filter => {
      if (filter.id !== id || value == null) return [filter];
      if (kind === 'operator') return [{ ...filter, operator: value as FilterOperator }];
      const values = kind === 'add' ? [...filter.values, value] : filter.values.filter(each => each !== value);
      if (values.length === 0) return [];
      return [{ ...filter, values, operator: operatorAfter(filter.operator, operatorsFor({ path: filter.path, values })) }];
    });
  };

  const removeFilter = ({ filters, id }: Record<string, unknown>) =>
    ((filters ?? []) as AttributeFilter[]).filter(filter => filter.id !== id);

  return { operatorsFor, operatorAfter, keeping, chip, applyEdit, removeFilter };
};
