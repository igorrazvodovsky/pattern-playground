# Attribute [Entity]

## Purpose

Define, validate, and edit properties on entity types/instances

## Operational principle

After adding attribute, every instance x:T admits a value for the attribute; edits validate and propagate.

## State

- attribute: set
- owner
- name
- type
- required
- editable
- renderMode: expanded, summary
- value

## Actions

- add attribute
- delete
- set
- clear
- rename
- set render mode

## Syncs

### Entity ↔ Attribute
- Drop attribute → purge values + update views
- Rename/Render change → view spec update
- Set value → run dependency graph
- Remove entity instance → cascade clears

### Entity/Attribute ↔ Representation
- Selection and cross-panel highlighting
- Render mode → panel composition: Attributes marked `expanded` vs `summary` drive list vs folded chips/buttons, etc.

### Entity/Attribute ↔ History
- Every schema/data change → append history step
