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
(`packages/components/src/demos/specs/reasoning-trace.json`) still writes its
trace into the spec: steps like searching, reading, and drafting exist only as
elements, with no data structure behind them.

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
  its own. Each action type names its `concept`
  ([patterns-and-concepts.md](../../docs/language/patterns-and-concepts.md));
  the delegating and reporting-back steps are the `request` and
  `reportComplete` actions of the
  [conversation for action](../../apps/patterns/src/content/concepts/conversation-for-action.mdx)
  entry, which exists and waits for them, and the agent's own steps
  (intending, searching, reading, drafting) get entries of their own when
  they are named here.
- Author a fixture trace that lives inside the shared world — an agent
  researching something the world already cares about (the biodiversity
  metrics thread on the Life Cycle Assessment document is a candidate), not a
  free-floating topic.
- Rewire `ActivityLogLLMReasoningDemo` to render from the trace.
- Check which other agent-facing demos (`prompt`, `conversational-form`) could
  draw on the same fixture.
- Retire the session task. `shared/data/task-types.ts` holds the shape of a
  task created during a session: the command menu's AI fallback and the
  `filtering.ts` demo make one through `components/task/task-utils.ts`. It is
  an ordinary task with an agent as its assignee. A task does not depend on
  who performs it: the same task can be assigned to a person or an agent, and
  reassigned between them. The separate shape is left over from a demo of an
  agent at work.

  - A session task is created with `createTask`, with the agent as
    `assignee`. Whatever kind the agent is, `assignee` has to accept it; this
    is the first case the agent-kind question above has to settle.
  - Its statuses (submitted, planning, executing, asking, completed, failed)
    become a second status sequence for staging, beside the fixture world's
    backlog-to-done one. A task uses whichever sequence it needs; nothing ties
    a sequence to a kind of performer. Whether `failed` is a state in that
    sequence or an action whose output is an error value is decided when the
    sequence is authored.
  - The exchange between whoever asked and the assignee is conversation for
    action, for any assignee. Whether the assignee promises, asks questions or
    closes the loop is a design choice for that conversation, not a property
    of agents.
  - The hand-written history becomes the agent's own steps as actions. A
    person's steps (comments, edits) are actions in the same log, so the
    history view stays the same for both.

  Done when `task-types.ts` and `task-utils.createTask` are gone, and the
  command menu and `filtering.ts` render from the same derived task view as
  the fixture world.

  Creating the actions at runtime means the view functions in
  `shared/data/world-views.ts`, now module-level constants over static JSON,
  have to accept a log that grows during a session. This is the first point
  where the world has to run rather than only replay, so decide it with the
  agent-kind question.
