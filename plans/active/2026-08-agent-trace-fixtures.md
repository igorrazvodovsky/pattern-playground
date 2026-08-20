---
title: "Agent trace fixtures"
status: "active"
kind: "exec-spec"
created: "2026-08"
last_reviewed: "2026-08-15"
area: "shared-data"
promoted_to: ""
superseded_by: ""
---
# Agent trace fixtures

Outline, needs iteration.

## Context

The world carries an action log: typed action records over its individuals,
with named participants, effects stated as facts added and removed, and
`causedBy` provenance edges (`shared/world/actions.json`, typed by
`shared/data/action-types.ts`, specified in
[docs/specs/world-ontology.md](../../docs/specs/world-ontology.md)). Human
actions are covered; agent work is not. The agent reasoning demo
(`ActivityLogLLMReasoningDemo` in
`packages/components/src/demos/activity-log.tsx`) still hardcodes its trace as
JSX — steps like searching, reading, and drafting exist only as markup, with
no data structure behind them.

## Intent

Extend the action vocabulary to agent work, so a trace is a sequence of typed
actions rather than prose: forming an intent or hypothesis, searching, reading
a source, drafting, revising. Each step carries its participants (queries,
sources, the document being produced) and a provenance edge to the step that
prompted it. A trace then answers "what did the agent do and why" in the same
vocabulary the rest of the log uses.

## Work

- Decide the agent-action vocabulary: which action names, what participants
  each carries, whether an agent is an individual of kind `user` or a kind of
  its own.
- Author a fixture trace that lives inside the shared world — an agent
  researching something the world already cares about (the biodiversity
  metrics thread on the Life Cycle Assessment document is a candidate), not a
  free-floating topic.
- Rewire `ActivityLogLLMReasoningDemo` to render from the trace.
- Check which other agent-facing demos (`prompt`, `conversational-form`) could
  draw on the same fixture.
