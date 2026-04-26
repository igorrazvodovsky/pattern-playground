# Label task — enacts edges

Part of [label-queue.md](./label-queue.md). 89 edges. Largest task; do in batches.

## Status

- *Batch 1 (application actions)* — done 2026-04-26. Five missing labels authored (`data-entry → formality`, `form → formality`, `suggestion → adaptability`, `suggestion → formality`, `template → learnability`). Thirteen existing labels left as-is; five flagged in the changelog as override candidates for a later pass (CFF → agency/learnability/temporality, settings → privacy/adaptability). Extractor rule relaxed in the same sitting to accept ` - ` alongside ` — ` / ` – ` as a label separator, so authoring can use a hyphen without silently dropping the annotation.
- *Batch 2 (coordination + sense-making + seeking + navigation)* — done 2026-04-26. Two missing labels authored (`focus-and-context → agency`, `focus-and-context → adaptability`); both required restructuring nested-sub-bullet parents in [FocusAndContext.mdx](../../../src/stories/actions/evaluation/FocusAndContext/FocusAndContext.mdx) into single-link bullet lines. Eleven existing labels left as-is; six flagged as override candidates (overview-and-detail → malleability; hybrid-patterns → agency; view → malleability/density/adaptability; explanation → learnability). Extractor also relaxed to accept `*` bullets in the document-wide annotation pass.
- *Batch 3 (activities part 1)* — done 2026-04-26. Five missing labels authored (`collaboration → agency`, `conversation → conversation`, `embedded-intelligence → adaptability/agency`, `generated-content → agency`). Three required MDX restructuring: embedded-intelligence's prose-form bullets rewritten in `[Quality] — text` shape; generated-content's two-link line collapsed to one; collaboration and conversation gained new `### Enacted qualities` subsections. Two thin existing labels rewritten in the same sitting (`bot → learnability`, `help → learnability`); other six left as-is.
- *Batch 4 (activities part 2)* — done 2026-04-26. Six missing labels authored (`mastery → learnability/malleability/temporality/density`, `transparent-reasoning → agency`, `workspace → agency`). Restructuring: mastery's four quality bullets relocated into a new `### Enacted qualities` subsection; transparent-reasoning split a two-link bullet into separate agency and CFF bullets and fixed an en-dash bullet marker; workspace gained an `### Enacted qualities` subsection. Ten existing labels left as-is; three flagged as override candidates (`localization → adaptability`, `onboarding → learnability`, `prompt → agency`).
- *Batches 5–6* — pending.

## What

Every `enacts` edge in the graph is queued for a label. `enacts` is the bridge between patterns-as-moves and the qualities they strengthen, and it's the most generative relationship in the graph — the one an actor most needs to read in context. The type alone says *this pattern enacts that quality*. The label says *what about this move strengthens that quality.*

Roughly half of the queue already carries a label extracted from the per-link `— ` text in the MDX. Treat that as a draft. Where it earns its keep, leave it. Where it's too thin, write a richer one-sentence override.

## How

For each edge:

1. If the edge already has a label, decide whether it's enough. If yes, skip — the queue won't ask again. If too thin, write an override.
2. For edges without a label, read the relevant section of the source MDX. The pattern's *Generative profile* (when present, in the `*.profile.ts` sidecar) is also useful — the `enacts` slot of the profile and the edge label should be consistent.
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

Either edit the source MDX directly (append `— <label>` to the link bullet) or stage in a JSON file and run `npx tsx scripts/write-labels.ts <file>`. For enacts edges where the link doesn't yet exist in MDX as a bullet (the quality is mentioned only in inline prose), add it — a `### Enacted qualities` subsection inside `## Related patterns` is a natural home, but any single-link bullet anywhere in the document gets picked up by the document-wide annotation pass.

Per-batch commits: edit MDX, regenerate the graph, commit both.

## What to watch for

- *Recursion / restatement.* If the label reads "enacts agency by giving agency", scrap it and re-read the source.
- *The pattern doesn't actually enact the quality.* Rare, but the target-based promotion doesn't check semantics — it just sees a `qualities-*` link and types the edge `enacts`. If a pattern's prose mentions a quality only in passing (e.g. "see also: agency"), the edge should be re-typed or dropped. Note in changelog and either remove the link from the source MDX or live with the imprecision.
- *Cross-pattern echo.* When two patterns (say, Form and Data-entry) both `enact` the same quality (formality), their labels should differ — different mechanisms, even if related.

## Done when

- All 89 edges have a `— ` annotation in the source MDX that earns its keep.
- Changelog entry summarising: (a) any patterns where the link should be removed from MDX rather than labelled, (b) any qualities where many patterns enact in similar ways (signal that the quality might want a typology of enactment modes), (c) any MDX restructuring that was needed (e.g. adding `### Enacted qualities` subsections).
- Re-running `extract-graph-data.ts` reflects the labels.
