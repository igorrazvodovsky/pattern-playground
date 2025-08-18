# Representation [Entity, Attribute]

## Purpose

Map entities and attributes into perceptual forms, supporting multiple views, user-controlled switching, and progressive disclosure.

## Operational principle

If an entity or attribute exists in the model, then Representation provides at least one user-facing form of it; if the form changes (e.g. list → map, expanded → summary), all views remain consistent and in sync with underlying state.

## State

- spec: set
- targetEntity
- targetAttr: may be whole entity or specific attr
- mode: list, table, map, card, summary, expanded, audio, haptic, visual, etc.
- isActive
Runtime views
- View: set
- specOf
- showing
- focused

### Notes

- Spec = the declarative representation rule (“Ingredient.store is summary in list view”)
- View = the concrete instance of that spec currently shown to the user
- Separation lets trace what was specified vs what’s rendered now

## Actions

- add spec
- remove spec
- activate
- deactivate
- switch mode
- refresh
- focus

## Syncs

- Entity → Representation: Create entity instance → update views
- Attribute → Representation: Set attribute value → update views
- Dependency → Representation: Run dependency → update derived display
- History → Representation: Representation changes are recorded