# Component authoring specification

Components are platform-first: light-DOM custom elements that enhance the
HTML composed inside them, styled through the ordinary cascade. Shadow DOM is
an exception that requires written justification, not a default. The library
reached this state with the 2026-07 light-DOM refactor
(`plans/completed/2026-07-light-dom-refactor.md`); as of its completion, zero
components render into shadow roots.

## The decision ladder

For any component, existing or new, take the first rung that suffices:

1. *Native HTML + CSS.* No custom element. A button is a `<button>` with a
   class; a switch is `<input type="checkbox" role="switch">` styled. Check
   `src/styles/` for an existing CSS-only treatment before writing any TS.
2. *Composite enhancement.* A light-DOM custom element that renders nothing
   and enhances the children it is given — roles, listeners, attributes.
3. *Light-DOM render.* The element owns and renders its subtree. Author
   children will be clobbered; ownership is a documented convention, not a
   boundary.
4. *Shadow DOM.* Only with a written justification in the component file:
   genuine style isolation or third-party embedding.

Slots exist only on rung 4. Composition happens through real children; where
a component needs named regions, children carry `data-slot="…"` attributes.

## Ownership and styling

- A rung-2 component never re-renders children it didn't create; reactive
  updates mutate attributes and classes on existing elements. Nodes a
  component appends itself (scroll buttons, carets, check marks) coexist
  with author- or framework-owned children.
- Component CSS lives in `src/styles/` as layered files
  (`layer(components)`), selectors keyed to the tag name, `@scope` where
  leakage is plausible. Components never carry their own stylesheets.
- Author pre-upgrade HTML that is acceptable unstyled. A shared
  `:not(:defined)` convention proved unnecessary — no converted component
  needed one.
- No customised built-ins (`is="…"`): WebKit doesn't implement them.

## What stays React

Five families remain React because the library they wrap owns the interaction model, and the ladder has no platform rung for them:

- *editor, editor-plugins, commenting UI, template-field, Reference* — tiptap-react coupled (`useEditor`, `ReactRenderer`, `ReactNodeViewRenderer` NodeViews).
- *combobox, command-menu* — cmdk owns the list, filtering and keyboard model; the command-menu hooks are state machines on top of it.
- *item-view* — the custom-component registry holds React component types by design; its shape is provisional.
- *ModalErrorBoundary* — React error boundaries have no platform equivalent; it exists so `modal-service` can wrap React content.

A new `.tsx` family needs the same kind of reason written at its head.

## Catalog membership

Switchable demos are written against a component catalog
(`packages/components/src/catalog/catalog.ts`), and each component library
renders the catalog through a registry. A component joins the catalog when a
spec needs it and it can be described as data:

- *JSON-shaped props.* Everything the component needs arrives as plain
  values. Callbacks, refs and React nodes are not props in the catalog.
- *Named events.* The component reports what happened by event name
  (`press`, `change`). Events carry no payload; a value that goes with an
  event is written to a bound state path first (`$bindState`), then the event
  is emitted.
- *No imperative API in the contract.* Open and closed, selected and
  armed are state the spec binds, not methods a caller invokes. A registry
  may drive an imperative element internally (`pp-modal`'s `open()`), but the
  catalog type never exposes it.
- *Named at component altitude.* `Button`, `Drawer`, not `ConfirmButton`.
  What the component means in a pattern belongs to the spec.

A composite (`RuleBuilder`) can be a catalog type when its input is already
data. Every registry then has to supply the whole component, or leave it
unmapped and let the demo say so; the catalog cannot assemble it from smaller
types.

## Where the rest lives

- Operational per-file rules (event binding, registration, lifecycle):
  `.claude/rules/web-components.md`, auto-attached on component files.
- Style layering and boundary enforcement: the style-boundary conventions in
  `src/styles/` and `scripts/check-style-boundary.mjs`.
