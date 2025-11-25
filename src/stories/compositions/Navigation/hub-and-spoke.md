import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Hub and Spoke" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Hub and spoke

Central hub lists all major sections. Actors navigate to spokes, complete tasks, and return to hub to access other sections. Spokes focus tightly on their purpose without linking directly to other spokes.

## Description

The hub serves as the single point of entry and navigation control. Each spoke is designed for its specific function, often with limited space for additional navigation. The model trades navigation flexibility for cognitive simplicity—actors always know how to get anywhere (return to hub first).

Most commonly found on mobile devices where screen space is limited and clear task focus is valuable. The iPhone home screen exemplifies the pattern: apps are spokes, the home screen is the hub.

## Behavioural position

**Primary behaviours supported:**
- [Monitoring](../?path=/docs/foundations-intent--interaction--docs#monitoring) — hub can surface updates and status from all spokes
- [Transactional search](../?path=/docs/foundations-intent--interaction--docs#transactional-search) — direct selection from hub when target is known

**Constrained behaviours:**
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — forces hub return even when destination is known
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) — limits lateral movement between related spokes

The constraint on navigating can frustrate actors who know their destination but must take two-step journeys. However, for [exploring](../?path=/docs/foundations-intent--interaction--docs#exploring), the hub provides clear overview of available spaces.

## When to use

**Content structure:**
- 5-8 major independent sections with distinct purposes
- Sections that function as separate mini-applications
- Mobile applications where screen space is premium

**Behavioural needs:**
- Actors need clear overview of all options
- Tasks within spokes are focused and complete
- Cross-spoke navigation is infrequent
- Monitoring multiple areas is important

**Agency preference:**
- System-guided navigation acceptable (lower user agency)
- Cognitive simplicity valued over navigation efficiency
- Clear structure reduces decision load

## When not to use

**Avoid if:**
- Actors frequently need to move between spokes (frustration from forced hub returns)
- Content has natural hierarchies or relationships (tree structure better)
- You have more than 8-10 sections (hub becomes cluttered)
- Desktop application with ample space for persistent navigation

**Alternative models:**
- [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) for frequent cross-section movement
- [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for hierarchical relationships
- [Hub and Spoke + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--fully-connected) to add cross-spoke navigation

## Variants

### Pure hub and spoke
Spokes contain no navigation to other spokes. Only path back is to hub.

**Characteristics:**
- Maximum simplicity
- Most constraining
- Best for completely independent sections

### Hub and spoke with limited cross-links
Spokes can link to closely related spokes directly.

**Characteristics:**
- Reduces hub return frequency
- Introduces some navigation complexity
- Good for sections with clear relationships

### Hub and spoke with global navigation
Hub provides entry point, but spokes include global navigation to all sections.

**Characteristics:**
- Becomes [hybrid pattern](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--fully-connected)
- Balances hub overview with navigation flexibility
- Common in mobile apps with bottom tab bars

## States

### Hub states
- **Active** — currently displaying, actors select destination
- **Returning** — navigated back from spoke, may need visual indication of previous context
- **Updated** — indicators show changes in spokes (badges, highlights, notifications)

### Spoke states
- **Active** — currently displaying content/functionality
- **Accessible** — available from hub
- **Restricted** — greyed out or hidden based on permissions or prerequisites
- **Notifying** — has updates or requires attention (shown on hub)

## Agency implications

**Locus:** System-centric. Structure forces navigation decisions—must return to hub for cross-spoke movement.

**Dynamics:** Static allocation. Navigation paths are predefined and unchanging.

**Granularity:** High-level. Actor chooses destination spoke, but limited control over navigation path.

**Control trade-off:** Reduces navigation [agency](../?path=/docs/foundations-agency--docs) but decreases cognitive load. Actors don't decide "how" to navigate, only "where" to go. This constraint is appropriate when:
- Clear task separation is valuable
- Reducing choice paralysis matters more than navigation efficiency
- Mobile context limits space for persistent navigation

## Implementation patterns

### Visual representations

**Grid or card layouts:**
- Tiles with icons and labels
- Works well with 6-9 items
- Scanning patterns are familiar

**List layouts:**
- Vertical or horizontal lists
- Better for many items (10+)
- Enables categorisation or grouping

**Tab bars (mobile):**
- 4-5 primary spokes in persistent bottom navigation
- Hub is often first tab (home icon)
- Combines hub entry with direct spoke access

### Hub content

**Minimal hubs:**
- Only navigation options
- Fast selection, minimal distraction
- iPhone home screen example

**Rich hubs:**
- Navigation plus contextual information
- Updates, notifications, recent activity
- Dashboard-like functionality
- Enterprise portals example

### Spoke design

**Focused spokes:**
- Single clear purpose
- Minimal additional navigation
- Exit route back to hub prominent

**Self-contained spokes:**
- Complete functionality within spoke
- May have internal navigation structure
- Back to hub always available

## Accessibility

### Keyboard navigation
- Hub items must be keyboard accessible
- Clear focus indicators on hub options
- Escape key returns to hub from spokes

### Screen readers
- Hub role communicated clearly (navigation landmark)
- Spoke relationships announced ("section 2 of 5")
- Return to hub control clearly labelled

### Focus management
- Moving to spoke sets focus appropriately
- Returning to hub restores focus to previous selection or first item
- Updates/notifications announced but don't steal focus

## Related patterns

### Implements this model
- [Workspace pattern](../?path=/docs/patterns-workspace--docs) — organisational containers often use hub and spoke
- Mobile app architectures with tab bars

### Complements
- [Command menu](../?path=/docs/patterns-command-menu--docs) — provides escape hatch for quick navigation without hub return
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) — enables direct spoke access from external sources
- [Search](../?path=/docs/compositions-search--docs) — alternative to hub browsing for known destinations

### Precursors
- [Flat navigation](../?path=/docs/compositions-structure-flat-navigation--docs) → hub and spoke when items exceed screen capacity

### Evolution paths
- Hub and spoke → [Hub and Spoke + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#hub-and-spoke--fully-connected) when cross-navigation becomes frequent
- Hub and spoke → [Multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) when hierarchies emerge

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed.
- Nielsen Norman Group (2015) [Mobile Navigation Patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/)
