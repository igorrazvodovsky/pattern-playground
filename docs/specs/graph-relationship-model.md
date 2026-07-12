# Graph relationship model specification

The pattern graph is a generated knowledge surface derived from authored MDX,
its frontmatter, and decision trees. It supports reasoning about how
interaction moves combine; it is not a rules engine.

## Epistemic stance

Edges, tags, situations, and decision-tree hints are suggestion-grade. They
preserve what has been useful or meaningful in the current corpus, not
predicates that can be matched mechanically against a design situation. The
consumer contract makes this operational: no pipeline step may match, filter,
or route on a situation or hint — they render as prose for judgement.

## Current graph data

- Source material is `apps/patterns/src/content/patterns/**/*.mdx`. The graph is
  language-only: pattern, quality, foundation, and collection nodes. Components do
  not contribute nodes — they resolve outside the graph, against Storybook's build
  output `index.json` (`packages/components/storybook-static/index.json`, with a
  cached fallback at `apps/patterns/storybook-index/index.json`), which is the
  resolution dataset for
  `<ComponentRef id>`. A build-time validator (`apps/patterns/integrations/validate-cross-references.ts`)
  checks every `<ComponentRef id>` against it, and every `<PatternRef slug>` in
  Storybook MDX against the content stems, failing the site build on any broken
  reference. See [2026-07-workspace-split-closure.md](../../plans/completed/2026-07-workspace-split-closure.md),
  workstream 2.
- *Component realisation* ("this move is realised by this component") is therefore
  not an edge type: it is a cross-dataset reference authored in frontmatter
  `realised_by` (a list of Storybook docs ids), validated by the cross-reference
  gate, emitted as `realisedBy` node metadata, and deliberately not rendered in
  the related-patterns block. `<ComponentRef>` body prose is citation, not claim.
  `enables` covers move composition within the language only. See the vocabulary
  doc §Component realisation.
- `scripts/extract-graph-data.ts` derives `apps/patterns/src/data/pattern-graph.json`
  and related generated data.
- Node metadata includes title, category, path, role, group, tags, the
  `situation` construct (initiating situation and resulting-context clauses),
  `realisedBy` (component realisation ids), and extracted classification
  fields where available.
- Edges carry `source`, `target`, `type`, and optional `label`,
  `incomingNote`, `extractedFrom`, a derived `situation` string, and
  situational hints. `situation` and `situationalHints` are never authored
  edge-side — each renders a judgement whose authorable home is a node's
  resulting-context clause or a decision tree respectively.

## Edge sources

Explicit channels (any MDX file):
1. *Frontmatter `relationships:`* — keyed by rel type (or authoring alias), values are arrays of bare slugs or `{to, note}` objects.
2. *Inline `{rel="type"}` on links* — `[text](/patterns/slug){rel="precedes"}` in body prose.
3. *`<PatternRef>` component props* — `<PatternRef slug="…" rel="enables">`. `<ComponentRef>` carries no rel: prose mentions are citations, and the realisation claim's home is frontmatter `realised_by` — cross-dataset node metadata against Storybook's `index.json`, not an edge; the extractor warns if a rel is authored (see the vocabulary doc §Component realisation).

Judgement homes that emit their edges:
1. *Frontmatter `situation.resulting` clauses with `sets-up:`* → one `precedes` edge per named pattern, carrying the clause as derived `situation` text.
2. *Mermaid decision trees* (flowchart + frontmatter `decision-trees:` leaf map) → `recommends` edges carrying `situationalHints`.

Direction is fixed by the relation name. Authoring aliases (`follows`, `composed-of`, `instances`, `variants`) normalise to canonical types with inverted direction where needed — see `docs/language/relationship-vocabulary.md` for the full alias table.

Rendering exemption: `role: quality` pages render no related-patterns section. A quality is a diagnostic lens, not a catalogue of its instances; the move→quality bridge is read on the pattern side via `enacts`. Edges are still extracted and stored — the exemption is in the renderer (`RelatedPatterns.astro`), not the graph. See the 2026-06-23 changelog entry in the vocabulary doc.

The exemption is deliberately one-directional. A pattern may still narrate a quality at length in its body (e.g. annotation's `## Temporal dimension` section) — that prose *is* the move→quality bridge told from the pattern side, which is where it belongs. Such a pattern therefore surfaces the quality twice: once as in-context narration, once as the generated `enacts` line. This redundancy is accepted — the two serve different jobs (reading vs. graph-navigation), so the renderer does not suppress an outgoing `enacts` whose target is also linked from body prose.

## Edge vocabulary

The settled edge vocabulary is:

- `precedes` / `follows`
- `enables`
- `instantiates`
- `complements`
- `tangential`
- `alternative`
- `recommends`
- `related`
- `enacts`
- `surveys`
- `hosts` / `hosted-by`

The detailed definitions, extraction rules, SKOS notes, situation-construct
guidance, and changelog live in
[`docs/language/relationship-vocabulary.md`](../language/relationship-vocabulary.md).
That document is the detailed vocabulary record; this spec is the current
contract summary.
