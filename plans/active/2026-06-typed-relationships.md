# Typed relationships in MDX — authored, not inferred

Status: design agreed, pre-implementation (2026-06-23). Supersedes heading-wording edge
inference. Grounded in `research/umbrella-role-scale/` and
`research/typed-relationships-authoring/2026-06-23.md`.

## Problem

Edge types were derived by matching `## Related patterns` sub-heading *wording* against a map,
crossed with role-based defaults, inverse-direction sets, and quality-target promotion. Four
interacting mechanisms — you cannot predict a file's edges by reading it, and editing prose
silently mutates the graph.

## The model

Edges come from explicit, structured sources. Nothing is typed from prose wording.

1. *Frontmatter `relationships:`* — for edges you want in the graph but do not narrate.
2. *Inline `rel`* — on body links you narrate: `[Wizard](/patterns/wizard){rel="precedes"}`,
   `<PatternRef slug="wizard" rel="precedes">`, `<ComponentRef id="…" rel="enables">`.
3. *Mermaid decision trees* — `recommends` + situational hints (conditional routing; unchanged).

The `## Related patterns` section is *generated* from the union of edges as a
completes/completed-by index. Untyped links are decorative — never edges.

### The inference boundary (what the rewrite keeps vs removes)

The complaint was *wording* inference, not all inference. Structural/role-based inference that
is unambiguous stays (it reduces authoring burden — Shipman); wording inference goes.

- *Removed*: `HEADER_TYPE_MAP` (heading text → type), inverse-direction-by-heading, the
  `role:collection` blanket `surveys` override of typed links.
- *Kept (structural/role-based, predictable from the target, not from prose)*: decision-tree →
  `recommends`; link whose target is a `quality` page → `enacts`; untyped link on a
  `role:collection` page → `surveys` (membership). These are the only automatic typings, and
  each is documented as such.
- *Added*: explicit `rel` (inline + frontmatter) for everything else.

## Controlled vocabulary with fixed direction

Direction is the single most-documented failure of typed links (Halasz: NoteCards "explanation"
links flipped direction; Shipman reason 4). Resolution: direction is fixed *by the relation
name*, never an author-set field. Where a relation reads naturally from either endpoint, provide
a named *authoring alias* whose direction is fixed; the extractor normalises both to one stored
edge. The author picks the word that fits their sentence; the word determines direction.

| `rel=` (from this page P) | Stored edge | Canonical type | Notes |
|---|---|---|---|
| `precedes` | P → target | precedes | P sets up target |
| `follows` | target → P | precedes | authoring alias (inverse reading) |
| `enables` | P → target | enables | P is the part/mechanism |
| `composed-of` | target → P | enables | alias: P is the whole, target the part |
| `instantiates` | P → target | instantiates | P is a kind of target |
| `instances` / `variants` | target → P | instantiates | alias: P is the genus, target a species |
| `complements` | P ↔ target | complements | symmetric |
| `tangential` | P ↔ target | tangential | symmetric |
| `alternative` | P ↔ target | alternative | symmetric |
| `enacts` | P → target(quality) | enacts | also auto-inferred when target is a quality |
| `surveys` | P(collection) → target | surveys | membership; P must be `role:collection` |

`recommends` is *not* an authorable `rel` — it carries situational hints and comes only from
decision trees. `related` is the implicit fallback for an untyped *frontmatter* entry, but an
untyped *link* is decorative (no edge).

## Schema shapes

Frontmatter (declared once, keyed from the page's own view; bare string or `{to, note}`):

```yaml
relationships:
  composed-of:
    - to: bounded-choice
      note: "the constrained-field move"
    - sections
  instantiates: [good-defaults]
  complements: [data-entry, conversation]
```

Inline (the note is the surrounding sentence; no separate field needed):

```mdx
…each field is an act of [bounded choice](/patterns/bounded-choice){rel="composed-of"}…
```

## Generated index behaviour

Generate the *rendering*, not the *decision* (Obsidian MOC + Diátaxis: full auto-linking removes
the sensemaking and violates sparse-deliberate linking).

- Render grouped completes/completed-by sections from the node's edges (its own + computed
  inverse), in *declaration order* — authorial selection and ordering are preserved.
- Untyped links never appear.
- Per-edge label: the frontmatter `note`, else the target title.

## Invariants

- *I1 — Typing is opt-in.* A bare link is always valid and is never an edge. (Incremental
  formalization; the safeguard against the formality trap.)
- *I2 — Direction is fixed by the relation name*, never an author field, and validated at
  extract time.
- *I3 — The graph is a deliberate subset of the prose*, not a mirror. No feature may assume
  completeness.
- *I4 — The vocabulary is small and closed.* New types only via the relationship-vocabulary
  changelog, with justification.
- *I5 — The generated index renders but does not decide.* Author selection/order preserved;
  sparse.
- *I6 — Inline is primary for narrated edges, frontmatter the exception.* Duplicate or
  conflicting declarations across channels are detected and warned at extract.
- *I7 — `recommends` is decision-tree-only*; structural/role-based auto-typing is limited to the
  three cases named above.

## Implementation phases

- *A — remark plugin*: consume `{rel="…"}` on links so it renders cleanly (Astro + Storybook
  MDX). Validate `rel` against the vocabulary; surface unknown values.
- *B — extractor rewrite*: replace `HEADER_TYPE_MAP`/inverse/role-default/quality-promotion
  wording inference with (1) frontmatter `relationships:` parser, (2) inline `rel` parser
  (markdown attr + component attr), (3) decision-tree extraction (kept), (4) direction
  normalisation via the alias table, (5) the three kept auto-typings, (6) duplicate/conflict
  detection.
- *C — migration*: script reads current generated `pattern-graph.json` and writes
  `relationships:` frontmatter back into each file (preserving labels as `note`). Correctness
  test: regenerated graph diffs to ~zero against pre-migration.
- *D — generated-index renderer*: Astro component rendering the completes/completed-by section
  from a node's edges; remove hand-authored `## Related patterns` lists (now generated).
- *E — validation*: extract-time checks — unknown `rel`, broken targets, direction integrity
  (I2), cross-channel duplicates (I6), `surveys` source is a collection.

## Documentation updates (land with the phase that makes them true)

Canonical docs describe real behaviour; they change *with* the code, not ahead of it. The design
lives in this plan until then.

- *Phase B*: `docs/language/relationship-vocabulary.md` — replace the heading-extraction rules
  with the `rel`/frontmatter model, add the direction-alias table and the inference boundary,
  add a changelog entry. `docs/specs/graph-relationship-model.md` — update "Current graph data"
  to name the three sources.
- *Phase D*: `.claude/rules/pattern-content.md` — author-facing contract: how to declare
  relationships (frontmatter + inline `rel`), the vocabulary, and that `## Related patterns` is
  generated. Lands when authors should start using it.
- *Already true (do not re-touch)*: the umbrella→collection edits in
  `relationship-vocabulary.md` and `pattern-role-model.md` describe shipped behaviour.

## Open questions / risks

- *Annotation loss on migration*: header-derived labels become `note`s; inline-narrated edges
  lose their separate label (the sentence carries it, but the generated index falls back to
  target title). Acceptable, but check a sample after migration.
- *We are a deliberate exception*: the field (Roam/Obsidian) landed on untyped backlinks +
  opt-in typing. Justified here by a small curated corpus and settled vocabulary — but if
  authoring friction shows up in practice, I1 (opt-in) is the pressure valve, not a vocabulary
  expansion.
- *Generated `## Related patterns` vs woven prose*: body prose keeps its inline cross-references
  (now optionally typed); only the dedicated section is generated. Confirm this reads well on a
  page or two before rolling out.
