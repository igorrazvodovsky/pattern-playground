# Graph relationship model specification

The pattern graph is a generated knowledge surface derived from authored MDX,
its frontmatter, decision trees, and profile sidecars. It supports reasoning
about how interaction moves combine; it is not a rules engine.

## Epistemic stance

Edges, tags, and decision-tree hints are suggestion-grade. They preserve what
has been useful or meaningful in the current corpus, not predicates that can be
matched mechanically against a design situation.

## Current graph data

- Source material is `apps/patterns/src/content/patterns/**/*.mdx`. The graph is
  language-only: pattern, quality, foundation, and collection nodes. Components do
  not contribute nodes — they resolve outside the graph, against Storybook's build
  output `index.json` (`packages/components/storybook-static/index.json`, copied to
  `apps/patterns/public/storybook/index.json`), which is the resolution dataset for
  `<ComponentRef id>`. A build-time validator (`apps/patterns/integrations/validate-cross-references.ts`)
  checks every `<ComponentRef id>` against it, and every `<PatternRef slug>` in
  Storybook MDX against the content stems, failing the site build on any broken
  reference. See [2026-07-workspace-split-closure.md](../../plans/active/2026-07-workspace-split-closure.md),
  workstream 2.
- `scripts/extract-graph-data.ts` derives `apps/patterns/src/data/pattern-graph.json`
  and related generated data.
- Node metadata includes title, category, path, role, tags, and extracted
  classification fields where available.
- Edges carry `source`, `target`, `type`, and optional `label`,
  `extractedFrom`, and situational hints.

## Edge sources (three channels + three auto-typings)

Edges come only from explicit authoring or structural auto-typing. Heading-text inference has been removed.

Explicit channels (any MDX file):
1. *Frontmatter `relationships:`* — keyed by rel type (or authoring alias), values are arrays of bare slugs or `{to, note}` objects.
2. *Inline `{rel="type"}` on links* — `[text](/patterns/slug){rel="precedes"}` in body prose.
3. *`<PatternRef>`/`<ComponentRef>` component props* — `<PatternRef slug="…" rel="enables">`.

Structural auto-typings (invariant I7 — the only non-explicit edge sources):
1. Untyped body links on `role:collection` pages → `surveys`
2. Untyped body links from non-quality pages to quality pages → `enacts`
3. Mermaid decision-tree leaf nodes → `recommends`

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

The detailed definitions, extraction rules, SKOS notes, generative-profile
guidance, and changelog live in
[`docs/language/relationship-vocabulary.md`](../language/relationship-vocabulary.md).
That document is the detailed vocabulary record; this spec is the current
contract summary.
