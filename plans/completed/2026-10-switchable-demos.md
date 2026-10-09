---
title: "Switchable demos: one spec, two component libraries"
status: completed
kind: exec-spec
created: 2026-10-09
last_reviewed: 2026-10-09
area: components / pattern-site
promoted_to: "docs/specs/workspace-layout.md; docs/specs/component-authoring.md; .claude/rules/pattern-content.md; scripts/check-style-boundary.mjs; scripts/verify-demo-registry.mjs"
superseded_by:
---

# Switchable demos: one spec, two component libraries

## Context

The pattern language is meant to be agnostic about the component library
underneath it. Nothing tests that claim today. A demo is a React function in
`packages/components/src/demos/` that hard-codes `pp-*` elements and the
library's CSS classes (`card`, `badge`, `button button--plain`), mounted by
`apps/patterns/src/lib/demo-registry.ts` into the `<div data-demo>` that
`Demo.astro` renders. The demo *is* its implementation, so there is no way to
render the same demo against another library and see whether the pattern
survived.

A second direction, generative UI, has the same prerequisite. An agent that
composes an interface does not write components; it emits a description of an
interface in a vocabulary the system already knows how to render. Both
directions need the same thing: a demo described as data, against a catalog of
allowed components, rendered by a registry that maps catalog types to a
library.

This plan takes the first step on both at once. Three existing demos are
re-expressed as JSON specs against a catalog, rendered by two registries, the
project's own library and shadcn/ui, with a toggle on the demo frame. The
generative half stops at having a catalog that can produce a system prompt; no
model is called in this plan.

## What is being tested

Three claims, each falsifiable by one of the three demos:

1. *A composition demo survives the switch.* `status-feedback` is static
   markup over `card`, `pp-list`, `pp-list-item`, `badge`. If the spec reads
   the same against both registries and the pattern is still legible in
   shadcn, the catalog altitude is right.
2. *A stateful demo survives the switch.* `inline-confirmation` has local
   state (armed / not armed, a timeout), a destructive action, a repeat over
   fixtures, and an empty state. This tests whether `$state`, `visible`,
   `repeat`, and catalog actions can carry a pattern's behaviour without a
   bespoke component, and where behaviour that is part of the pattern (the
   confirmation window timing out) has to live.
3. *A composite component is where the switch breaks.* `rule-composition`
   depends on `RuleSentence`, a Tiptap-backed component whose input is already
   JSON-shaped (`parts: RulePart[]`). The spec can name it as one catalog
   type, but the shadcn registry has no such component. This demo is expected
   to show the boundary between what a catalog can abstract over and what a
   library must supply.

The expected result is not "everything switches". It is a written account of
which parts of a pattern demo are description, which are behaviour, and which
are the library's own contribution.

## Decisions

*Adopt json-render rather than write a spec format.* `@json-render/core`
gives the spec shape (flat `elements` map keyed by id, `root`, `type`, `props`,
`children`, `slots`), `$state` and `$bindState` data binding, `repeat`,
`visible` rules, catalog-declared actions with Zod params, `catalog.prompt()`
for the generative side later, and a streaming compiler. Peer dependencies are
React 19 and Zod 4, both already in the tree. Vendor risk is playground-sized
by the same reasoning that carried the Elena decision: Apache-2.0, the pieces
this plan uses are small, and the specs are plain JSON that would survive a
change of renderer.

*Catalog types are named at component altitude, not pattern altitude.*
`Card`, `List`, `ListItem`, `Badge`, `Button`, `Text`, `Stack`, `RuleSentence`.
Naming types after what a pattern needs (`ConfirmableRow`, `StatusBadge`) was
considered and rejected: different patterns give the same component different
meanings, so pattern-named types would multiply into synonyms. Pattern
semantics live in the spec (props, structure, which actions are bound), not in
the type names. The catalog is library-neutral but it is still a component
vocabulary.

*The catalog is the project's; shadcn's is a source, not the contract.*
`@json-render/shadcn` ships 36 component definitions. The project defines its
own catalog in `packages/components/src/catalog/` and the shadcn registry maps
the project's types onto shadcn components, picking from
`shadcnComponentDefinitions` where the props line up and wrapping where they do
not. The reverse, adopting shadcn's catalog as the contract and bending `pp-*`
to it, would make the second library the standard and defeat the test.

*Two registries, one per library.* `registries/pp.tsx` wraps `pp-*` elements
and the CSS layer in thin React components, which is what demos are made of
already. `registries/shadcn.tsx` maps onto `@json-render/shadcn` components,
plus a `RuleSentence` entry built from shadcn parts (or marked unsupported, if
that is the honest finding).

*Specs live beside demos and keep the ownership rule.* `demos/specs/<slug>.json`
is owned by the pattern that names the move, and other pages borrow by name,
the same rule as `demos/<slug>.tsx`. Logic that a spec cannot carry (deriving
`RulePart[]` from the rule model, replaying the action log for the preview)
stays in a TypeScript module next to the spec and is wired in as action
handlers and initial state.

*shadcn's styles are contained, not merged.* The site pulls the library under
a single `lib` cascade layer (`apps/patterns/src/styles/lib.css`,
`scripts/check-style-boundary.mjs`). Tailwind v4 declares its own layers and
would otherwise land in the site's author styles. The shadcn registry's
stylesheet is a separate entry imported `layer(shadcn)` with `@source` limited
to the registry files, and it loads only when a shadcn demo mounts. The
boundary script gains an invariant for it. This is the riskiest piece and is
spiked first.

*Switching is a reader control.* The demo frame gets a registry toggle next to
the existing widen control. Reading a pattern and flipping the library under
the demo is the test, made visible.

## Research digest

Informal survey, 2026-10-09, no gate. The question was whether json-render is
the right substrate or whether a protocol-level spec should be adopted
instead.

- *json-render* (Vercel Labs, Apache-2.0, January 2026, ~18k stars). Catalog
  as Zod, flat spec, renderers for React, Vue, Svelte, Solid, React Native and
  others, a shadcn kit, prompt generation, streaming. A rendering library, not
  a protocol. Fits because the project needs a renderer and a catalog
  discipline, not a transport.
- *A2UI* (Google, v0.9.1 current, v1.0 release candidate). A streamed message
  protocol (`createSurface`, `updateComponents`, `updateDataModel`) with a
  separately defined catalog, and a maintained basic catalog (`Text`, `Card`,
  `Button`, `Image`…). Transport-agnostic, renderers across platforms. Not
  adopted: it is a protocol between agent and client, and this plan has no
  agent yet. Its basic catalog is the closest thing to a standard component
  vocabulary; if the generative phase ever needs interoperability, the
  project's catalog should be checked against it.
- *Open-JSON-UI* (OpenAI). A declarative schema aligned with what OpenAI's
  models emit. Not adopted: strong typing, limited streaming, no rendering
  story that fits the two-registry test.
- *AG-UI* (CopilotKit). A runtime event channel between agent and
  application, explicitly not a UI spec. Orthogonal; it is what would carry
  specs if the server ever streams them.
- *MCP Apps / MCP-UI*. Iframe-sandboxed UI resources. Not adopted: an iframe
  is a sealed library, the opposite of a switchable one.

What the survey changed: nothing in the strawman, but it fixed the vocabulary.
"Catalog", "spec", "registry" are the words every one of these uses; the plan
uses them unchanged. What was deliberately not adopted: naming the catalog
after any external basic catalog. The project's catalog should be cut to what
its demos need and compared outward later.

## Shape

```
packages/components/src/
├── catalog/
│   ├── catalog.ts            defineCatalog: types, props, actions, descriptions
│   ├── registries/
│   │   ├── pp.tsx            catalog → pp-* elements + CSS layer
│   │   └── shadcn.tsx        catalog → @json-render/shadcn (+ RuleSentence, Drawer)
│   ├── shadcn.css            tailwind input; sources: the kit's dist + registries/shadcn.tsx
│   ├── shadcn.generated.css  scoped, layered output of scripts/build-shadcn-css.mjs
│   └── SpecDemo.tsx          <SpecDemo spec registry store handlers functions>
└── demos/specs/
    ├── status-feedback.{json,ts}
    ├── inline-confirmation.{json,ts}   .ts: fixtures, the arm handler
    └── rule-composition.{json,ts}      .ts: rule model, sentence, preview

apps/patterns/src/
├── components/Demo.astro     spec= / registry= props; toggle in the footer
├── lib/demo-registry.ts      resolves data-demo-spec to SpecDemo
└── styles/lib.css            `shadcn` in the master layer order (sheet linked by the registry)
```

`<Demo spec="inline-confirmation" registry="pp" label="…" expandable />` in
MDX. `name=` keeps working unchanged; the three demos keep their React form
until the spec version is accepted, then the `.tsx` export is deleted and the
MDX reference flips.

## Phases

### Phase 0: spike the style containment

Install `@json-render/core`, `@json-render/react`, `@json-render/shadcn`,
Tailwind v4. Render one shadcn `Card` inside a `.demo-block` on one pattern
page. Confirm: shadcn renders correctly, site prose is untouched, the
component library's own styles are untouched, `check-style-boundary.mjs`
passes with the new invariant, and nothing loads on pages without a shadcn
demo. If containment cannot be made to hold, the second library changes
before anything else is built; the candidates considered were a
custom-element library (Web Awesome) and plain HTML.

Also measure what the dependencies cost. Gzipped chunk sizes for
`@json-render/core` + `react`, the pp registry, the shadcn registry (only the
components the catalog uses) and the Tailwind CSS; and the network waterfall
of a pattern page without a spec demo, which must be identical before and
after. The shadcn registry loads only when the toggle is flipped, never on
mount; pp is the default. Tailwind's preflight reset must not reach the site
or the library.

Done when: a committed spike on a branch with a one-paragraph finding and the
size numbers in this plan's log.

### Phase 1: catalog and the pp registry, status-feedback

Define the catalog with only what `status-feedback` needs. Write the pp
registry. Write `SpecDemo.tsx` (`StateProvider`, `ActionProvider`,
`Renderer`). Add `spec=`/`registry=` to `Demo.astro` and the resolver to
`demo-registry.ts`. Render `status-feedback.json` through pp on the
status-feedback page beside the existing React demo.

Done when: the two render the same, and the spec reads as a description of the
demo rather than as serialised JSX.

### Phase 2: the shadcn registry and the toggle

Map the catalog onto shadcn. Add the footer toggle. Flip between the two on
the status-feedback page.

Done when: claim 1 has a verdict in the log.

### Phase 3: inline-confirmation

Extend the catalog (`Button` with icon and visually hidden label, `repeat`
over `reuseListings`, `visible` on the empty state). Decide where the
confirmation timeout lives: a catalog action with a handler that schedules
`setState`, or a `ConfirmableAction` composite component. The first keeps the
pattern's behaviour in the spec and handlers; the second moves it into the
library and weakens the test. Try the first.

Done when: claim 2 has a verdict, including what had to leave the spec.

### Phase 4: rule-composition

`RuleSentence` enters the catalog as a composite type with `parts` as its prop
and `change`/`add`/`remove` as its events. The rule model, parts derivation and
the replay-backed preview move to `demos/rule-composition.ts` and become
initial state and handlers. The preview drawer is either a `Drawer` catalog
type or stays an imperative `modalService` call from a handler; record which.
For shadcn, build `RuleSentence` from shadcn `DropdownMenu` parts if it is a
morning's work, otherwise register it as unsupported and let the toggle say so.

Done when: claim 3 has a verdict, and the catalog's composite-component rule
is drafted (below).

### Phase 5: residue

- Delete the three React demo exports that the specs replaced; update
  borrowing pages.
- Write up the three verdicts as the finding of this plan.
- Spec delta to `docs/specs/workspace-layout.md` (Shared demos): specs as a
  demo form, ownership unchanged, the `catalog/` directory.
- `docs/specs/component-authoring.md`: a short clause on catalog membership,
  what a component owes to be in the catalog (JSON-shaped props, named
  events, no imperative API in the contract).
- `ARCHITECTURE.md` is stale from before this plan (still names Lit as the
  primary architecture); correct it in the same pass.

## Not in this plan

- Calling a model. `catalog.prompt()` exists once the catalog does; wiring
  `apps/server` to generate specs, streaming them, and a "generate a variant"
  control on the demo frame are the next plan, gated on this one's verdicts.
- Migrating the other ~48 demos. The three here decide whether that is worth
  doing and for which demo classes.
- A Vue or Svelte registry. A second React registry is enough to test the
  claim; a second framework would test a different one.
- Storybook. Specs may later feed stories (the shared-demos direction in
  `docs/project/vision.md`); not here.

*A spec reads state only.* Specs never name `@shared/data` fixtures. The
module beside the spec (`demos/<slug>.ts`) builds `initialState` from the
fixtures and supplies the handlers. A spec is JSON and cannot import; the
world is authoritative through replay rather than through files a spec could
point at; and a generated spec will only ever read state the application put
there, so hand-written specs follow the same rule to keep the test honest.

*The toggle is per demo* until coverage makes a page- or site-wide preference
meaningful.

## Open questions

- Does `visible`'s expression language cover the empty-state case
  (`items.length === 0`), or does that need derived state? *Answered:* it
  covers it without derived state. `{ "$state": "/items/0", "not": true }`
  is true when the list is empty. `/items/length` does not work, because
  JSON Pointer reads array segments as indexes.

## Finding

*Claim 1, a composition demo survives the switch: holds.* The status-feedback
spec renders through pp identically to the hand-written demo, and through
shadcn the pattern is still legible: the changed value is highlighted and the
count sits beside its row. Two parts of the vocabulary did not carry over.
shadcn has no attention pulse, so its registry uses Tailwind's opacity pulse,
which signals "loading" rather than "new". shadcn has no list, so its
registry builds one from Tailwind classes. The spec reads as a description:
element ids name the parts (`investment-summary`, `unread-count`), not the
markup.

*Claim 2, a stateful demo survives the switch: holds, and more of the
behaviour stays in the spec than expected.* Which control shows in which
state, cancel (`setState` on the row's `armed` field), confirm (`removeState`
at `$index`), the empty state, and reset (`setState` from a `listings` copy
in state) are all in the spec. Only the confirmation window had to leave it:
the `arm` handler sets the flag and schedules its reversion, because a spec
has no way to schedule a state change. A `ConfirmableAction` composite was
not needed. The state store outlives the registry, so switching libraries
mid-confirmation keeps the demo where the actor left it.

*Claim 3, a composite component is where the switch breaks: partly holds.*
`RuleSentence` enters the catalog as one type whose contract is data (parts
in; `change`, `add`, `remove` out). The shadcn registry could build it from
Radix DropdownMenu and shadcn's menu classes in about ninety lines, so the
switch does not break. The boundary is elsewhere: the catalog can name a
composite but cannot assemble it, so every library has to supply its own
implementation. The pp version is a read-only Tiptap document, and the shadcn
version is inline text with menu buttons. Both were exercised through every
slot kind (choice, multiple choice that cannot go empty, add, remove), save,
and the preview. The focus order, Enter to open, and arrow keys in the menu
are the same in both. The rule model (sentence derivation, applying an edit, replaying the
action log for the preview) is description of the domain, not the interface,
and stays in the module beside the spec. The spec holds save and discard
(`setState` between `/draft` and `/saved`), the drawer's open state, and the
preview's layout, kept current by a `watch` on the rule.

*What a pattern demo is made of.* The description part of a demo is its
structure, visibility rules, bindings, and actions over state. It moved
between the two libraries without change. Timers and domain models stay in
TypeScript beside the spec. Each library supplies the look and meaning of
every component, and its own implementation of each composite. The two
renderings differ only in that part.

*Other findings.*

- Catalog actions are demo vocabulary (`arm`, `editRule`, `updatePreview`),
  not component vocabulary. The catalog lists them for prompt generation, and
  every registry carries no-op stubs because `defineRegistry` requires one
  per catalog action. The handlers come from the spec's module.
- Events carry no payload. A component that reports a value (RuleSentence's
  edit) writes it to a bound state path, then emits. Inside a `repeat`,
  `{ "$item": "id" }` in action params resolves to the field's state path,
  not its value; that is what lets built-in `setState` and `removeState`
  target a row.
- Icons have to be named by meaning in the catalog (`delete`,
  `delete-confirm`). A spec that named Phosphor glyphs was tied to pp.
- `pp-list` is a menu (`role="menu"`, rows that do not wrap). The catalog's
  `List` therefore means an interactive list of rows, and the rule preview's
  read-only cases are stacked text instead. A content list would be a
  separate type.
- Portals escape the style scope. Overlays in the shadcn registry (the
  drawer, the slot menus) portal into a body-level element that carries
  `data-registry="shadcn"`. The pp drawer is `pp-modal` rendered through a
  portal, because `modalService` mounts content in a React root of its own,
  outside the spec's providers.
- The pp registry uses inline styles for spacing (Stack, Grid, Card), as the
  hand-written demos did. This goes against `.claude/rules/styling.md`;
  layout utilities for a row and a grid with a column width would remove them.

## Log

- 2026-10-09: plan drafted after an informal survey of json-render, A2UI,
  Open-JSON-UI, AG-UI and MCP Apps. Second library fixed as shadcn/ui, demos
  fixed as status-feedback, inline-confirmation, rule-composition.
- 2026-10-09, phase 0: containment holds. Tailwind is not part of the site's
  Vite pipeline. `scripts/build-shadcn-css.mjs` compiles `catalog/shadcn.css`
  with `@tailwindcss/node` (sources: the kit's compiled components and
  `registries/shadcn.tsx`). It then rewrites the output so that every rule
  sits in `@scope ([data-registry="shadcn"])`, `:root`/`html` become
  `:scope`, keyframes take a `shadcn-` prefix, and the whole sheet is in the
  `shadcn` layer. `lib.css` and `Base.astro` register `shadcn` right after
  `lib`. shadcn's colour variables live on the scope root, because the
  library already owns `--accent` and `--border`. Importing the sheet as a
  module made Astro hoist it into every page's `<head>`, so the registry
  links it by URL (`?url`) when it loads. `check-style-boundary.mjs` gains
  invariant 3: the sheet is fresh, layered and scoped, and the two layer
  statements match. Verified in a production build: a page without a spec
  demo references the same assets as before (site CSS +763 bytes for the
  switch styles), and computed styles of every element outside the switched
  demo are identical before and after the shadcn sheet loads, in light and
  dark. Sizes, gzipped: pp path 61 KB of new JS (json-render core 24, zod
  25.4, React renderer 8.2, catalog, registry and spec under 3); shadcn adds
  80 KB of JS and 9.8 KB of CSS, loaded only when the switch is flipped. The
  kit exports its components as one object, so it does not tree-shake.
- 2026-10-09, phases 1–2: catalog, pp and shadcn registries, `SpecDemo`,
  `<Demo spec=… registry=…>` with the footer switch. Claim 1 verdict under
  §Finding.
- 2026-10-09, phase 3: claim 2 verdict under §Finding.
- 2026-10-09, phase 4: `Drawer` and `RuleSentence` entered the catalog; the
  drawer is a catalog type, not a `modalService` call. Claim 3 verdict under
  §Finding. With the shadcn drawer and a slot menu open, computed styles
  outside the demo and its portal root are unchanged. `catalog.prompt()`
  produces a 17,900-character system prompt. RuleSentence's `parts` shows
  there as `Array<unknown>`, so the slot shape reaches a model only through
  the type's description.
- 2026-10-09, phase 5: status-feedback, inline-confirmation and deletion
  render the specs; `IndicatorsDemo` and `InlineConfirmationDemo` are
  deleted (`useInlineConfirm` stays for action-consequences).
  `verify-demo-registry.mjs` checks `<Demo spec>` against the `specs` map.
  Residue landed in `workspace-layout.md` (Switchable demos),
  `component-authoring.md` (Catalog membership), `pattern-content.md`
  (Demo embeds) and `ARCHITECTURE.md`. Deviation from §Shape: spec modules
  live beside the JSON in `demos/specs/<slug>.ts`, because `demos/<slug>.tsx`
  files with the same stem still exist. rule-composition.mdx renders the spec;
  `RuleSentence.stories.tsx` (`WithPreview`) renders it through the pp
  registry, and `RuleCompositionDemo` with its registry entry is deleted.
  The spike is committed on branch `switchable-demos`.
