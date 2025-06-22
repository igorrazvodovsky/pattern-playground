<!-- import { Meta } from '@storybook/addon-docs/blocks'; -->

<!-- <Meta title="Concepts/Task*" /> -->

# Task

## Purpose

The purpose of the task concept is to enable the decomposition of complex work into manageable, executable units that can be planned, assigned, tracked, and completed by any capable actor (human or artificial). Tasks provide a fundamental organizing principle for transforming intentions into outcomes through structured activity.

## Operational principle

When an actor receives a task specification including objectives and constraints, they will interpret your request, break it down into executable steps, perform those steps using available tools and knowledge, and deliver structured results that fulfill the original intent.

## State

- Specification: the formal or informal description of what needs to be accomplished
- Status: current execution state:
  - Uninitialized: No task exists
  - Submitted: User has provided a task request
  - Planning: System is analysing the request and formulating an approach
  - Executing: System is actively performing work using tools and knowledge
  - Asking: System requires user clarification or input to proceed
  - Completed: Task has been fulfilled and results delivered
  - Failed: Task could not be completed due to insurmountable obstacles
- Assignee: the actor responsible for execution
- Resources: available tools, information, and capabilities accessible to the actor
- Constraints: temporal, resource, quality, or scope limitations
- Outputs: artifacts or results produced during execution
- Progress: measurable indicators of completion degree

## Actions

- create: establish a new task with initial specification and constraints
- assign: allocate the task to a specific actor based on capability matching
- start: begin active execution, transitioning from assigned to in-progress
- update: modify task specification, constraints, or progress indicators
- block: suspend execution due to dependencies or resource unavailability
- resume: continue execution after resolving blocking conditions
- complete: finalize execution when all completion criteria are satisfied
- fail: terminate execution when completion becomes impossible within constraints

<!-- - `submit(request)`: User provides a task description
- `plan()`: System analyzes request and creates execution strategy
- `execute_step()`: System performs individual work components
- `ask_user(question)`: System requests clarification
- `provide_input(response)`: User supplies requested information
- `complete(results)`: System delivers final outputs
- `fail(reason)`: System terminates task due to inability to proceed -->

<!-- ## State transitions

Uninitialized → Submitted → Planning → Executing → (potentially Asking → Executing cycles) → Completed/Failed. -->


## Related

- Planning: before execution, tasks undergo planning to determine optimal approaches and resource requirements.
- Tool
- Artifact
- Material: tasks may reference or analyse stored materials. This enables tasks to work with user-provided content and data.
- Subtask: complex tasks can be decomposed into smaller, manageable subtasks. This hierarchical relationship enables sophisticated work breakdown and parallel execution.
- Citation: tasks that involve research or analysis incorporate citations to maintain credibility and traceability of information sources.
