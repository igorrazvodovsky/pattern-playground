---
title: "Workflow scripts for the review loops"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-26"
area: "harness"
promoted_to: ""
---

# Workflow scripts for the review loops

Outline — iterate before executing.

## Problem

The three review skills orchestrate multi-agent fan-outs in prose:
`/move-review`'s recursive form (episode map → one subagent per episode →
composition pass), `/drift-review`'s five lenses, and `/reconcile-image`'s
blinded derivation. The orchestration is deterministic — fixed stages, fixed
isolation requirements — but each run re-improvises it from skill text, and
the properties the skills care most about (blinding, no-attribution, lens
reports kept separate) are disciplines the orchestrating session must
remember rather than properties the harness guarantees.

Claude Code's Workflow tool runs scripted multi-agent harnesses: deterministic
control flow, subagents that see only the prompt the script passes them,
per-stage effort selection. Same shape, with isolation enforced by
construction — a blinded deriver *cannot* anchor on the recorded image if the
script never passes it, and lens reports *cannot* be reranked into one list if
the script never merges them.

## Shape

One workflow script per loop. The skills keep the judgment content
(preconditions, section templates, verdict discipline) and invoke the scripts
for the fan-out:

- *move-review*: the orchestrator still validates refs and writes the episode
  map; the script takes the episode list, spawns one agent per episode with
  the self-contained prompt (template pasted in), and the composition pass
  stays a separate invocation gated on verdicts existing.
- *drift-review*: the script fans out the five lenses as five agents and
  collects the five reports into one output file without merging them.
- *reconcile-image*: the script spawns the blinded deriver(s); the recorded
  documents never enter any subagent prompt.

## Open questions (iterate before executing)

- Do the skills call the Workflow tool with an inline script, or do saved
  scripts live in the repo with the skills referencing them? Either way the
  skills' pasteable content (templates, checklists) must reach subagent
  prompts verbatim.
- Where scripts live if saved — and `docs/specs/agent-harness.md` records the
  contract either way.
- Verdict-writing spans sessions; a workflow run is single-session. The
  script boundary is probably "one fan-out per invocation", not "one loop per
  invocation".

## Validation

First run on a real branch review, compared against the prose-orchestrated
form: same outputs, blinding inspectable in the workflow journal, fewer
orchestration steps done by hand.
