---
title: "Binding-driven filtering"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-24"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Binding-driven filtering

Outline — needs an iteration pass before execution.

Extend the Meridian principle to the query axis: any attribute of any entity
type is filterable through its binding, and no filter vocabulary names an
entity type. This is the residue the item-view and collection-view reshapes
left standing.

## The two residues

- `templates/collection-view/FilterTypes.ts` — `ProductFilterType`, a
  product-flavoured facet enum. Every member is an attribute path wearing an
  enum costume (`CATEGORY` → 'category', `PRICE_RANGE` → 'pricing.msrp'), and
  the generic path-keyed branch beside it (`itemMatchesAttributeFilter`)
  already does the actual work for any bound entity. The enum carries two
  things the path branch lacks: a curated icon
  (`PRODUCT_FILTER_TYPE_ICONS`) and an operator set.
- `components/filter/filter-types.ts` — the task-flavoured twin used by the
  command-menu filtering UI (`demos/filtering.tsx`, `FilterControls`,
  `ProductFilters`). Harder-coded still: `Status`, `Priority`, `Labels` are
  value snapshots, and `Assignee` freezes people's names into an enum — data
  masquerading as types. Values like these live in `shared/data`
  (users.json, statuses.json) and should be read, not declared.

## Target model

- One filter shape in the template: `{ id, path, operator, values }`. The
  path resolves against the entity binding; `type` as a facet enum dies.
- Operator sets derive from the attribute's `valueType`:
  string/status → is, is not, is any of; number/currency/progress → less
  than, greater than, between; date → before, after; array-valued → include,
  do not include, include all/any of. One table, in the template beside the
  spec — behaviour, not per-type code.
- Facet presentation moves into the binding: `AttributeBinding` gains an
  optional `icon`. A filterable facet is any binding attribute (plus dynamic
  paths, matched as displayed — the existing behaviour); curated value lists
  come from data (`getUniqueAttributeValues`) or the status registries.
- `components/filter`'s pill UI stays; its data model becomes the shape
  above. The person/status/label enums are replaced by reads from
  shared/data.

## Order

1. Template side: generic filter shape + operator table; migrate
   `FilterOperations`/`FilterTypes` consumers (`useProductFiltering`,
   `FluidAttributesDemo`, `ProductFilters`, `FilterCategories`,
   `aiFilterAdapter`); delete `ProductFilterType`.
2. Component side: re-key `components/filter` off the task binding and
   shared/data values; sweep `demos/filtering.tsx` and the command-menu
   filter demos.
3. Prove on a second entity type in the CollectionView story (a task filter
   through the same UI).

## Open questions

- Does `FilterCategories`' AI-command integration (`aiFilterAdapter`)
  constrain the filter shape, or does it just relabel it?
- Date facets ("in the past", "1 week from now") are relative predicates,
  not values — do they become a `valueType: 'date'` operator family or stay
  a curated list?
- Where does the operator table live so both the pill UI and the template
  read one copy?
