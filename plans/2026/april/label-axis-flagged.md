# Label task — axis-flagged edges

Part of [label-queue.md](./label-queue.md). Three edges, one sitting. (Already completed; this plan is retained for reference and as a template for future axis-flagged batches.)

## What

The Phase 1 axis sanity check flagged three edges where the assigned type sits awkwardly against the altitude of the endpoints. These are advisory findings, not failures — the right output is a confirmation or a counter-proposal, not a forced label.

| # | Edge | Why flagged |
|---|---|---|
| 1 | `actions-navigation-step-by-step` —[`instantiates`]→ `actions-application-wizard` | Same altitude (Actions). |
| 2 | `actions-navigation-step-by-step` —[`instantiates`]→ `actions-application-form` | Same altitude (Actions). |
| 3 | `activities-onboarding` —[`complements`]→ `operations-empty-state` | Crosses two bands (Activities ↔ Operations). |

## How

For each edge:

1. Read the source MDX section that produced the edge (the `### ` subsection containing the link).
2. Decide one of three outcomes:
    - *Confirm* the current type. Author a one-sentence label that states why the altitude mismatch is genuine.
    - *Re-type* the edge. Note the proposed type in `proposedType` and add a changelog entry under *Observed drift*. The mechanical extraction will re-emit the original type on next run; until the underlying MDX header is changed, the label carries the corrected reading.
    - *Drop* the edge. Rare. Only when the link was a casual cross-reference that should never have been typed. Note in changelog.

3. For step-by-step → wizard/form: the question is whether `instantiates` is right or whether `enables` (wizard *uses* the step-by-step pattern) reads more truly. Both endpoints are in Actions, so altitude won't decide it; the question is taxonomic vs. compositional.

4. For onboarding → empty-state: the question is whether the relationship is symmetric (`complements`) or compositional (`enables`, with empty-state as building block). Direction would invert under the building-block convention.

## Output

Either edit the source MDX directly (append `— <label>` to the link bullet) or stage in a JSON file and run `scripts/write-labels.ts`. Three edges is small enough that direct editing is usually faster.

For re-types, the right move is an MDX header change (move the link to a different `### ` section), not a label override. Once the link is under a header that maps to the right type, the next extraction emits it. If a re-type is recorded as proposedType but not yet enacted, note it in the changelog and treat the MDX edit as a deferred editorial task.

## Done when

- The three flagged edges either carry a confirming label in MDX or have been moved to the correct `### ` section.
- Changelog entry in [docs/language/relationship-vocabulary.md](../../../docs/language/relationship-vocabulary.md) recording the outcomes (confirm / re-type / drop) under *Observed drift*.
- Re-running `extract-graph-data.ts` reflects the changes.
