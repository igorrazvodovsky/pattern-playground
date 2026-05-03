---
title: "Role metadata"
status: "active"
kind: "exec-spec"
created: "2026-05"
last_reviewed: "2026-05-01"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Role metadata

A plan to introduce `role:*` Storybook Meta tags that distinguish *component* MDX pages (implementation mechanisms — API, rendering, states, props) from *pattern* MDX pages (generative interaction moves — recurring situation, forces, consequences). Promotes the mechanism-vs-move boundary from a hedged claim in `vision.md` to a marked distinction in the data model.

## Context

The project's `vision.md` names `mechanism vs move vs umbrella` as the durable distinction. `pattern-definition.md` provides the operational test for what counts as a pattern. But `src/stories/` still does both jobs — Storybook is the documentation surface for components *and* the source of pattern material — and the existing `atomic:*` tags say what something is *made like* (primitive / component / composition / pattern), not whether the page is a pattern source or a component source.

The 2026-04-30 comparison against [`references/report-pattern-language-formats.md`](../../references/report-pattern-language-formats.md) sharpened why this matters. The report is firm: implementation bindings (Design Tokens, Custom Elements Manifest, Storybook stories) should be treated as *attachments* to the pattern language, not the pattern language itself. The project has the conceptual space for the boundary; this plan draws it.

The companion umbrella plan ([`2026-04-umbrella-role.md`](../completed/2026-04-umbrella-role.md)) proposes a `role:umbrella` tag for pages that survey a territory of related moves. This plan is the larger sibling: introducing `role:component` and `role:pattern` for the two main page kinds. The three roles together cover the current corpus.

## Terminology

The plan uses `role:component` and `role:pattern` as tag names because they align with industry usage and lower the friction for authors and readers. The framing in the project's docs is *mechanism* and *move* — those terms remain in `vision.md`, `relationship-vocabulary.md`, and prose. `component` and `pattern` are surface terms; `mechanism` and `move` are the underlying distinctions.

The gap between the surface and underlying terms:

- *component vs mechanism*: a mechanism is broader than a component — it includes primitives, controls, visual elements, and (in principle) non-UI substrates like keyboard shortcuts or gesture systems. In the current corpus, almost all mechanisms are components, so the surface term works. If non-component mechanisms become relevant later, the tag can be renamed or extended through the changelog rather than pre-emptively complicated now.
- *pattern vs move*: in the project's framing, patterns *are* moves (per `relationship-vocabulary.md` §"Patterns as generative moves"). `pattern` is the noun, `move` is the active framing. Using `role:pattern` doesn't lose the move framing — that lives in the prose and the operational test in `pattern-definition.md`.

If a future audit shows the gap widening — e.g., a recurring need to mark mechanisms that aren't components — the changelog process renames or extends the tag. The default is to start with the lighter surface terms.

## Two framings

Mirroring the framings that shape `typed-edges.md` and `umbrella-role.md`:

1. *Suggestion, not matching.* The role tag is a hint about how to read the page, not a predicate that drives validation. A page being marked `role:pattern` means "expect this to act like a generative move"; it does not commit the system to schema validation, completeness checks, or generated views.

2. *Authored, not generated.* The tag is hand-applied by authors at MDX-edit time. There is no auto-classification, even though `pattern-definition.md`'s minimum-pattern-test could in principle drive one. Auto-classification would be matching-grade reasoning over pages that the project deliberately keeps suggestion-grade.

## Scope

This plan covers the minimum that lets the role distinction be asked cleanly:

- Phase A: survey of the corpus to validate the binary (component / pattern / umbrella) and identify ambiguous pages
- Phase B: add `role:*` tags to MDX, update extraction, validate
- Phase C: disentangle `enables` edges that are really realisation edges — *deferred*; covered separately if the corpus shows it's needed

Out of scope: any UI rendering of role differences, any role-aware queries, any role-driven generation. Those become possible once the role exists; they are not the gate. The contract-layer question from `vision.md` (whether contract-bearing controls are `move`, `contract`, or `mechanism + contract`) is also deferred — the role boundary is upstream of it.

## Phase A — Survey to validate the binary

Before changing any code or schema, walk the corpus and apply `pattern-definition.md`'s minimum-pattern-test to each page. Classify each as `component`, `pattern`, `umbrella`, or *ambiguous*.

### Survey approach

For each MDX file in `src/stories/`, write a short note answering:

1. Does the page describe a recurring human situation, with forces and consequences? → likely `pattern`
2. Does the page primarily describe API, rendering, states, props, or visual variants? → likely `component`
3. Does the page survey a territory of related moves rather than describe one? → `umbrella` (handled by the companion plan)
4. Does the page do *both* — describe a control's API *and* its full interaction contract? → ambiguous; capture the case
5. Are there controls (per WAI-ARIA APG) where the page reads as a pattern despite living in a component-shaped folder? → ambiguous

The classification is not strictly tied to folder. `src/stories/operations/` contains both component-like pages (Input, Checkbox) and move-like pages (Undo, Toast). `src/stories/foundations/` contains pages that are foundation-roled (per `vision.md`'s longer role list); they are out of scope for this binary but should be noted in the survey for completeness.

### Gate criteria

- Does the binary hold cleanly across the corpus, or is there a meaningful third zone where pages are *both* component and pattern (e.g., APG-style controls with full interaction contracts)?
- If ambiguous pages exist, is the right answer to (a) split them into two pages, (b) pick a dominant role and accept the loss, or (c) introduce a third role like `role:control` for contract-bearing components?
- Are there pages that resist all three roles (component, pattern, umbrella) and need a different role from `vision.md`'s longer list (`foundation`, `quality`, `concept`, `example`)? Capture; this plan only commits to the three core roles.
- Does the surface terminology (`component` / `pattern`) hold, or did the survey surface cases where the underlying mechanism / move framing reads differently than the surface name suggests?

If a meaningful third zone exists (more than a handful of pages), the binary is wrong and the plan needs to be revised before continuing to Phase B. The most likely revision is `role:control` as a distinct third role — but commit to it only if the survey shows it earning its keep, not pre-emptively.

### Files modified

New file: `plans/active/2026-05-role-survey.md` — survey notes and verdict. No code changes in Phase A.

## Phase B — Add tags and extraction

Only after Phase A closes with a clean binary (or with a sharpened set of roles).

### Authoring marker

Add `role:*` to the existing Storybook `Meta` tags array, alongside `atomic:*`, *only where the role is ambiguous from path*:

```mdx
<Meta of={ButtonStories} tags={['atomic:component', 'role:component', ...]} />
<Meta of={UndoStories} tags={['atomic:pattern', 'role:pattern', ...]} />
<Meta of={BotStories} tags={['atomic:pattern', 'role:umbrella', ...]} />
```

The `role:*` namespace is reserved for the future role vocabulary in `vision.md`. This plan commits explicit tags for `role:component`, `role:pattern`, and (via the umbrella plan) `role:umbrella` — the three roles that share folders or otherwise can't be reliably inferred from path.

`role:quality` and `role:foundation` are part of the *data model* (see schema below) but are *inferred from folder* — `src/stories/qualities/` is reliably quality-roled, `src/stories/foundations/` is reliably foundation-roled. No explicit tag is required for those pages. If the folder convention breaks down later (a quality page that's really an umbrella, a foundation page that's really a pattern in disguise), the changelog process introduces the explicit tag.

`role:concept` and `role:example` are not yet committed in either form. Neither has a stable folder convention or a current pressing case; promoting them is a future decision.

`atomic:*` tags stay as-is — they encode the compositional projection (how the thing is *made*) and are orthogonal to role (how the page is *read*). A page can be `atomic:pattern` *and* `role:component` if it documents a complex composed component without claiming to describe a generative move.

### Extraction

`scripts/extract-graph-data.ts` gains:

1. *Folder-inferred role*: pages under `src/stories/qualities/` get `role: 'quality'`; pages under `src/stories/foundations/` get `role: 'foundation'`. No tag required. The folder convention is the authority for these two roles.
2. *Tag-marked role*: read Storybook Meta tags. If a `role:*` tag is present (`role:component`, `role:pattern`, or `role:umbrella`), set the node's `role` field accordingly. A tag overrides the folder inference if both are present — but the only legitimate override is when a page in `src/stories/qualities/` or `src/stories/foundations/` is genuinely something else, which the changelog process would record.
3. *Coverage warning*: warn (not fail) on pages outside the quality/foundation folders that have no `role:*` tag, so the corpus's component/pattern/umbrella coverage is visible.
4. *Pattern-definition test as advisory*: extraction does *not* auto-apply `pattern-definition.md`'s minimum-pattern-test. The role is what authors marked or what the folder implies, even if the prose suggests otherwise. Mismatches are caught by the gardening sweep, not by extraction.

### Schema additions

```typescript
interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
  role?: 'component' | 'pattern' | 'umbrella' | 'quality' | 'foundation';
}
```

The `role` field is optional. Pages in `src/stories/qualities/` and `src/stories/foundations/` always get a populated role via folder inference. Pages elsewhere get `role: undefined` until tagged — signalling "not yet classified". This keeps Phase B incremental: tagging the component/pattern/umbrella corpus does not need to be complete before extraction is updated, but the quality and foundation pages are covered from day one.

### Verification

- A representative subset of pages have correct roles: Button → component, Undo → pattern, Bot → umbrella, Agency → quality (folder-inferred), Modality → foundation (folder-inferred).
- The graph reports a coverage count: how many nodes have an explicit `role:*` tag, how many were inferred from folder, how many are unset.
- *Invariant*: every page in `src/stories/qualities/` has `role: 'quality'`; every page in `src/stories/foundations/` has `role: 'foundation'`. Mismatches are gardening-sweep findings, not extraction failures.
- *Invariant*: `role:umbrella` pages do not require profile sidecars (per the umbrella plan's rule); `role:pattern` pages do (per the existing skip list in `relationship-vocabulary.md`); `role:component` pages do not (this is the new rule and follows from the boundary). Quality and foundation pages keep their existing profile expectations from `relationship-vocabulary.md`.
- Existing edges are unchanged — Phase B introduces the role tag, not edge changes.

### Files modified

- `scripts/extract-graph-data.ts` — read role tag, populate node.role
- `src/pattern-graph.json` — regenerated, nodes gain optional `role`
- `src/stories/**/*.mdx` — incremental tagging; complete coverage is not required
- `docs/language/relationship-vocabulary.md` — changelog entry

## Phase C — Disentangle `enables` (deferred)

The current `enables` edge collapses two relationships the report distinguishes:

- *Compositional dependency* — "Form needs Button to function" (the report's `prerequisite_of` / `depends_on`). Mechanism → move, "the building block makes the move possible." This is what `enables` currently encodes.
- *Realisation* — "Form-the-move is rendered using Form-the-component" (the report's `implements_via`). Move → mechanism, "the move's rendered form uses this component."

Once the role tag exists, an audit of existing `enables` edges can ask: which ones are really realisation? A small set probably is — pages that link to "the component that renders this pattern" rather than "the building blocks this pattern composes." Whether to split into a new edge type (`realised_by` or `implements_via`) is a real question with two coherent answers:

- *Yes, split.* The two relationships are different and the report's vocabulary supports the distinction. New edge type, new extraction logic, possibly a re-type of some existing edges.
- *No, keep collapsed.* `enables` covers both directions semantically; reverse traversal handles "what uses this?" vs. "what is this used by?"; adding an eleventh type is overhead without a concrete consumer.

Decide only if Phase A or Phase B's audit shows enough realisation-shaped edges to make the split worth it. Until then, the answer is: leave `enables` as-is.

## Open questions

1. *Is `role:control` a needed third role?* WAI-ARIA APG controls (Combobox, Tabs, Disclosure) document a complete interaction contract — semantics, keyboard, focus, states, use context. `pattern-definition.md` says these can be patterns. But they are also components in the obvious sense. A `role:control` would mark the contract-bearing case explicitly. Phase A's survey is the gate.

2. *Do `atomic:*` and `role:*` ever conflict?* `atomic:pattern` and `role:component` together would mean "this page documents a complex composition that is treated as a component, not as a generative move." Plausible but not yet exemplified in the corpus. Capture the case if it appears.

3. *What happens to multi-role pages?* If a page genuinely is both component and pattern (e.g., a Button page that also documents the "press to commit" interaction move), the cleanest answer is to split into two pages. The messier answer is to allow a list-valued role. Default: split if the survey shows this is more than a handful of cases.

4. *Should the role tag be inferred for unmarked pages?* Currently the plan says no — unmarked is unmarked. The opposite stance (default to `role:pattern`, since `src/stories/` is *the pattern repertoire*) has the appeal of zero coverage debt but loses the visibility of which pages haven't been classified. Prefer the explicit answer.

5. *Does the role tag belong in MDX or in a sidecar?* MDX is consistent with how `atomic:*` already works and keeps authoring co-located. A sidecar would be more inspectable but doubles the authoring step. Go with MDX unless a sidecar earns its keep elsewhere first.

6. *When do `role:quality` and `role:foundation` need explicit tags?* Currently the folder convention is the authority — `src/stories/qualities/` is reliably quality-roled, `src/stories/foundations/` reliably foundation-roled. The explicit tag becomes useful only if the convention breaks down (a quality page that's really an umbrella over multiple sub-qualities, a foundation page that's really a pattern in disguise, a quality or foundation page authored outside its folder). Until then, inferring is cheaper than authoring. The changelog process introduces the explicit tag if and when a real case appears.

7. *Should `role:concept` and `role:example` be added now?* No. Neither has a stable folder convention or a current pressing case. Promoting them is a future decision tied to actual material that needs the distinction.

## Research

The mechanism-vs-move boundary is well-trodden in HCI literature; the question is which angle to read. Light research, before Phase B:

- *WICG Open UI's anatomy / states / behaviors / concepts framing.* The report flags this as how mainstream teams describe components in machine-readable form. Worth a focused read to see if the framing maps cleanly onto `role:component` page expectations, or if it pulls toward the contract-layer question.
- *Custom Elements Manifest schema*, briefly. The report names this as the standard for component metadata. Useful as a reference point for what `role:component` pages might eventually carry, even if the project doesn't adopt the schema.
- *WAI-ARIA APG patterns*, specifically the contract-bearing ones (Combobox, Tabs, Tree). They are the strongest case for `role:control` as a third role. A focused read of one or two would surface whether the contract layer is rich enough to warrant a distinct role.

The research happens between Phase A and Phase B, per [`docs/project/plan-drafting.md`](../../docs/project/plan-drafting.md). Phase A's survey establishes what the corpus actually contains; the research stress-tests whether the binary holds against external precedent.

Out of scope for this plan's research: full IFML or KG-PLUB read. Both are interesting for other directions but don't bear on the role-tag decision.

## Phase ordering

```
Phase A (survey across corpus — gate)
    │
    ▼
research pass (Open UI anatomy, CEM, APG contract patterns)
    │
    ▼
Phase B (role:* tags, extraction, schema, incremental coverage)
    │
    ▼
Phase C (disentangle enables — only if audit shows it's needed)
```

Phase A is a research artifact, not code. Phase B is the smallest concrete data-model change. Phase C is intentionally deferred and may be answered with "no split" depending on what the audit shows.

This plan can run in parallel with [`2026-04-umbrella-role.md`](../completed/2026-04-umbrella-role.md). The two share the `role:*` namespace and the same Phase B mechanics; the umbrella plan landed first and this plan extends it. If both proceed, Phase B can be a single coordinated extraction-script change covering all three role values.
