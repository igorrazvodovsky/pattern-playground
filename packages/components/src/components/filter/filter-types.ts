/**
 * The pill UI speaks the shared filter vocabulary: one clause shape, one
 * operator union, defined with the entity bindings
 * (shared/data/bindings/filtering). Facet value lists live in
 * `filter-options`; which facets a view offers is the view's decision.
 */
export type { AttributeFilter as Filter, FilterOperator } from '@shared/data/bindings';
