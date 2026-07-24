---
title: "Binding-driven filtering"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-25"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Binding-driven filtering

Extend the Meridian principle to the query axis: any attribute of any entity
type is filterable through its binding, and no filter vocabulary names an
entity type. This is the residue the item-view and collection-view reshapes
left standing.

## The two residues

- `templates/collection-view/FilterTypes.ts` — `ProductFilterType`, a
  product-flavoured facet enum. Every member is an attribute path wearing an
  enum costume, and the evaluation behind it
  (`FilterOperations.productMatchesFilter`) forks on `isProductFilterType`:
  the enum branch reads `product.metadata.*` directly — hardcoded paths,
  raw string compares, no binding lookup at all — while the path branch
  beside it (`itemMatchesAttributeFilter`) already resolves and formats
  through the binding for any bound entity. The enum carries three things
  the path branch lacks: a curated icon (`PRODUCT_FILTER_TYPE_ICONS`), a
  per-member operator set (`ProductFilterOperatorDropdown.
  getProductFilterOperators`), and typed comparison (`parseFloat` for
  price). One member reads a path the binding doesn't even declare:
  `availability.channels`.
- `components/filter/filter-types.ts` — the task-flavoured twin behind the
  pill UI (`demos/filtering.tsx`, the only real consumer; rendered by
  `filtering.mdx` alone). `Status`, `Priority`, `Labels`, `DueDate` are
  value snapshots of `statuses.json`, `priorities.json`, `labels.json`,
  `filter-dates.json` — which already carry icons the `FilterIcon` switch
  re-declares by hand. `Assignee` is worse than a snapshot: it's divergent —
  the pill options are built from `users.json` at runtime and those names
  don't match the enum's, so every `as Assignee` cast in
  `filter-options.tsx` is a lie. Only `NO_ASSIGNEE` is used as a value.
  Nothing on this side evaluates data: the pills are chips, and the
  relative-date phrases ("in the past", "1 week from now") are compared
  only as literal strings to pick an operator set.

## Target model

One filter shape, one operator table, one matcher — living with the
bindings, since that is the vocabulary they're written in.

- `shared/data/bindings/filtering.ts` (new, exported through the bindings
  barrel):
  - `AttributeFilter = { id: string; path: string; operator: FilterOperator;
    values: string[] }`. The path resolves against the entity binding;
    `type` as a facet enum dies. Dynamic paths outside the binding stay
    legal and keep the existing behaviour — matched on the value as
    displayed.
  - `FilterOperator` — a string-literal union, the superset both UIs offer
    today minus the redundant `"="`: is, is not, is any of, include,
    do not include, include all of, include any of, exclude all of,
    exclude if any of, before, after, less than, greater than, between.
  - `filterOperatorsFor(attribute)` — the operator table, keyed on the
    attribute's `valueType` and cardinality: string/status → is / is not /
    is any of; number/currency/progress → less than / greater than /
    between; date → before / after; array-valued → the include/exclude
    family. Behaviour, not per-type code; both dropdowns read this one
    copy.
  - `matchesFilter(entity, filter, binding)` — typed comparison on the raw
    value from `getValueAtPath`: numeric compare for
    number/currency/progress (`between` gets a real two-value case at
    last), date compare for date, membership otherwise. Paths outside the
    binding fall back to formatted-string equality.
- `AttributeBinding` gains two optional fields:
  - `icon?: string` — facet presentation moves into the binding;
    `PRODUCT_FILTER_TYPE_ICONS` folds into `product.ts` entries.
  - `many?: true` — the value is a list (certifications, regions, channels,
    labels). Cardinality is what actually picks the operator family today
    and `valueType` can't express it.
- Relative dates become real. The phrases in `filter-dates.json` are the
  curated value list for `valueType: 'date'` facets; a resolver beside the
  matcher maps phrase → timestamp so `before` / `after` compare actual
  dates. Today no code anywhere evaluates them — making the task demo
  filter for real is part of the point.
- Which facets a given filter UI offers stays a view decision — a plain
  list of paths in the demo or spec, not a binding field. The binding
  supplies each facet's label, icon, operators, and (via
  `getUniqueAttributeValues` or the shared/data registries) its values.
- `aiFilterAdapter` just relabels: its value map becomes
  `Record<string, string[]>` keyed by path, suggestions come out as
  `{ path, operator: 'is', values }`. Nothing in it constrains the shape.

## Order

1. *Binding prep.* Add `filtering.ts`; widen `AttributeBinding` with
   `icon` / `many`; give `productBinding` the eight curated icons, `many`
   on certifications/regions, and the missing `availability.channels`
   entry; give `taskBinding` the attributes the pill facets need —
   `priority.label` (badge/status) and `labels` (tag, `many`) are absent
   today (hydrated tasks already carry them: `transformTasksData` resolves
   status/priority/assignee/labels into rich objects).
2. *Template side.* Rewrite `FilterOperations` around `matchesFilter` —
   the enum branch and `getUniqueFilterValues` die; `spec.ts`'s
   `FilterClause` becomes `AttributeFilter`. Migrate the data-view demo
   ring: `useProductFiltering`, `FilterCategories` (its two generators —
   enum-keyed and path-keyed — collapse into one binding-driven one),
   `ProductFilters`, `ProductFilterOperatorDropdown` (per-member sets →
   `filterOperatorsFor`), `ProductFilterValueDropdown`, `FilterControls`,
   `useFilterState`, `aiFilterAdapter`, `DataView`, `types.ts`, and the
   fixture specs in `slices.tsx` / `SavedViewsDemo`. `FluidAttributesDemo`
   only renames (`type` → `path`, `value` → `values`). Delete
   `FilterTypes.ts` and the `ProductFilterTypes` barrel.
3. *Component side.* Re-key `components/filter` off paths + shared/data:
   `filter-options.tsx` drops the enum casts and reads
   `filterStatuses`/`filterPriorities`/`filterLabels`/`filterDates`/`users`
   as they are; the `FilterIcon` switch yields to the icons those records
   already carry; `filter-constants` + `filter-operator-logic` yield to
   `filterOperatorsFor` over the task binding; `filtering.tsx` builds its
   default filters from data (the divergent Assignee names go); the six
   enums die and `filter-types.ts` shrinks to re-exports of the shared
   shape. Sweep `demos/filtering.tsx`; command-menu needs nothing
   (`CommandMenu.tsx` never touches filter-types).
4. *Prove it.* A second entity type through the same machinery: task
   filters in the CollectionView story — status, assignee, labels,
   priority, and a dueDate filter that actually evaluates a relative
   phrase. Wire `FilteringDemo` to filter `tasks` for real via
   `applyFilters` + `taskBinding` rather than rendering chips over
   nothing.

## Verification

- `getUniqueAttributeValues` over products must reproduce today's facet
  value lists for all eight curated facets (channels included, once bound).
- Data-view demos (DataView, saved views, slices), `FluidAttributesDemo`,
  and `filtering.mdx` render and filter as before; Storybook stories touching
  data-view pass.
- Grep proves the vocabulary gone: no `ProductFilterType`, no
  `Status|Assignee|Labels|Priority|DueDate` enum imports outside
  `filter-types.ts` history.

## Decisions taken in execution (2026-07-24)

- The full include/exclude family stays, because the matcher implements all
  of it honestly: `include all of` = every value present, `exclude all of` =
  not every value present, `exclude if any of` = none present. No story or
  MDX narrated the exotic operators, so nothing constrained the choice.
- The task binding's Labels facet is `path: 'tags'` (label `Labels`), not
  `path: 'labels'`: hydrated `task.labels` holds rich objects while
  `metadata.tags` holds the label names as strings, and path resolution
  descends into `metadata` transparently. `updatedAt` also joined the
  binding so the Updated-date facet gets date operators.
- The date table keeps the "in the past" special case as `is` / `is not` —
  "due date is in the past" evaluates as date < now; future phrases get
  `before` / `after` against the resolved timestamp, and `is <future
  phrase>` reads as due within that window.
- Membership comparisons run on the value as displayed (`formatBoundValue`),
  which is also what `EntityCard` hands `onAttributeClick` — so a clicked
  value always round-trips. List attributes additionally match the joined
  display string, keeping FluidAttributes' click-to-filter working on
  surfaced array attributes.
- `priorities.json` icons win over the deleted `FilterIcon` switch
  (`ph:warning-circle` for Urgent, cell-signal glyphs for the rest) — still
  owed a visual once-over of the pill row, as is the value dropdown now
  showing avatars for priority values (the old UI suppressed them).
