import { Canvas, Story, Meta, Subtitle } from '@storybook/addon-docs/blocks';

<Meta title="Patterns/Undo" />

# Undo

Enables actors to reverse an action, providing confidence and reducing anxiety around exploration or mistakes.

## Structure

- Trigger
- Feedback
- Scope

## Linear vs. non-linear undo

- Single-action undo: Reverses only the most recent action.
- Multi-action undo: Allows reversing multiple actions sequentially.

- Selective undo: Allows to pick a specific action from a history to undo, without affecting subsequent actions.
- Regional undo: Enables undoing operations within specific regions or contexts
- Branching models: Creates tree-like structures where actors can explore alternative paths

## Collaboration

...


## Related patterns

- Version history
- [Status feedback](../?path=/docs/patterns-status-feedback--docs): Provides immediate feedback on the undo action.
- [Command menu](../?path=/docs/patterns-command-menu--docs): Can be used to access undo options.
- [Activity log](../?path=/docs/patterns-activity-log--docs): Displays a history of actions that can be undone.
