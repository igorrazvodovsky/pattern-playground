# Understand the context before using a move

1. Inventory existing concepts in the design space
  - Identify each concept’s name, purpose, and operational principle (OP).
  - Check that each concept meets the criteria of being user-facing, independent, complete, and specific.
2. Map relationships between concepts
  - Use a dependency diagram to see extrinsic dependencies (what requires what) and possible subsets of the app.
  - Identify where complexity, redundancy, or inflexibility might exist.
3. Pinpoint the problem or opportunity
  - Are you trying to simplify the user experience?
  - Add flexibility?
  - Increase generality or specificity?
  - Automate or give more control?

# The six moves (three dual pairs)

Each move is a transformation applied to concepts (not features or UI widgets). The move changes the concept set or their boundaries to improve certain design qualities, often at the cost of others.

## A. Split ↔ Merge — trade-off: flexibility vs. simplicity

### Split
Take a single concept and break it into two (or more) independent concepts.

Use when:
- Users need separate control over sub-functions.
- One combined concept is blocking variation or specialisation.

Example: Split Photocopy into Print + Scan.

### Merge
Combine multiple concepts into a single one.

Use when:
- Speed and ease matter more than customisation.
- Tight coupling could enable special synergies.

Example: Merge Flashlight, Battery, and Charger into EmergencyFlashlight.

## B. Unify ↔ Specialise — trade-off: generality vs. specificity

### Unify
Replace multiple specialised concepts with one general-purpose concept.

Use when:
- Variants share key actions and state.
- Generalisation doesn’t overly compromise efficiency or clarity.

Example: Combine MailingList and AdminGroup into one List concept.

### Specialise
Split a general-purpose concept into multiple narrower, more optimised concepts.

Use when:
- Different variants serve meaningfully different scenarios.
- Specialisation adds recognisable value to distinct workflows.

Example: Lightroom’s separate Rating, Flag, and ColorLabel.

## C. Tighten ↔ Loosen — trade-off: automation vs. independent control

### Tighten
Increase synchronisation between concepts (make actions in one trigger actions in another).

Use when:
- Strong coupling prevents user errors.
- Workflow is predictable and automation adds value.

Example: Airplane toilet light is always on when locked.

### Loosen
Reduce synchronisation so concepts can operate independently.

Use when:
- Users need flexibility in sequencing or combining actions.
- Automation is causing friction or misfires.

Example: ProCamera lets focus point differ from exposure point.

# How to apply a move

1. Identify candidate concepts
  - Use the OP and state diagrams to locate overlap, redundancy, or coupling.
  - Look for “piggybacking” (an unrelated function stuffed into another concept).
2. Select the move
  - Match the nature of the design problem to the move’s trade-off.
  - Be explicit about which property you want to improve (e.g., flexibility, generality).
3. Refactor concepts
  - For split/unify/specialise, rewrite purposes and OPs for each resulting concept.
  - For tighten/loosen, adjust synchronisations, making changes explicit in sync definitions.
4. Update state and actions
  - Ensure each revised concept has self-contained state and actions aligned with its new purpose.
  - Make generic where possible (replace app-specific object types with type parameters).
5. Revise synchronisations (if applicable)
  - Add, remove, or modify syncs to reflect new concept boundaries.
  - Maintain the principle that syncs preserve each concept’s independent behaviour.

# Evaluate after applying a move
- Re-check concept criteria: Specific? Complete? Independent? User-facing? Familiar? Reusable?
- Assess trade-offs explicitly
  - What was gained (e.g., flexibility)?
  - What was lost (e.g., simplicity)?
  - Is the net effect aligned with the design goals?
- Check compositional synergy: Does the new arrangement enable functionality that neither concept could achieve alone?
- Test with OPs: Run through operational principles to ensure each concept still fulfills its purpose clearly.

<!-- TODO: Find a better place for it -->
5. Embedding moves in the broader concept design workflow

- During concept identification: Use moves to shape an initial set of concepts before locking in structure.
- During problem-solving: When you encounter UX or functional flaws, try a move instead of only tweaking UI or adding ad-hoc features.
- During iteration: Periodically review your concept inventory for opportunities to unify, specialise, split, merge, tighten, or loosen.
- During documentation: Explicitly note where a move has been applied, why, and what trade-off was made, so future designers can understand the rationale.