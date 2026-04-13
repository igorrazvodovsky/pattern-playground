# Typed edges for the pattern graph

## Context

The pattern graph (`src/pattern-graph.json`) has 131 nodes and 773 edges, all untyped `{source, target}`. But 48 of 120 MDX files with `## Related patterns` sections already use `### ` subcategory headers (Precursors, Follow-ups, Complementary, etc.) that signal relationship type. The extraction script (`scripts/extract-graph-data.ts`) ignores these signals, and also has a bug where commented-out links (`{/* ... */}`) are included in the graph.

### End goal

The end goal of typing is to make the graph usable as a *knowledge surface for design generation* — a structure an LLM agent (or a human reader thinking generatively) can draw on when proposing design moves. Visualisation is one consumer; the primary value is in the data being structured enough to support reasoning about how patterns combine.

### Two framings that shape the plan

1. *Suggestion, not matching.* The library is not mature enough to support structured retrieval. Edges, tags, and decision-tree conditions are all *hint-grade* — they describe what has been useful in similar situations, not predicates to be matched against a query. An agent uses the graph as context for judgement, not as a lookup table.

2. *Patterns as generative moves* (Christopher Alexander, *The Nature of Order*). Patterns are not catalogue items to be selected — they are transformations that produce *centres*. Design happens through sequences of structure-preserving moves, each acting on what already exists. The vocabulary and the graph should be read in this register: relationships describe how moves combine, not how options are picked.

These two framings are compatible and reinforcing. The first is an epistemic claim about the data (it's incomplete, fuzzy, hint-grade). The second is an ontological claim about the operation (design is transformation, not selection). Together they push in two directions: the data should be looser and the use should be transformative. See `docs/specs/relationship-vocabulary.md` for the full articulation.

### Plan scope

This plan covers **Phase 0** (vocabulary foundation), **Phase 0.5** (generative profiles, `enacts` edges, decision-dimension inventory), and **Phase 1** (typed edge extraction). **Phase 2** (visual rendering) is deprioritised — kept as a deliverable but no longer blocking. **Phase 3** (decision tree extraction) is reframed: not as parsing for structured conditions, but as extracting situational hints that travel with `recommends` edges. **Phase 4** (query API) is sketched but not committed.

---

## Phase 0 — Relationship vocabulary

*Status*: drafted at `docs/specs/relationship-vocabulary.md`

Before implementing typed edges, the vocabulary itself needs a formal definition: what each relationship type means, its directionality, inverse pair handling (where applicable), SKOS alignment (where natural), and how each type should be read under the generative-moves framing.

The vocabulary document defines ten relationship types: `precedes`, `follows`, `enables`, `instantiates`, `complements`, `tangential`, `alternative`, `recommends`, `related`, and `enacts`. It also defines the concept of a *generative profile* (operates-on / produces / enhances) as node-level metadata.

Key decisions captured in the vocabulary doc:

- *Only `precedes`/`follows` form a true inverse pair.* `enables` and `instantiates` are distinct directed relationships (compositional vs. taxonomic), not inverses. Reverse traversal is handled by graph queries, not by storing inverse edges.
- *Conditions on `recommends` edges are situational hints, not predicates.* They preserve the original decision-tree question phrasings rather than being canonicalised. The library is not mature enough for a controlled vocabulary of conditions, and "suggestion not matching" is the right framing for how an agent should use them.
- *`enacts` is a new pattern → quality relationship*, promoting prose references from pattern pages to qualities pages into typed edges. This is the bridge between patterns-as-moves and the qualities they strengthen.
- *SKOS alignment is documented where it fits* (instantiates → skos:broader, complements/related → skos:related, alternative → skos:closeMatch) and explicitly noted where it doesn't (precedes/follows, recommends, enacts have no SKOS equivalents).

Phase 0 work: review and finalise the vocabulary document, treating its open questions as inputs to phase planning. No code changes.

---

## Phase 0.5 — Generative profiles, `enacts` edges, and dimension inventory

This phase makes the generative-moves framing operational with the smallest concrete additions that honour it. Three discrete pieces of work, each independent of the others.

### A. Generative profile annotations (proof of concept)

Pick 5–10 patterns spanning the activity-level hierarchy (e.g., a primitive like Button, a pattern like Confirmation dialog, a composition like Form, an activity like Onboarding, plus one or two cross-cutting patterns). For each, add a small *Generative profile* subsection to the MDX file with three short phrases:

- *Operates on*: what kind of structure or situation the move acts on
- *Produces*: what new centre or affordance the move creates
- *Enhances*: which qualities the move tends to strengthen (informal references)

These are short prose phrases, not structured fields. No controlled vocabulary, no normalisation. Place the subsection near the top of the pattern page, after the fun meter and definition.

The proof-of-concept population is the test of whether this addition pulls its weight before retrofitting across the whole library. If writing a generative profile feels natural and improves the page, expand. If it feels like ceremony, stop.

*Files modified*: 5–10 MDX files in `src/stories/`. No script or schema changes for the profiles themselves at this stage — they exist only in MDX prose. Extraction into structured node metadata is a follow-up if the experiment lands.

### B. `enacts` edge type

Promote pattern → quality references from `related` edges to typed `enacts` edges. The extraction logic is identical to Phase 1's typed-link extraction (which adds the edge type during parsing) — `enacts` is detected by the *target* being a quality page (`qualities-*` ID) rather than by an MDX header.

*Files modified*:
- `scripts/extract-graph-data.ts` — add target-based type assignment for quality references
- `src/pattern-graph.json` — regenerated output now contains `enacts` edges

*Verification*: spot-check a pattern with explicit quality references (e.g., a pattern that names Agency or Privacy in its prose). The edge from that pattern to the quality should now be `enacts`, not `related`.

### C. Decision-dimension inventory

Produce `docs/specs/decision-dimensions.md`: a snapshot of what dimensions the library currently uses to discriminate between patterns, extracted from the 8 active decision trees. This is a *research artifact*, not a controlled vocabulary — the goal is to surface what the library already reasons about and, by absence, what it doesn't.

The document lists, for each pattern that has a decision tree, the questions its tree branches on. Example entries:

- *Deletion*: reversibility, recreation effort, impact scope
- *Notification*: action required, immediate attention, status communication, dismissibility
- *Form*: option count, search need, multi-select, label uniformity
- *Localization*: language boundaries, cultural context, regional boundaries, AI presence
- *Navigation*: continuous space, prescribed sequence, hierarchy depth, workspace richness, cross-section workflows

The artifact is interesting partly for what it includes and partly for what it omits. It points to where the library's conceptual coverage is thin (no decision tree currently reasons about latency, async-vs-sync, persistence, multi-user state, or AI-specific concerns) and where future pattern work might focus.

*Files modified*: new file `docs/specs/decision-dimensions.md`. No code changes.

*Verification*: read the document. The value is in the inventory itself, not in any downstream consumer.

### Phase 0.5 ordering

A, B, and C can happen in any order or in parallel. None blocks the others. Recommended order: C (lowest cost, surfaces useful research output), then B (small mechanical change), then A (the experimental piece).

```
┌─────────────────────────┐
│  MDX files (120 files)  │
│  ### Precursors         │
│  ### Follow-ups         │
│  ### Complementary      │
│  ### (flat list)        │
└───────────┬─────────────┘
            │ extract-graph-data.ts
            ▼
┌─────────────────────────┐
│  pattern-graph.json     │
│  edges: [{              │
│    source, target,      │
│    type, label?         │  ◄── NEW
│  }]                     │
└───────────┬─────────────┘
            │ import
            ▼
┌─────────────────────────┐
│  PatternGraph.tsx        │
│  data-edge-type on <line>│  ◄── NEW
│  Edge type filter UI     │  ◄── NEW
└───────────┬─────────────┘
            │ styled by
            ▼
┌─────────────────────────┐
│  pattern-graph.css       │
│  dash patterns per type  │  ◄── NEW
│  arrowhead markers       │  ◄── NEW
└─────────────────────────┘
```

---

## Phase 1 — Typed edges from Related patterns sections

### Edge type vocabulary

Map `### ` headers to 7 edge types (frequencies from codebase):

| Type | Headers (→ count) |
|---|---|
| `precedes` | Precursors (33), Precursor patterns (2) |
| `follows` | Follow-ups (23), Follow-up patterns (2), Follow-ups & Complements (1) |
| `complements` | Complementary (29), Complements (7), Complementary patterns (2) |
| `tangential` | Tangentially related (13) |
| `alternative` | Alternatives (6) |
| `enables` | Containers and primitives (1), Related primitives (1), Mechanisms (1), Components (1), Conversational primitives (1) |
| `instantiates` | Foundation (2), Applied in (2), Implements this model (1) |

Thematic headers (e.g., "Core collaborative components", "Human-AI collaboration", ~14 unique) and the one malformed link header map to `related` with the original text as `label`. The header text is also captured as a *tag* on the linked patterns (see "Tag extraction" below).

Flat lists (72 files) and prose links default to `related`.

`enacts` is added by Phase 0.5.B and detected by target ID prefix (`qualities-*`), not by header. Phase 1 simply needs to leave room for it in the schema.

### Tag extraction (from thematic subcategories)

When a `### ` header doesn't match any of the typed edge categories above, it's a *thematic subcategory*. Rather than discarding the meaning (current plan: edge label only), promote it to a lightweight tag on each linked pattern.

- The header text is normalised gently: lowercase, hyphenated, no further canonicalisation. "Human-AI collaboration" becomes `human-ai-collaboration`. "Core collaborative components" becomes `core-collaborative-components`.
- Tags are stored on nodes in `pattern-graph.json`, in a new `tags?: string[]` field.
- No controlled tag vocabulary. Near-synonyms are tolerated. The library is not mature enough for tag normalisation either, and an LLM consumer can recognise related tags as related.
- The edge under the thematic header is still emitted as `related` with the original header text as `label`. The tag is additional, not a replacement.

### Changes to `scripts/extract-graph-data.ts`

**1. Fix commented-out links bug**

Before extracting links, strip `{/* ... */}` comment blocks from content. This is a simple regex: `/\{\/\*[\s\S]*?\*\/\}/g`. Apply before any link extraction.

**2. New `extractTypedLinks` function replacing `extractLinks`**

```typescript
interface TypedLink {
  target: string;
  type: string;
  label?: string;
}
function extractTypedLinks(content: string): TypedLink[]
```

Logic:

1. Strip `{/* ... */}` comment blocks from the full content
2. Find the `## Related patterns` section (from `## Related patterns` to the next `## ` or EOF)
3. Within Related patterns, split by `### ` headers. Map each header to an edge type via a lookup table. Links under a header get that type.
4. Links in the Related patterns section but *not* under any `### ` header get `type: 'related'`
5. Extract link annotation text (content after ` — ` or ` – ` on the same line) as `label`
6. Links *outside* Related patterns (prose, anatomy, variants sections) get `type: 'related'`
7. The link regex remains `../\?path=/docs/([a-z0-9][a-z0-9-]*)--docs`

**3. Edge deduplication**

When the same source→target pair appears multiple times:

- If one is typed and another is `related`, keep the typed one
- If both have specific types, keep both (rare — indicates the pattern genuinely has multiple relationship dimensions)

**4. Update Edge and Node interfaces**

```typescript
interface Edge {
  source: string;
  target: string;
  type?: string;
  label?: string;
}

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];  // NEW — populated from thematic subcategories
}
```

**5. Update edge and node building**

Replace `fileLinks` Map with a `typedFileLinks` Map storing `TypedLink[]`. Build edges with type and label. As thematic-header links are processed, also collect tags and merge them into the linked node's `tags` array.

### Files modified

- `scripts/extract-graph-data.ts` — extraction logic
- `src/pattern-graph.json` — regenerated output (edges gain `type`, optional `label`; nodes gain optional `tags`)

### Verification

```bash
npx tsx scripts/extract-graph-data.ts
```

Then verify:

- Edge count should be similar (slightly lower due to commented-out link fix)
- Spot-check Workspace.mdx edges: should have `precedes`, `complements`, `follows`, `tangential` types
- Spot-check Form.mdx edges: should have `precedes`, `follows`, `complements`, `tangential`
- Flat-list files (e.g., Deletion.mdx) should all be `related`
- No links from `{/* */}` comment blocks should appear
- Patterns linked under thematic headers should have `tags` populated on their nodes

---

## Phase 2 — Visual rendering of edge types

*Status*: deprioritised. Kept as a deliverable for human navigation but no longer blocking. Under the design-generation framing, the graph data is the primary value; visualisation is one secondary consumer. Phase 2 can ship after Phase 1 and Phase 3 without holding them up.

### Changes to `PatternGraph.tsx`

**1. Update `RenderedEdge` interface**

Add `type` and optional `label` fields:

```typescript
interface RenderedEdge {
  id: string;
  source: string;
  target: string;
  x1: number; y1: number;
  x2: number; y2: number;
  type: string;
  label?: string;
}
```

**2. Read edge type from graph data**

In `buildGraph()`, pass through `type` and `label` from `graphData.edges` when constructing `simLinks` and `RenderedEdge[]`.

**3. Add `<defs>` with arrowhead marker**

Add a single arrowhead marker in SVG `<defs>` for directed edge types. The directed types are: `precedes`, `follows`, `enables`, `instantiates`. Undirected: `complements`, `tangential`, `alternative`, `related`.

**4. Render `data-edge-type` attribute on `<line>` elements**

```tsx
<line
  key={edge.id}
  className={edgeClass(edge)}
  data-edge-type={edge.type}
  x1={edge.x1} y1={edge.y1}
  x2={edge.x2} y2={edge.y2}
  markerEnd={isDirected(edge.type) ? 'url(#arrowhead)' : undefined}
/>
```

**5. Edge type filter UI**

Add a `Set<string>` state for visible edge types (all enabled by default). Add a `<fieldset>` with checkboxes below the existing color-mode toggle, following the same CSS pattern (`.pattern-graph__color-toggle`). Filter edges in the render pass.

### Changes to `src/styles/pattern-graph.css`

**1. Edge type differentiation via `stroke-dasharray`** (only on active/hovered edges to keep default view clean):

```css
.pattern-graph__edge--active[data-edge-type="precedes"],
.pattern-graph__edge--active[data-edge-type="follows"] {
  /* solid — default */
}
.pattern-graph__edge--active[data-edge-type="complements"] {
  stroke-dasharray: 4 2;
}
.pattern-graph__edge--active[data-edge-type="tangential"] {
  stroke-dasharray: 2 3;
}
.pattern-graph__edge--active[data-edge-type="alternative"] {
  stroke-dasharray: 6 2 1 2;
}
.pattern-graph__edge--active[data-edge-type="enables"],
.pattern-graph__edge--active[data-edge-type="instantiates"] {
  stroke-dasharray: 8 3;
}
```

**2. Arrowhead marker styling** — small, subtle, inherits stroke color.

**3. Edge filter fieldset** — reuse the `.pattern-graph__color-toggle` pattern with checkboxes instead of radios.

### Files modified

- `src/components/PatternGraph.tsx`
- `src/styles/pattern-graph.css`

### Verification

```bash
npm run storybook
```

Navigate to the graph story. Hover over nodes and confirm:

- Active edges show dash patterns matching their type
- Directed edges show arrowheads
- Edge type filter checkboxes toggle visibility
- Default (unhovered) view looks the same as before — type styling only appears on active edges

A reasonable default for `recommends` edges (added by Phase 3) is to render them as a separate overlay rather than as a layout input — toggleable but excluded from the force simulation. This is mentioned in the vocabulary doc's open questions and should be revisited when Phase 3 lands.

---

## Phase 3 — Decision tree extraction (situational hints)

Parse Mermaid flowcharts in the 8 active decision-tree MDX files and emit `recommends` edges. The relationship is reframed under the suggestion-not-matching framing: each edge carries the original decision-tree question phrasings as *situational hints*, not as canonicalised conditions to be matched against a query.

### Approach

1. *Mermaid parser*: extract the directed graph from `flowchart TD/LR` blocks. Walk each path from root to leaf. The questions and branch labels along the path become the situational hints attached to the resulting edge. Skip lines the parser can't handle gracefully rather than failing.

2. *Leaf-to-pattern resolution*: hand-curated mapping table (~40 entries across 8 trees). Manual because leaf labels use informal abbreviations ("Modal with details", "Pill-style toggles") that defeat automated matching. Leaves that don't map to patterns (e.g., "Consider redesign/priority") are skipped.

3. *Edge emission*: for each resolved leaf, emit one edge with:

   ```typescript
   {
     source: <pattern containing the decision tree>,
     target: <leaf pattern>,
     type: 'recommends',
     situationalHints: [
       { question: 'Is the deletion reversible?', branch: 'Yes' },
       { question: 'How quickly can it be recreated?', branch: 'Seconds' }
     ],
     sourceTree: 'deletion-decision-tree'
   }
   ```

   The `sourceTree` field provides provenance — useful for debugging extraction and for an agent to cite its sources.

4. *No canonicalisation*: question phrasings and branch labels are stored as raw text. No mapping to a controlled dimension vocabulary. The agent (or human reader) reads them as natural-language hints.

### Files modified

- `scripts/extract-graph-data.ts` — Mermaid parser, leaf mapping table, situational hint extraction
- `src/pattern-graph.json` — output gains `recommends` edges with `situationalHints` and `sourceTree`

### Verification

Run extraction. Spot-check that:

- Deletion's tree produces edges to Undo, Modal confirmation, Inline confirmation, Typed confirmation with hints describing reversibility and impact
- Navigation overview produces edges to its 8 leaf patterns with hints describing the branch path
- Notification produces edges to Dialog, Callout, Toast with hints describing action requirements and urgency

---

## Phase 4 — Query API (sketch, not committed)

A small TypeScript module exposing the queries an agent (or any consumer) would use against the graph. Lives at something like `src/pattern-graph-query.ts`. Functions return raw graph data, leaving interpretation to the caller.

```typescript
function findEnablers(patternId: string): Pattern[]              // reverse `enables`
function findInstantiations(principleId: string): Pattern[]      // reverse `instantiates`
function findAlternatives(patternId: string): Pattern[]
function findRecommendations(patternId: string): RecommendsEdge[]  // raw, with hints
function findByTag(tag: string): Pattern[]
function findEnactedQualities(patternId: string): Quality[]
function findEnactingPatterns(qualityId: string): Pattern[]
```

Inference patterns (transitive composition, co-instantiated foundations, alternative-conflict detection) can be added as separate functions if they prove useful. The lighter-weight default is to compute on demand rather than precompute and store.

This phase is sketched but not committed. It depends on Phase 1 and Phase 0.5 being in place, and on having a concrete consumer (an agent prompt, a CLI, a notebook) that exercises the queries. Without a consumer, the API would be speculative.

---

## Phase ordering and dependencies

```
Phase 0   (vocabulary doc, no code)
   │
   ├──► Phase 0.5.A (generative profiles, MDX only)
   ├──► Phase 0.5.B (enacts edges)  ────────────┐
   ├──► Phase 0.5.C (dimension inventory)       │
   │                                            ▼
   └──► Phase 1 (typed extraction + tags) ──► Phase 2 (visualisation, deprioritised)
                          │
                          ▼
                       Phase 3 (decision tree extraction)
                          │
                          ▼
                       Phase 4 (query API, sketch)
```

Phase 0.5 sub-phases are independent and can run in parallel. Phase 1 should land before Phase 3 (Phase 3 builds on the same extraction script). Phase 2 is unblocked by Phase 1 but no longer blocking. Phase 4 depends on a concrete consumer existing.

