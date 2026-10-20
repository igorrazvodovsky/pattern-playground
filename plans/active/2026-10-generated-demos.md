---
title: "Generated demos: specs written by a model against the catalog"
status: active
kind: exec-spec
created: 2026-10-20
last_reviewed: 2026-10-20
area: components / server / pattern-site
---

# Generated demos: specs written by a model against the catalog

Outline, needs iteration. Research-gated: run the gate after this outline is
iterated and before the shape is fixed (§Research gate).

## Context

Switchable demos describe a demo as a JSON spec against the component catalog
(`packages/components/src/catalog/`), rendered through this library or shadcn/ui.
The plan that introduced them named a second direction with the same
prerequisite: an agent that composes an interface emits a spec in a vocabulary
the system already renders, rather than writing components. That plan stopped
at having a catalog that can produce a system prompt.

The prerequisites are now in place:

- The catalog has 51 types, and every pattern-page demo but nine is a spec.
- `catalog.prompt({ directives })` describes the types, the built-in actions,
  and the directives in `catalog/directives.ts`. Measured on 2026-10-20 it is
  79,877 characters (82,022 before the demo actions left the catalog).
- `catalog/specs.test.ts` checks a spec against the catalog and against the
  module that sets it up: types, props and literal values, slots, actions
  against the module's declarations and handlers (with literal params), `$computed` names, directives.
- `apps/server` already streams model output to the site as server-sent
  events (`services/streaming.ts`), through OpenAI.

## What is being tested

A claim, falsifiable per demo: given the catalog, a demo's state and the
actions its module handles, and the pattern's own text, a model can write a
spec that

1. passes the spec lint,
2. renders in both libraries, and
3. still shows the pattern.

The first two are checked by code. The third needs a person to look, and is
the one that says something about the language: whether a pattern's text is
enough to reproduce its move in an interface someone else composed.

## Shape (strawman)

*A reader control on the demo frame.* Beside the library switch, a control
that asks for a variant of the demo: a short request ("as a table", "for a
phone", "with fewer controls"), or none, which asks for any other way to show
the same pattern. The generated spec streams into the frame and renders
through the selected library. The actor can switch libraries on it, compare it
with the authored spec, and discard it. Nothing generated is saved.

*The generated spec reuses the demo's module.* It reads the same initial state
and can bind only the actions and `$computed` functions that the module
supplies. A spec reads state only, so a generated spec cannot bring fixtures
of its own; that keeps the test honest, since the model works with the same
material as the author.

*Edits as well as fresh specs.* `buildUserPrompt` can send the current spec
and ask for a patch (RFC 6902), a merge (RFC 7396) or a diff. A variant
written as an edit of the authored spec probably keeps more of the pattern
than one written from nothing. Which mode the control uses is open.

*The lint is the gate.* `lintSpec` moves out of the test file into a module
that the server or the client can call. A spec that fails gets
`autoFixSpec({ lossy: false })`, then the issues go back to the model for one
retry; lossy fixes only on the last attempt. A spec that still fails is not
rendered, and the frame says why.

*Streaming.* The server streams JSONL patches; the client builds the spec with
`createSpecStreamCompiler` and renders each partial spec. Whether a half-built
spec should render at all, or only once it passes the lint, is open: partial
specs fail the lint by definition.

## Pieces

- Server: an endpoint that takes a demo slug, an optional request, and an
  optional current spec; builds the system prompt from the catalog and
  directives and the user prompt with `buildUserPrompt` (state as context);
  streams patches over the existing SSE helper.
- Prompt material per demo: the module's initial state (or its shape), the
  actions it declares, and its `$computed` functions with a sentence
  each. Those functions have no descriptions today, so a model cannot use
  them; either each module describes its functions, or generated specs may
  not use `$computed`. Declaring them in the catalog is not enough: in
  json-render 0.21.1, `catalog.prompt()` lists `catalog.data.functions` by
  name only and drops their descriptions, although the documentation shows
  them. The descriptions have to reach the model through `customRules`, or
  the generic functions become directives, whose descriptions the prompt
  does carry.
- Actions per demo: each module declares the actions its spec can bind
  (`SpecSetup.actions`: params and a description beside the handler), and
  the catalog declares none, so the prompt for a demo names only that
  module's actions. `catalog.prompt()` does not list them; they reach the
  model through `customRules` or the user prompt.
- A catalog per demo, if the prompt is cut (§Research gate). json-render has
  no `pick`, `extend` or merge on a catalog. A smaller catalog is a second
  `defineCatalog` call over a chosen part of `catalog.data.components`, as
  the shadcn kit's documentation does with its own definitions.
- The pattern's text: its situations and its *Therefore* paragraph, read
  from the content collection, so the model is asked for the move rather than
  for a copy of the markup.
- Client: the control in `Demo.astro`, a generation state in
  `mountSpecDemos`, `SpecDemo` rendering a spec that changes under it.
- `lintSpec` as a shared module, with `specs.test.ts` calling it. It cannot
  be replaced by json-render's own checks: `validateSpec` checks structure
  only, and `catalog.validate` does not check props per component type in a
  catalog of more than one type, and leaves `on` and `watch` out of its
  result.
- A state-path check in `lintSpec`. A spec that reads a path the module never
  provides renders without complaint. The check compares the top-level path
  of every `$state`, `$bindState`, `repeat.statePath`, `watch` key and
  `${/…}` reference inside a `$template` with the module's initial state and
  the paths that `setState`, `pushState` and `removeState` write. A probe on
  2026-10-20 that left out `$template` references found no authored spec
  reading a path its module does not provide; `$template` references were
  not checked. The check is there for generated specs, where a misnamed path
  is the likeliest mistake.

## Research gate

What could this outline be wrong about? Questions for the gate:

- Is a whole-spec variant or an edit of the authored spec the better test of
  claim 3? What do existing generative-UI systems report about how much
  structure survives each?
- Does a 65,000-character catalog prompt need cutting per demo (only the
  types the authored spec uses, plus a few neighbours), and does cutting it
  reduce or improve the result?
- How do others judge whether a generated interface keeps its intent? Is
  there anything better than a person looking, such as a rubric drawn from
  the pattern's *Therefore* paragraph?
- A2UI's basic catalog: does checking this catalog against it change any type
  names before generated specs depend on them?
- json-render's experimental `composeSpec`, which composes from configured
  component instances: does it fit demos at all, given that it supports no
  `repeat`, `watch` or `$computed`?

## Not in this plan

- Saving or sharing generated specs.
- Generating the nine demos that are still React.
- Agent-composed interfaces as a pattern in the language. If this work
  suggests one, it is seeded separately.
- A third library.

## Open questions

- Provider and model. The server uses OpenAI today. Whether this endpoint
  stays on it, or the server gains a second provider, is a separate choice
  from this plan's shape.
- Is the server deployed with the site, or does generation work only in
  development? If only in development, the control is hidden in production.
- Cost and abuse on a public page: rate limits, a request length cap, or
  development-only.
- Which demos first. A static composition demo (status-feedback), a stateful
  one (inline-confirmation) and a heavy one (data-view) would repeat the
  first plan's three-way test.
