# Agent repair

The agent handles its *own* trouble in understanding: ambiguity, low confidence, conflicting entities, or missing slots.

1. A → U: Signal trouble concisely and offer a candidate understanding or targeted question (disambiguate, confirm, or request a missing value).
2. U: Provide clarification or choose an option.
3. A: Acknowledge and resume the primary activity at the right step.
4. U (Optional): Sequence closer (see *sequence completion*).

## When to use
- Confidence below threshold; overlapping constraints (“size” could mean volume or dimensions).
- Multiple entity candidates, out-of-range values, or required data missing.

## Guidance
- Show **interpreted intent + parameters** and let the user edit.
- If a specific value is required, transition to *information capture**.

## Repair affordances
- One-tap buttons for options; “Assume default” (with preview); “See how I understood this.”

## Metrics
Repair resolution rate on first attempt; turns-to-repair; wrong-action rate after repair; drop-off during repair.

