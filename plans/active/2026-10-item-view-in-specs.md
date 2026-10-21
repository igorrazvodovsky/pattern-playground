---
title: "Item views in spec demos"
status: active
kind: exec-spec
created: 2026-10-21
last_reviewed: 2026-10-21
area: components, catalog
---
# Item views in spec demos

Spec demos show an item through a readout written out by hand: a Card with
Badges, a key figure as Text, a description, a `DescriptionList` of the rest
and a listed line. The readout is copied into about twelve places across the
spec JSON, and `specs/shared/product-view.ts` precomputes its slots in
TypeScript by copying part of `ItemView`'s role layout. This plan gives the
catalog an item view that lays out any bound entity at any scope from its
binding, so a spec names the item, its entity type, the scope and the shown
attributes, and each registry renders the result in its own library.

It replaces two entries in the refactoring sweep
(`active/2026-10-refactoring-sweep.md`): *Product readout repeated in specs*
and *Item layout by role, twice*.

## Decisions

*Catalog types are a spec vocabulary, not the Storybook catalogue.* `ItemView`
stays under Templates in Storybook. A catalog type is a word specs are written
in; its place in the catalog says nothing about whether the thing it renders
is a component. The switchable-demos rule that types are named at component
level still holds: it keeps pattern-named types from multiplying into
synonyms. One item view type for every entity kind does not multiply, because
what differs between kinds lives in the binding. `Map`, `Timeline` and
`Reference` are earlier generic views over data in the same catalog.

*The spec carries the selection, not the laid-out slots.* The type's props
are the binding's vocabulary, each bindable through `$state`, so a spec can
change which attributes show (surfacing one, semantic zoom, fluid attributes)
by writing state. Passing pre-laid-out slots instead would keep the
TypeScript step beside every spec and lose that.

*One layout, two renderings.* Which slot each attribute lands in is decided
once, by a pure function beside the bindings. `ItemView.tsx` and both
registries call it; each registry only maps slots onto its own parts.

## Implementation shape

1. *Layout function.* `layoutByRole(binding, scope, item, selection?)` in
   `shared/data/bindings`. It resolves the selection (or the scope's default),
   drops attributes with no value, and returns formatted slots: thumbnail,
   badges, key attributes, subtitles, descriptions, captions, rows (a
   record-valued attribute gives one row per key), tags, footers, and the paths
   of `valueType: 'custom'` attributes. The mini scope's rule (rows shown as
   labelled badges) and the title's presence belong to it. Unit tests beside
   it cover each role and the record-to-rows split.
2. *`ItemView.tsx` reads the slots.* It keeps its markup, the heading option
   and the custom-component lookup; the role filtering and `specRows` go.
3. *Catalog type.* Props: `type` (an enum of the keys in `bindings`), `item`,
   `scope` (`micro | mini | mid | maxi`) and `shownAttributes` (paths, roles
   or `'all'`, the selection type `templates/collection-view/spec.ts` already
   uses). The title is left to the host, as `ItemView` leaves it: in a spec, a
   Card, Drawer or Dialog supplies the title and controls, and the item view
   fills the body.
4. *Registries.* pp wraps `ItemView`. shadcn builds the slots from its Badge,
   `DescriptionList` and text parts. A custom attribute the registry cannot
   render shows as unsupported rather than being dropped.
5. *Specs.* Replace the hand-written readouts in investigate,
   watch-to-chase-tiers, item-view-full, item-view-transitions, reference,
   linked-trio and overview-detail. Their setup modules put raw items in state.
   The labelled-badge lists built by `cardAttributes` and `sliceAttributes`
   (fluid-attributes, nested-pairs, problem-checklist and the others) are a
   mini scope with a selection; move them over where the layout fits, and keep
   the helper only where it does not.
6. *Clean up `specs/shared/product-view.ts`.* What is left after step 5 is a
   few product presets (`mapLocations`, perhaps `sliceAttributes`). Rename or
   dissolve the module then; until step 5 lands the rename is not worth doing.

## Validation

- `npm run test`: lint, the spec lint and the unit project.
- Each changed spec demo checked in the browser in both registries, at every
  scope it shows.
- The `ItemView` stories render as before.

## Visible changes

Checked against screenshots of the site at the commit before this work.

- In nested-pairs, a product's condition shows as a badge without a label,
  since its role is badge.
- Otherwise the readouts match the old ones in both libraries, apart from
  small spacing shifts.
- Not visible in any demo: at mini, a record-valued spec attribute gives one
  labelled badge per key. No binding's mini scope includes one.

`ItemView` lays out its rows as `.details-list` (the description list) and
leaves the description unclamped above mini. Its earlier `.attribute-list`
rows set each label below its value and had no dividers, which showed once
the spec readouts moved onto it; nothing else used that class, so its rules
are gone from `layout.css`.

## Progress

Steps 1 to 6 are implemented.

- `layoutByRole` is in `shared/data/bindings/layout.ts`, with unit tests
  beside it. The unit project now collects `shared/**/*.test.ts`.
- The catalog type is `ItemView`. Both registries get its selection from
  `catalog/behaviour/item-view.ts`, which leaves the title role out above
  micro, since the host names the item. The shadcn registry maps the slots
  onto its Badge classes and onto `DescriptionRows`, the markup it shares
  with `DescriptionList`.
- Migrated: item-view-full, item-view-transitions, investigate,
  watch-to-chase-tiers, linked-trio, overview-detail, reference, and the
  detail of nested-pairs. Each holds the raw item in state, nested under its
  own key inside a repeat (`product`, `item`) so it does not collide with the
  demo's fields. A detail that leaves out what its row shows writes the mid
  scope's remaining paths as `shownAttributes`.
- Kept on `cardAttributes`: the labelled badges on rows and cards (investigate,
  linked-trio, overview-detail, nested-pairs, problem-checklist,
  watch-to-chase-tiers) and fluid-attributes. A mini item view shows the key
  attribute as a figure and badge-role attributes without labels, and
  fluid-attributes needs pressable badges, so none of these fit.
- `specs/shared/product-view.ts` is now `specs/shared/product.ts`, holding the
  product presets only.

## Discoveries

- Specs differ from `ItemView` in two places that show. The order at mini is
  the key figure, then the badges; the shadcn registry follows it. A product's
  condition is badge-role, so in nested-pairs it now shows as a bare badge
  ("New") rather than a labelled row.
- The reference spec reaches quotes, whose mid scope includes the comment
  thread. A drawer opened from a note has no place for it, so the reference
  setup gives quotes their own `shownAttributes`.
- Reference metadata rows now take derived labels ("Last updated") in both
  registries, through `components/item-view/reference-metadata.ts`.

## Open questions

- *Overlap with `Reference`.* Its preview body covers ground near the micro
  and mini scopes. Decide later whether the preview's body becomes an item
  view.

Settled: raw items survive in state (product dates are strings). The two
ladders correspond as written on `ItemScope` in `shared/data/bindings/types.ts`.
Custom attributes in shadcn come from a lookup keyed `type.path`, as pp's
registered components are; it has reference metadata, and any other custom
attribute shows as unsupported in both registries. The pp renderer loads
lazily, since `ItemView`'s comment components bring the editor with them.
