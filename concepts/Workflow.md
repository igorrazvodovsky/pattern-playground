## Workflow [Task, Entity, Action]

## Purpose

Define sequences of actions that achieve a task.

## Operational principle
<!-- If the system understands user needs and system capabilities, then a workflow emerges that connects them. -->
After initiating a workflow for task, user and system actions are sequenced by stages;
completing all required stages yields task completion, while modifications may insert, remove, or reorder stages.

## State

- Flow: set
- taskOf: task
- Stage: Flow → set
- order
- active stage
- completed: set
- available: set; what’s next possible

## Actions

- start
- advance
- insertStage
- removeStage
- reset

## Syncs

- Entity/Attribute events update Workflow stages
- Representation syncs with Workflow
- History records workflow transitions

