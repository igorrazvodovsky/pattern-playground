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

const NEGATING = new Set<FilterOperator>(['is not', 'do not include', 'exclude all of', 'exclude if any of']);
export const KEEPS: FilterOperator[] = ['is', 'is any of', 'include', 'include any of'];
const EXCLUDES: FilterOperator[] = ['is not', 'do not include', 'exclude if any of', 'exclude all of'];

export const filterClauses = (
  items: BoundEntity[],
  binding: EntityBinding,
  /** The values a condition on `path` can take, where the data records them rather than the collection. */
  optionsFor: (path: string) => string[] = path => getUniqueAttributeValues(items, path, binding),
) => {
  // A value picked or pressed is a value as shown, so a numeric attribute also
  // offers the membership operators, which the operator table leaves out.
  const operatorsFor = ({ path, values }: Pick<AttributeFilter, 'path' | 'values'>): FilterOperator[] => {
    const attribute = findAttribute(binding, path);
    const table = filterOperatorsFor(attribute, values);
    if (!attribute || !isNumericValueType(attribute.valueType)) return table;
    return [...((values.length > 1 ? ['is any of', 'is not'] : ['is', 'is not']) as FilterOperator[]), ...table];
  };

  // When the values change, a condition keeps its operator while it is still
  // offered, else takes the offered one that says the same about the values.
  const operatorAfter = (operator: FilterOperator, offered: FilterOperator[]) => {
    if (offered.includes(operator)) return operator;
    const same = NEGATING.has(operator) ? EXCLUDES : KEEPS;
    return same.find(candidate => offered.includes(candidate)) ?? offered[0] ?? operator;
  };

  const keeping = (id: string, path: string, value: string): AttributeFilter => ({
    id,
    path,
    operator: operatorAfter('is', operatorsFor({ path, values: [value] })),
    values: [value],
  });

  const chip = (filter: AttributeFilter) => ({
    id: filter.id,
    label: attributeLabelFromBinding(binding, filter.path),
    icon: findAttribute(binding, filter.path)?.icon ?? null,
    operator: filter.operator,
    operators: operatorsFor(filter),
    values: filter.values,
    options: optionsFor(filter.path),
  });

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
