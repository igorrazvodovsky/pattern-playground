import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Fully Connected" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Fully connected

Every page or screen links to all others through global navigation. Actors can reach any location from any other location with a single action.

## Description

Global navigation appears consistently across all pages—typically as a top menu, sidebar, or persistent header. The navigation might be single-level (5-7 items) or deep and complex (multiple levels with dropdowns), but what defines fully connected is complete connectivity: any page to any other page in one hop.

This is the dominant model for websites and many web applications. It maximises actor agency and navigation efficiency at the cost of increased cognitive load and screen space consumption.

## Behavioural position

**Primary behaviours supported:**
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — maximum efficiency for precise movement
- [Exploring](../?path=/docs/foundations-intent--interaction--docs#exploring) — freedom to follow curiosity without constraint
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) — can move laterally across sections whilst scanning

**Challenges:**
- Can overwhelm during focused tasks—too many exit points signal "leaving doesn't matter"
- High cognitive load from persistent decision-making
- [Transactional search](../?path=/docs/foundations-intent--interaction--docs#transactional-search) completion may suffer from distraction

The presence of full global navigation everywhere is not without cost: it takes up space, clutters the screen, incurs cognitive load, and signals that leaving the page doesn't matter.

## When to use

**Content structure:**
- 5-7 top-level sections that actors need to access frequently
- Shallow hierarchy (few levels deep)
- Sections with frequent cross-referencing
- Desktop or web applications with adequate screen space

**Behavioural needs:**
- Actors frequently navigate between sections
- Multiple entry points to content are valuable
- Actors have clear mental models of structure
- Cross-section workflows are common

**Agency preference:**
- Maximum user agency valued (high control)
- Navigation efficiency prioritised over simplicity
- Actors comfortable with complexity

## When not to use

**Avoid if:**
- More than 8-10 top-level sections (overwhelming)
- Mobile primary context (screen space constraints)
- Tasks require focused attention (navigation becomes distraction)
- Actors are new/infrequent users (complexity barrier)
- Content has deep hierarchies (consider [multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs))

**Alternative models:**
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) for mobile or simpler structures
- [Multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for deep hierarchies
- [Step by step](../?path=/docs/compositions-structure-step-by-step--docs) for focused processes
- Mode-aware navigation (hide global nav during focused tasks, show during browsing)

## Variants

### Single-level fully connected
All navigation options at one level (5-7 items).

**Characteristics:**
- Simplest fully connected model
- Best for flat content structures
- Lowest cognitive load variant

### Multi-level fully connected
Top navigation with dropdowns, mega menus, or sidebars revealing subsections.

**Characteristics:**
- Supports deeper structures
- Can become overwhelming
- Requires good information architecture
- Consider [Tree + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#multilevel-tree--fully-connected)

### Responsive fully connected
Adapts based on device: full navigation on desktop, hamburger menu on mobile.

**Characteristics:**
- Maintains model across devices
- Mobile variant approaches [hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) behaviour
- Requires thoughtful responsive design

### Priority+ pattern
Shows most important items, hides rest behind "more" menu.

**Characteristics:**
- Balances accessibility with space constraints
- Still fully connected (all options available)
- Good for medium-sized navigation (8-12 items)

## States

### Navigation item states
- **Current** — page actor is currently viewing
- **Active** — section containing current page (for multi-level navigation)
- **Hover** — interactive feedback on navigation options
- **Disabled** — unavailable based on permissions or context

### Navigation visibility states
- **Persistent** — always visible (classic fully connected)
- **Auto-hide** — hides on scroll, reappears on scroll up or hover
- **Collapsed** — hamburger or menu button reveals full navigation
- **Context-aware** — hidden during focused tasks, visible during browsing

## Agency implications

**Locus:** Human-centric. Actor controls all navigation paths with direct access.

**Dynamics:** Static allocation typically, but can support dynamic (personalised navigation based on behaviour).

**Granularity:** High-level. Actor navigates to sections/pages, not fine-grained content.

**Control trade-off:** Maximises navigation [agency](../?path=/docs/foundations-agency--docs) but increases cognitive burden. Every page offers many choices, requiring constant decision-making. This high agency is appropriate when:
- Actors are experienced with the system
- Navigation efficiency is critical
- Cross-section workflows are common
- Screen space permits persistent navigation

The cost: "navigation fatigue" where too many options create paralysis. Mitigation strategies include visual hierarchy, logical grouping, and progressive disclosure for complex structures.

## Implementation patterns

### Top horizontal navigation
- Most common on websites
- 5-7 items fit comfortably
- Can use dropdowns for subsections
- Clear hierarchy through position

### Sidebar navigation
- Common in web applications
- Supports longer lists (8-15 items)
- Can collapse for space savings
- Vertical space more generous than horizontal

### Mega menus
- Reveals full structure on hover/click
- Good for complex hierarchies
- Can include descriptions, icons, images
- Requires careful design to avoid overwhelming

### Tab navigation
- Visual metaphor of folders/sections
- Best for 3-5 major sections
- Clear current location
- Limited depth without secondary tabs

### Combined navigation
- Top bar + sidebar
- Separates concerns (top: sections, sidebar: within-section)
- Common in enterprise applications
- More complex but highly functional

## Accessibility

### Keyboard navigation
- Tab order follows visual order
- Skip links bypass navigation for repeat visitors
- Arrow keys for menu exploration (optional enhancement)
- Enter/Space activates links

### Screen readers
- Navigation landmark role
- Current page indicated in accessible name
- Hierarchical relationships announced
- Collapsible menus announce expanded/collapsed state

### Focus management
- Clear focus indicators
- Focus doesn't get trapped in menus
- Current page marked with aria-current="page"
- Dropdowns don't auto-expand on focus (require explicit activation)

## Related patterns

### Implements this model
- [NavBar composition](../?path=/docs/compositions-navbar--docs) — global navigation component
- Most website header patterns
- Application sidebars

### Complements
- [Command menu](../?path=/docs/patterns-command-menu--docs) — keyboard-driven alternative for power users
- [Breadcrumbs](../?path=/docs/patterns-breadcrumbs--docs) — supplements with location context
- [Search](../?path=/docs/compositions-search--docs) — alternative navigation path
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) — enables direct access to any page

### Precursors
- Small site with 3-4 pages naturally becomes fully connected
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) + frequent cross-navigation needs

### Evolution paths
- Fully connected → [Tree + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#multilevel-tree--fully-connected) as content grows
- Fully connected → mode-aware navigation (hide during focus, show during browse)

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed., "Fully Connected" pattern
- Nielsen Norman Group (2020) [Mega Menus Work Well for Site Navigation](https://www.nngroup.com/articles/mega-menus-work-well/)
- Nielsen Norman Group (2019) [Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/)
