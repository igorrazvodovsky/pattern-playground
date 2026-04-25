# Gloss task — axis-flagged edges

Part of [gloss-queue.md](./gloss-queue.md). Three edges, one sitting.

## What

The Phase 1 axis sanity check flagged three edges where the assigned type sits awkwardly against the altitude of the endpoints. These are advisory findings, not failures — the right output is a confirmation or a counter-proposal, not a forced gloss.

| # | Edge | Why flagged |
|---|---|---|
| 1 | `actions-navigation-step-by-step` —[`instantiates`]→ `actions-application-wizard` | Same altitude (Actions). Label: *"detailed implementation of strict step by step navigation"*. |
| 2 | `actions-navigation-step-by-step` —[`instantiates`]→ `actions-application-form` | Same altitude (Actions). No label. |
| 3 | `activities-onboarding` —[`complements`]→ `operations-empty-state` | Crosses two bands (Activities ↔ Operations). Label: *"often the canvas for onboarding."* |

## How

For each edge:

1. Read the source MDX section that produced the edge (the `### ` subsection containing the link).
2. Decide one of three outcomes:
    - *Confirm* the current type. Author a one-sentence gloss that states why the altitude mismatch is genuine (e.g. activity-scale and operation-scale patterns can legitimately complement when one is the canvas for the other).
    - *Re-type* the edge. Note the proposed type in the gloss, and add a changelog entry under *Observed drift* recording the re-type. The mechanical extraction will re-emit the original type on next run; until the underlying MDX header is changed, the gloss is the only place the corrected reading lives.
    - *Drop* the edge. Rare. Only when the link was a casual cross-reference that should never have been typed. Note in changelog.

3. For step-by-step → wizard/form: the question is whether `instantiates` is right or whether `enables` (wizard *uses* the step-by-step pattern) reads more truly. Both endpoints are in Actions, so altitude won't decide it; the question is taxonomic vs. compositional.

4. For onboarding → empty-state: the label *"often the canvas for onboarding"* reads as `enables` — empty-state enables onboarding (and the direction would invert under the building-block convention from the Phase 1 changelog). Worth checking.

## Output

`gloss-axis-flagged.json`, shape:

```json
{
  "entries": [
    {
      "source": "...",
      "target": "...",
      "type": "...",          // current type, even if proposing a re-type
      "gloss": "...",         // one sentence
      "glossSource": "manual",
      "proposedType": "..."   // optional — only when re-typing
    }
  ]
}
```

Merge: `npx tsx scripts/merge-glosses.ts gloss-axis-flagged.json`.

Note: `merge-glosses.ts` doesn't act on `proposedType`. Re-types are recorded for the changelog; actual edge-type changes happen by editing the source MDX header (so the next extraction emits the new type) or by extending the lookup table. Capture the decision; don't try to enact it via the merge.

## Done when

- Three glosses written and merged.
- Changelog entry in [docs/relationship-vocabulary.md](../../../docs/relationship-vocabulary.md) recording the outcomes (confirm / re-type / drop) under *Observed drift*.
- Re-running `extract-graph-data.ts` shows the three edges with `gloss` present and `glossSource: manual`.
