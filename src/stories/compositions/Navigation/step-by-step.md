import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Step by Step" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Step by step

Actors move through prescribed sequences using prominent back/next controls. The path is designed rather than emergent.

## Description

Navigation follows a designed sequence with clear progression indicators. Can range from simple two-step flows (search interface → results page) to complex multi-stage processes (questionnaires, purchase flows, onboarding). Back and next controls are the primary navigation mechanism, with supplementary options like skip, save and continue later, or jump to step.

This model optimises for task completion over exploration. It guides actors through designed paths, reducing cognitive load from navigation decisions whilst constraining freedom to deviate.

## Behavioural position

**Primary behaviours supported:**
- [Transactional search](../?path=/docs/foundations-intent--interaction--docs#transactional-search) — optimised for getting the job done
- Goal-oriented task completion with clear endpoints

**Deliberately constrained:**
- [Exploring](../?path=/docs/foundations-intent--interaction--docs#exploring) — intentionally limited to maintain focus
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) — lateral movement discouraged or impossible
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — constrained to sequence, even when destination is known

The constraint serves a purpose: maintaining focus and ensuring steps complete in order. However, transitions out of this mode are often unwanted—switching to other behaviours can feel like system failure unless the actor explicitly abandons the process.

## When to use

**Content structure:**
- Clear logical sequence that actors should follow
- Steps with dependencies (step 2 requires information from step 1)
- Processes with clear start and end points
- Linear workflows without branching

**Behavioural needs:**
- Task completion rate is critical
- Focus and reduced distraction are valuable
- Actors benefit from guidance
- Process must complete in sequence (payment before confirmation)

**Agency preference:**
- System-guided acceptable or desirable
- Reduced cognitive load valued over navigation freedom
- Commitment to completing the process

## When not to use

**Avoid if:**
- Actors need to work non-linearly
- Process has significant branching or optional steps
- Information gathering rather than transaction (consider [pyramid](../?path=/docs/compositions-structure-pyramid--docs))
- Long processes without clear milestones (creates abandonment risk)
- Actors may need to reference multiple steps simultaneously

**Alternative models:**
- [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) for sequences with flexible navigation
- [Step by Step + Pyramid hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#step-by-step--pyramid) for guided but flexible processes
- [Multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for structured but non-linear content

## Variants

### Linear wizard
Strict sequence, must complete steps in order.

**Characteristics:**
- Maximum constraint
- Clear progress indication
- No skipping steps
- Back allowed, forward only when valid
- See [Wizard pattern](../?path=/docs/patterns-wizard--docs) for detailed implementation

### Flexible sequence
Steps shown in overview, some skippable or reorderable.

**Characteristics:**
- Approaches [pyramid model](../?path=/docs/compositions-structure-pyramid--docs)
- Balances guidance with agency
- Good for onboarding or setup flows
- Optional steps clearly marked

### Branching sequence
Different paths based on choices or conditions.

**Characteristics:**
- More complex than pure step by step
- Maintains forward momentum
- Progress indication becomes trickier
- Common in decision trees, diagnostics

### Progressive disclosure sequence
Simple initial steps, complexity revealed gradually.

**Characteristics:**
- Reduces upfront intimidation
- Accommodates both simple and complex cases
- Requires careful design of "off-ramps"

## States

### Step states
- **Completed** — step finished and validated
- **Current** — step actively being worked on
- **Upcoming** — steps yet to be reached
- **Skipped** — optional step bypassed (if allowed)
- **Invalid** — step with errors preventing progression

### Navigation states
- **Forward** — can proceed to next step
- **Blocked** — cannot proceed until current step valid
- **Backward** — can return to previous steps
- **Exit** — can abandon process (with confirmation)

### Progress states
- **Step N of M** — clear quantification of progress
- **Percentage complete** — alternative progress indicator
- **Time remaining** — estimate (use cautiously)

## Agency implications

**Locus:** System-centric by default, but can shift to human-centric with good escape hatches.

**Dynamics:** Static in strict wizards, dynamic in flexible sequences that adapt to choices.

**Granularity:** High-level. Actor chooses to engage with process, system controls navigation within it.

**Control trade-off:** Step by step dramatically reduces navigation [agency](../?path=/docs/foundations-agency--docs) in exchange for:
- Reduced cognitive load from navigation decisions
- Protection from errors (completing prerequisites first)
- Clear progress indication
- Focus on task completion

This constraint is appropriate when completion rates matter more than exploration. The [Wizard pattern](../?path=/docs/patterns-wizard--docs) discusses this tension in detail: wizards can protect or reduce agency depending on escape hatches, flexibility, and transparency.

**Critical**: Always provide clear ways to:
- Exit the process (save and continue later, abandon with confirmation)
- See overall structure (where am I in the process?)
- Return to previous steps when possible

## Implementation patterns

### Progress indicators
- **Stepper** — numbered steps with current highlighted
- **Progress bar** — visual percentage or fraction complete
- **Breadcrumb** — step names showing path
- **Step list** — sidebar showing all steps and current position

### Navigation controls
- **Back/Next buttons** — primary navigation mechanism
- **Step jumping** — click step indicators to jump (if allowed)
- **Keyboard shortcuts** — Enter to advance, arrow keys to move
- **Save and exit** — preserve state for later continuation

### Validation approaches
- **Step validation** — must complete current step to proceed
- **Deferred validation** — gather all information, validate at end
- **Inline validation** — real-time feedback as actor completes fields

### Mobile considerations
- **Vertical layout** — steps stack vertically
- **Swipe gestures** — supplement or replace back/next buttons
- **Minimal chrome** — focus on content, not navigation
- **Clear progress** — especially important on small screens

## Accessibility

### Keyboard navigation
- Tab moves through form fields
- Enter submits current step
- Back/Next buttons keyboard accessible
- Escape key provides exit option (with confirmation)

### Screen readers
- Progress announced ("Step 2 of 5: Payment Information")
- Step transitions announced
- Validation errors announced immediately
- Form role with aria-label describing purpose

### Focus management
- Moving to next step focuses first input
- Returning to previous step restores focus
- Validation errors receive focus
- Clear focus indicators throughout

### Progress indication
- Progress communicated in accessible text, not just visually
- Completed steps marked with checkmarks or similar
- Current step clearly identified
- Upcoming steps indicated

## Related patterns

### Implements this model
- **[Wizard pattern](../?path=/docs/patterns-wizard--docs)** — detailed implementation of strict step by step navigation
- E-commerce checkout flows
- Multi-step forms and onboarding
- Survey and questionnaire interfaces

### Complements
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) — enables returning to specific steps via URL
- Progress indicators and steppers
- Form validation patterns
- Save and resume functionality

### Precursors
- Complex single-page forms → step by step to reduce overwhelm

### Evolution paths
- Step by step → [Step by Step + Pyramid hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#step-by-step--pyramid) when flexibility becomes important
- Strict wizard → flexible sequence as actors gain expertise

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed., "Step by Step" pattern
- Nielsen Norman Group (2015) [Wizard Design Pattern](https://www.nngroup.com/articles/wizards/)
- Nielsen Norman Group (2017) [Checkouts: Progress Indicators](https://www.nngroup.com/articles/checkouts-progress-indicator/)
