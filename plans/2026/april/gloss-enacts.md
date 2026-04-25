# Gloss task — enacts edges

Part of [gloss-queue.md](./gloss-queue.md). 89 edges. Largest task; do in batches.

## What

Every `enacts` edge in the graph is queued for a gloss. `enacts` is the bridge between patterns-as-moves and the qualities they strengthen, and it's the most generative relationship in the graph — the one an actor most needs to read in context. A typed edge alone says *this pattern enacts that quality*. The gloss says *what about this move strengthens that quality.*

## How

For each edge:

1. The edge already carries a `label` for ~50% of cases — the original `— `-annotation from the source MDX. Treat the label as a draft, not the gloss. The gloss should be a tightening: more specific about the mechanism, less restating of the connection.
2. For edges without a `label`, read the relevant section of the source MDX. The pattern's *Generative profile* (when present, in the `*.profile.ts` sidecar) is also useful — the `enacts` slot of the profile and the edge gloss should be consistent.
3. Write one sentence per edge. The sentence should answer: *what specific aspect of this move strengthens this quality?* Not *that* it does, but *what about it* does.

## Voice

- Active: "Settings let actors override system defaults, expanding agency over the system's behaviour."
- Specific to the move's mechanism: not "supports learnability" but "the suggestions teach option space without requiring the actor to recall it."
- Avoid recursive phrasing: "enacts agency by enacting agency over the system."
- Match the [design-repertoire voice from auto-memory](/Users/igors.razvodovskis/.claude/projects/-Users-igors-razvodovskis-Development-pattern-plgrnd/memory/feedback_description_voice.md) — frame from the human situation inward, not from the implementation outward.

## Suggested batching

89 edges across many source patterns. Group by source pattern; ~15-20 edges per batch keeps each session bounded and lets each MDX be read once.

Loose grouping:

| Batch | Sources | ~Count |
|---|---|---|
| 1 — application actions | ai-completion, assisted-task-completion, cognitive-forcing-functions(+human-goes-first), data-entry, form, nextbest-action, settings, suggestion, template | ~20 |
| 2 — coordination + sense-making + seeking + navigation actions | messaging, focus-and-context, overview-and-detail, hybrid-patterns, progressive-disclosure, annotation, explanation, view | ~12 |
| 3 — activities (part 1) | ai-tuning, bot, collaboration, conversation, embedded-intelligence, generated-content, help | ~12 |
| 4 — activities (part 2) | localization, mastery, onboarding, prompt, transparent-reasoning, workspace | ~14 |
| 5 — foundations | assistance, collaboration, data-information, delegation, information-architecture, intent-interaction, modality, prose, material-layout, material-typography | ~22 |
| 6 — operations | autocomplete, autofill, good-defaults, popover, sections | ~7 |

Six batches; each is its own session, each commits separately.

## Output

`gloss-enacts.json`, shape matching `merge-glosses.ts`:

```json
{
  "entries": [
    { "source": "...", "target": "qualities-...", "type": "enacts", "gloss": "...", "glossSource": "manual" }
  ]
}
```

Merge per batch: `npx tsx scripts/merge-glosses.ts gloss-enacts.json`. Re-running between batches preserves prior glosses.

## What to watch for

- *Recursion / restatement.* If the gloss reads "enacts agency by giving agency", scrap it and re-read the source.
- *The label is enough already.* For some edges, the existing `— ` label is already a gloss-grade sentence. In that case, copy the label into `gloss` and note in the changelog that the label/gloss distinction collapsed for this batch — useful signal for whether the gloss layer is earning its keep across the whole queue.
- *The pattern doesn't actually enact the quality.* Rare, but the target-based promotion doesn't check semantics — it just sees a `qualities-*` link and types the edge `enacts`. If a pattern's prose mentions a quality only in passing (e.g. "see also: agency"), the edge should be re-typed or dropped. Note in changelog and either remove the link from the source MDX or live with the imprecision.
- *Cross-pattern echo.* When two patterns (say, Form and Data-entry) both `enact` the same quality (formality), their glosses should differ — different mechanisms, even if related.

## Done when

- All 89 edges have a `gloss`.
- Changelog entry summarising: (a) any patterns where the link should be removed from MDX rather than glossed, (b) any qualities where many patterns enact in similar ways (signal that the quality might want a typology of enactment modes), (c) any cases where the label/gloss distinction collapsed (signal about whether glossing this layer is worth the cost).
- Re-running `extract-graph-data.ts` preserves all glosses.
