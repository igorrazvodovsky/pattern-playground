import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Multilevel Tree" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Multilevel tree

Main pages connect through global navigation. Subpages connect only among themselves and to main pages. Movement between arbitrary subpages requires multiple hops through the hierarchy.

## Description

Global navigation provides access to top-level pages. Each top-level section contains subsections visible only after entering that section—typically through sidebars, subtabs, or expanded menus. This creates a tree structure where actors can move freely at the top level, but must navigate hierarchically within sections.

Common in large websites and enterprise applications where content has natural categorical divisions. Balances the navigation freedom of [fully connected](../?path=/docs/compositions-structure-fully-connected--docs) with the structure needed for deep content hierarchies.

## Behavioural position

**Primary behaviours supported:**
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) — structured exploration within known domains
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — efficient when mental model matches structure
- [Re-finding](../?path=/docs/foundations-intent--interaction--docs#re-finding) — hierarchy provides memory cues

**Challenges:**
- [Uncovering](../?path=/docs/foundations-intent--interaction--docs#uncovering) — opaque hierarchy frustrates actors
- [Exploring](../?path=/docs/foundations-intent--interaction--docs#exploring) — hierarchy constrains free exploration
- Cross-section browsing requires backtracking to top level

The model assumes actors can predict or learn where content lives in the hierarchy. When categorisation is unclear or content fits multiple categories, actors experience friction.

## When to use

**Content structure:**
- Clear hierarchical relationships between content
- Deep structures (3+ levels)
- Large content volume (50+ pages) with natural groupings
- Enterprise applications with functional divisions

**Behavioural needs:**
- Actors work primarily within sections
- Cross-section movement is less frequent
- Content categories are intuitive and stable
- Structure aids rather than obscures discovery

**Agency preference:**
- Balanced agency (structure guides without constraining)
- Hierarchy provides cognitive scaffolding
- Actors value organisation over maximum freedom

## When not to use

**Avoid if:**
- Content has no clear hierarchical structure
- Frequent cross-section navigation required
- Hierarchy depth exceeds 3-4 levels (becomes labyrinthine)
- Categories are ambiguous or overlapping
- Mobile-first context (consider [hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs))

**Alternative models:**
- [Fully connected](../?path=/docs/compositions-structure-fully-connected--docs) for shallow structures
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) for independent sections
- [Tree + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#multilevel-tree--fully-connected) to add cross-section links

## Variants

### Two-level tree
Global navigation for top level, single level of subnavigation.

**Characteristics:**
- Simplest tree structure
- Easy mental model
- Maximum three clicks to any content
- Common in medium-sized sites

### Deep tree (3+ levels)
Multiple levels of nested categories.

**Characteristics:**
- Supports very large content volumes
- Requires excellent information architecture
- Risk of "lost in hierarchy" feeling
- Needs strong wayfinding (breadcrumbs, search)

### Expandable tree
Sidebar or menu shows/hides nested levels.

**Characteristics:**
- Visual representation of full structure
- Good for complex applications
- Can become unwieldy beyond 3 levels
- Common in file explorers, documentation sites

### Faceted tree
Multiple independent hierarchies (e.g., by topic, by date, by author).

**Characteristics:**
- Actors choose organising principle
- Reduces "wrong category" problem
- More complex to implement
- Better as [hybrid with filtering](../?path=/docs/compositions-filtering--docs)

## States

### Top-level navigation states
- **Current section** — main category actor is within
- **Other sections** — accessible via global navigation
- **Expanded** — showing subsections (for dropdown/expandable variants)

### Subsection navigation states
- **Current page** — specific page being viewed
- **Current branch** — path from root to current page
- **Sibling pages** — other pages at same level
- **Child pages** — deeper levels available
- **Collapsed/Expanded** — for hierarchical sidebars

### Wayfinding states
- **Breadcrumb trail** — path from root to current location
- **Section indicator** — visual cue of current main section
- **Depth indicator** — how deep in hierarchy

## Agency implications

**Locus:** Shared. Structure guides navigation but provides escape hatches (global nav, search, breadcrumbs).

**Dynamics:** Static allocation. Hierarchy is predefined, though personalisation can reorder or highlight items.

**Granularity:** High-level (section choice) and fine-grained (subsection navigation) depending on depth.

**Control trade-off:** Medium [agency](../?path=/docs/foundations-agency--docs). Structure constrains arbitrary movement but provides cognitive scaffolding. Actors accept reduced navigation freedom in exchange for:
- Clear mental models
- Reduced choice paralysis
- Organised information
- Predictable patterns

The hierarchy communicates relationships and importance. Good tree structures feel natural; poor ones create frustration through opacity or misalignment with actor mental models.

## Implementation patterns

### Sidebar tree navigation
- Persistent sidebar showing current section structure
- Expandable/collapsible nodes
- Current page highlighted
- Common in documentation and enterprise apps

### Dropdown menus
- Global nav reveals subsections on hover/click
- One or two levels deep typically
- Good for moderate complexity
- Can use [mega menus](../?path=/docs/compositions-structure-fully-connected--docs#mega-menus) for rich previews

### Tab + sidebar combination
- Top tabs for main sections
- Sidebar for subsections within section
- Clear visual separation of hierarchy levels
- Common in admin interfaces

### Breadcrumb-driven
- Minimal persistent navigation
- Breadcrumbs provide primary wayfinding
- Click breadcrumb segment to navigate up
- Lightweight approach for confident actors

## Accessibility

### Keyboard navigation
- Tab/Shift+Tab moves through navigation items
- Arrow keys navigate within tree structures
- Enter/Space expands/collapses nodes
- Home/End jump to first/last items

### Screen readers
- Navigation landmark for main navigation
- Tree role for hierarchical structures
- aria-expanded for collapsible sections
- aria-level announces hierarchy depth
- Current page marked with aria-current="page"

### Focus management
- Focus follows logical tree order
- Collapsing branch doesn't lose focus
- Current location clearly announced
- Skip navigation available

### Visual indicators
- Clear hierarchy through indentation or nesting
- Visual differentiation of levels
- Current location highlighted
- Expandable nodes have clear affordance

## Related patterns

### Implements this model
- Documentation sites with sidebar navigation
- Enterprise admin panels
- E-commerce category browsing
- File system explorers

### Complements
- [Breadcrumbs](../?path=/docs/patterns-breadcrumbs--docs) — essential for wayfinding in deep trees
- [Search](../?path=/docs/compositions-search--docs) — escape hatch when hierarchy fails
- [Command menu](../?path=/docs/patterns-command-menu--docs) — quick access bypassing hierarchy
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) — enables direct access to any node

### Precursors
- [Fully connected](../?path=/docs/compositions-structure-fully-connected--docs) → multilevel tree as content grows and categories emerge

### Evolution paths
- Multilevel tree → [Tree + Fully Connected hybrid](../?path=/docs/compositions-structure-hybrid-patterns--docs#multilevel-tree--fully-connected) when cross-section links become common
- Deep tree (4+ levels) → multiple shallow trees or [search-first navigation](../?path=/docs/compositions-search--docs)

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed.
- Rosenfeld, Morville, Arango (2015) *Information Architecture*, 4th ed., Chapter 6: Organization Systems
- Nielsen Norman Group (2018) [Tree Testing: Fast, Iterative Evaluation of Menu Labels and Categories](https://www.nngroup.com/articles/tree-testing/)
