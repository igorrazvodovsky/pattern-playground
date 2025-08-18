# Entity [Attr]

## Purpose

Maintain task objects (types & instances)

## Operational principle

Aafter defining a type and creating instance of it, instance can be listed, opened, updated, and removed; references to x across views stay consistent.

## State

- type: set
- name
- instances
<!-- cross-entity references (foreign keys) are attributes, but we -->
<!-- track reachability/index for navigation -->
<!-- refIndex: (Type, Type) -> set   // which types may refer to which -->
<!-- selection is UI-facing but model-agnostic -->
<!-- selected: set (Type, Inst[Type]) -->

## Actions

- defineType
- deleteType
- create
- remove
- list
- open
- close

## Syncs

Entity ↔ Attribute: Create instance → initialise attributes