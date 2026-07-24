---
title: "Item view on Meridian bindings"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-24"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Item view on Meridian bindings

Replace the per-type content adapters (Product, Project, Quote, Task, Reference) with a Meridian-style architecture: entity types in `shared/data` carry a declarative *attribute binding* (what each attribute is), and a single generic `ItemView` renders any entity from `(item, binding, scope)`. Adapters shrink to registries of custom components for the few attributes that are genuinely behavioural.

## Design framing

Meridian (Min & Xia, UIST '25) separates an overview-detail interface into three declarative parts: *data binding* (data attributes → roles and types), *views* (which attributes are shown where, how views compose), and *malleability*. Two of its moves are the target here:

1. *Decoupling data binding from views.* Views never mention a domain type; the same view renders any data source that supplies a binding, and the same data renders into any view. The companion paper (Malleable Overview-Detail Interfaces, CHI '25) supplies the motivation: developer-fixed per-type views are exactly what prevents attribute-level customization.
2. *Roles, not placements.* Each attribute is described by what it *is* (`title`, `subtitle`, `thumbnail`, `tag`, `spec`, …), and each view type decides where a role lands. Knowledge like "status is a badge" or "price goes in the header" becomes data.

The codebase already has one Meridian-shaped track: `ViewSpec` in `src/templates/collection-view/spec.ts` (its field names follow Meridian by design) drives `ProductCard`/`ProductDetail` from `shownAttributes` over `Product`'s typed metadata tree. The item-view adapters are the older track beside it: four hand-written renderers that switch on scope and encode attribute selection, labels, formats, and placement as JSX. This plan converges the two tracks on the binding idea.

What the adapters do today decomposes into four responsibilities with different rightful homes:

| Responsibility | Today | Target |
|---|---|---|
| Attribute selection per scope | JSX per adapter per scope | `shownAttributes` per scope, in the binding |
| Labels, value kinds, formatting | scattered (`attributeLabel` is Product-only; adapters hardcode the rest) | binding entries (`label`, `valueType`, `role`) in `shared/data` |
| Item conversion shims (`taskToItemObject`, `productToItemObject`) | compensate for contract/model mismatch | deleted; `ItemView` takes the `shared/data` entity directly |
| Bespoke widgets (comment thread, history stepper, rich quote content) | inlined in adapter JSX | registered custom components — the legitimate residue |

Meridian's own limitations section is the calibration for that last row: every real-world ODI they reproduced needed custom components. The goal is not zero custom code; it is that everything *declarative* stops being code.

## Vocabulary

New types, defined in `shared/data` (framework-agnostic, per the service-architecture rule):

```ts
type AttributeRole =
  | 'title' | 'subtitle' | 'description'
  | 'key-attribute' // the standout figure (a price, a headline stat)
  | 'thumbnail'
  | 'caption'       // muted line accompanying media or description
  | 'badge'         // categorical states rendered as badges (status, condition)
  | 'tag'           // free labels, many per item
  | 'spec'          // label: value rows in an attribute list
  | 'link'          // navigational reference, rendered as an anchor row
  | 'action'        // an operation on the item — behavioural, so valueType 'custom'
  | 'footer';       // provenance meta (created, updated, listed), muted end line

type AttributeValueType =
  | 'string' | 'number' | 'currency' | 'date' | 'status'
  | 'image' | 'link' | 'progress'
  | 'custom';    // rendered by a registered component, never generically

interface AttributeBinding {
  path: string;              // dot-path into the entity, e.g. 'pricing.msrp'
  label?: string;            // omitted → derived from the path leaf
  role: AttributeRole;
  valueType: AttributeValueType;
}

interface EntityBinding {
  entityType: string;        // 'product' | 'project' | 'task' | 'quote' | 'reference' | 'user'
  attributes: AttributeBinding[];
  /** The scope ladder as data: which attributes each scope shows by default. */
  scopes: Record<'micro' | 'mini' | 'mid' | 'maxi', string[]>;
}
```

Naming follows the corpus first, Meridian where the corpus has no word (same rule `spec.ts` already applies). The role set is Meridian's default twelve, verbatim (from `src/spec/spec.ts` in the meridian-ui repo). Two divergences from their contract: their union is open (`| string`) and ours stays closed so a typo is a type error; and they have no date-meta role — provenance dates (`createdAt`, `listedAt`, …) bind to `footer` with `valueType: 'date'`, while operative dates (a task's `dueDate`) are `spec` rows. `action` renders only through a registered custom component; `caption` currently has no bound content and waits for product imagery.

The scope ladder is the item-side counterpart of `RepresentationRung` in `spec.ts` (population side). `scopes` makes the ladder data, which is also what Meridian's semantic-zoom demonstration does: zooming is growing or shrinking the shown-attribute set.

## Phases

### A. Bindings in shared/data

1. Add `shared/data/bindings/` — the types above plus one binding module per entity type: `product.ts`, `project.ts`, `task.ts`, `quote.ts`, `reference.ts`, `user.ts`. Export a `bindings` map keyed by entity type from `shared/data/index.ts`.
2. Seed each binding from what the adapters render today (the adapters are the spec for their own replacement):
   - *Product*: from `ProductAdapter` scopes + the collection-view `ATTRIBUTE_LABELS` curation (`pricing.msrp` → "Price", etc.). The label table moves here; `attributeLabel` in `AttributeUtils.ts` becomes a thin lookup over the binding with the camelCase-leaf fallback.
   - *Task*: title/specification/status/assignee/progress as declarative entries; `history` and `comments` as `valueType: 'custom'`.
   - *Project*: name/description/status/phase/updatedAt — fully declarative (nothing bespoke survives; the current adapter's literal icon text and unstyled classnames die here).
   - *Quote*: `content.html` as `custom` (rich text), source/author/createdAt declarative.
   - *Reference*: from the three `Reference*Adapter` components — mostly declarative.
3. Even out the entity types. `QuoteObject`, `TaskObject`, `ProjectObject` in `src/components/item-view/types.ts` duplicate or diverge from `shared/data` (`Project.metadata` is `Record<string, unknown>` there; task types live in `task-types.ts`). Single source of truth in `shared/data/types.ts`; the item-view copies become re-exports, then disappear. This is where `BaseItem`'s `label` stops being a cast target: every bound entity exposes its title through the binding's `title` role.

### B. Generic renderer

4. Generalize attribute access. `getAttributeValue`/`formatAttributeValue` in `collection-view/AttributeUtils.ts` are Product-typed; extract the path-walking and value formatting into a binding-driven module (formatting switches on `valueType`, not on hardcoded paths). Keep the collection-view exports as wrappers during the transition.
5. Rewrite `ItemView` to render from `(item, binding, scope)`: resolve `binding.scopes[scope]` (overridable by a `shownAttributes` prop — the detail-subtraction move in `InPlaceDetail` needs exactly this), then place attributes by role into one generic layout: title zone (host `heading` prop unchanged — hosts still own mid/maxi headings, the binding only supplies the string), badge row, description, spec rows as the existing `attribute-list` markup, timestamps.
6. Custom component registry, Meridian-style: `ContentAdapterProvider` becomes a provider of `(bindings, customComponents)` where `customComponents` maps `entityType.path` → React component (`task.history` → history stepper, `task.comments` → `CommentThread` wiring, `quote.content` → rich HTML + actions block). A `valueType: 'custom'` entry without a registered component renders nothing and warns in dev.
7. Shrink the adapters:
   - Delete `ProductAdapter`, `ProjectAdapter` (fully declarative).
   - Reduce `TaskAdapter`, `QuoteAdapter` to custom-component modules.
   - Collapse `reference/adapters/*` into the reference binding plus at most one custom component; `Reference.tsx` keeps its trigger chrome.
   - Delete the `taskToItemObject`/`productToItemObject` shims and the `ItemObject<T>` conditional type (the item prop becomes the bound entity).
   - `DefaultFallbackRenderer` becomes the no-binding fallback (unknown entity type), not the no-adapter fallback.
8. Update `ItemInteraction`: modal titles read the binding's `title` role instead of casting to `BaseItem`; scope escalation logic unchanged.

### C. Converge with collection-view

9. `ProductCard`/`ProductDetail` already render from `shownAttributes`; point them at the shared binding for labels and formatting (step 4 wrappers make this near-mechanical). Whether they *become* the generic renderer's card/detail layouts or stay Product-typed is decided here, not up front — take the merge only if it simplifies; the template's job is illustrating ViewSpec, not maximal generality.
10. `ViewSpec.detail.shownAttributes` and the item-view scope ladder now speak the same vocabulary; note the correspondence in `spec.ts`'s header comment.

### D. Sweep

11. Update consumers: `src/demos/item-view.tsx`, `overview-detail.tsx`, `coordinated-views.tsx`, `purpose-keyed-view.tsx`, `src/components/command-menu/ai-fallback-handler.tsx`, item-view and Reference stories.
12. Delete the deprecated legacy trio still exported from `item-view/index.ts` (`ItemPreview`, `ItemDetail`, `ItemFullView`) if grep confirms no remaining consumers; they predate even the adapter track.
13. `ItemView.mdx` / Storybook: document the binding contract; the story stays in the *Templates* bucket (settled: adapter-driven assemblies are not a Component, and binding-driven ones aren't either).

## Order and checkpoints

A is pure addition (safe to land alone). B is the breaking change — land 4–8 together. C and D can follow in separate commits. After each phase: `npx tsc --noEmit` against the 357-error baseline, eslint on touched files, patterns build (117 pages), Storybook build from `packages/components`.

## Non-goals

- End-user malleability UI beyond what the ViewSpec demos already show (attribute surfacing/hiding is demonstrated there; Fluid-Attributes-style interactions are pattern-page material, not this refactor).
- Meridian JSON interchange — deferred, not rejected. The declarative layer is kept JSON-serialisable on purpose (bindings, specs, and selections are plain data; custom components and view types are referenced by string key, which is Meridian's own interchange trick), so a `{binding, spec}` document needs only a loader, not a rearchitecture. The Meridian npm package itself stays out.
- AI-assisted attribute generation (paper §4.1.3) — out of scope.

## Resolved in execution

- *Quote actions* (`annotate`/`cite`/`challenge`/`pin` flags): host chrome, not an attribute component — the adapter never rendered them, so nothing binds; noted in the quote binding's header comment.
- *`CommentAwareAdapterBase`*: died with the adapter contract. Commenting wiring is one custom component (`EntityComments`) registered per commentable entity type (`task.comments`, `quote.comments`); no capability flag needed — registration *is* the capability.
- *Micro scope*: a `scopes.micro` list of one or two attributes (thumbnail + title) suffices; the reference mention renders its own trigger chrome and never reaches `ItemView` at micro.
- Renderer placement details: spec rows use the `attribute-list` markup; a spec attribute resolving to a plain record (a product's `specifications`) expands to one row per key, which keeps dynamic groups declarative; mini renders its own heading only when the scope's attribute set includes the title role (a quote's summary is its blockquote, not its name twice).
- Step 9 split into two decisions. Merging the card/detail into `ItemView` was not taken (item scope vs population scope — different contracts). Genericising the collection track was: renderers take `(items, spec, binding)`, `EntityCard`/`EntityDetail` (né `ProductCard`/`ProductDetail`) resolve identity slots by role, table alignment switches on valueType, and the in-place detail's readout derives from the binding's `mid` scope. Two Meridian imports beyond the original vocabulary: `shownAttributes` entries may be roles (their `AttributeSelectionScope`), so a spec written in roles renders any binding, and map coordinates live in the binding's `internalAttributes` (data views need but never display). The CollectionView story proves the genericity with a products/tasks/projects switcher over one role-written spec.
- The provider (`ItemViewProvider`) defaults to the shared bindings plus the default custom-component registry, so hosts mount it only to extend; per-value badge colour variants (`badge--success` etc.) did not survive — badges render plain.
