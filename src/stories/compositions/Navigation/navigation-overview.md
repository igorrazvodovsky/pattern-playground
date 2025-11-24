import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Overview" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Navigation models

Structural patterns describing how screens, pages, or spaces connect to one another. These models shape which [navigation behaviours](../?path=/docs/foundations-intent--interaction--docs#navigation) actors can perform and how [agency](../?path=/docs/foundations-agency--docs) is distributed.

## Models

- [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) — central hub lists all sections, actors return to hub for cross-section navigation
- [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) — every page links to all others through global navigation
- [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) — hierarchical structure with global navigation for main pages, local navigation for subpages
- [Step by Step](../?path=/docs/compositions-structure-step-by-step--docs) — prescribed sequences with back/next controls
- [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) — hub lists sequence, actors can navigate sequentially or jump to any item
- [Pan and Zoom](../?path=/docs/compositions-structure-pan-and-zoom--docs) — continuous spatial navigation through large single spaces
- [Flat Navigation](../?path=/docs/compositions-structure-flat-navigation--docs) — minimal navigation, all functions accessible in one place
- [Hybrid Patterns](../?path=/docs/compositions-structure-hybrid-patterns--docs) — combinations of multiple models

## Decision tree

### By content structure

**Do you have a single continuous space (map, timeline, large image)?**
→ Use [Pan and Zoom](../?path=/docs/compositions-structure-pan-and-zoom--docs)

**Is there a prescribed sequence actors should follow?**
→ Use [Step by Step](../?path=/docs/compositions-structure-step-by-step--docs) for strict flows
→ Use [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) if actors should see overview and control sequencing

**Is content organised in clear hierarchies or categories?**
→ Use [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for structured browsing within sections
→ Use [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) if hierarchy is shallow (5-7 top-level items)

**Do you have many discrete tools/functions in one workspace?**
→ Use [Flat Navigation](../?path=/docs/compositions-structure-flat-navigation--docs)

**Do you have 5-8 major independent sections (especially on mobile)?**
→ Use [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs)

### By behavioural priority

**Actors need to navigate precisely to known locations**
→ [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) or [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) (highest efficiency)
→ [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) (good with sequence overview)
→ [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) (forces hub return, less efficient)

**Actors need to browse and discover**
→ [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) (excellent overview enables pattern recognition)
→ [Pan and Zoom](../?path=/docs/compositions-structure-pan-and-zoom--docs) (spatial exploration)
→ [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) (structured browsing)

**Actors need to complete focused tasks without distraction**
→ [Step by Step](../?path=/docs/compositions-structure-step-by-step--docs) (guided completion)
→ [Flat Navigation](../?path=/docs/compositions-structure-flat-navigation--docs) (no navigation interruptions)

**Actors need to stay updated on multiple areas**
→ [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) (hub can surface updates)

### By agency preference

**Maximum user agency (high control, accepts complexity)**
→ [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs)
→ [Pan and Zoom](../?path=/docs/compositions-structure-pan-and-zoom--docs)
→ [Flat Navigation](../?path=/docs/compositions-structure-flat-navigation--docs)

**Balanced agency (structure guides, doesn't constrain)**
→ [Pyramid](../?path=/docs/compositions-structure-pyramid--docs)
→ [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs)

**System-guided (reduces cognitive load, constrains movement)**
→ [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs)
→ [Step by Step](../?path=/docs/compositions-structure-step-by-step--docs)

### By scale

**Small (< 10 items)**
→ [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) with simple menu

**Medium (10-50 items)**
→ [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) for mobile
→ [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for desktop
→ [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) for sequential content

**Large (50+ items)**
→ [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs) + [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs) hybrid
→ Multiple [Pyramids](../?path=/docs/compositions-structure-pyramid--docs) with tree structure

**Very large or complex**
→ [Hybrid patterns](../?path=/docs/compositions-structure-hybrid-patterns--docs) combining multiple models

## Mix and match

Real applications often combine models. Common patterns documented in [Hybrid Patterns](../?path=/docs/compositions-structure-hybrid-patterns--docs):

- Hub + Fully Connected (hub provides entry, global nav enables cross-section movement)
- Tree + Fully Connected (global nav for top level, tree within sections)
- Step by Step + Pyramid (process overview with flexible sequencing)
- Fully Connected + Pan and Zoom (section navigation + spatial content)

## Implementation considerations

### Universal navigation features

All models benefit from:
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) for addressability
- [Search](../?path=/docs/compositions-search--docs) as escape hatch
- [Breadcrumbs](../?path=/docs/patterns-breadcrumbs--docs) for context (except Step by Step)
- [Command menu](../?path=/docs/patterns-command-menu--docs) for power users
- Clear escape hatches (except where intentionally constrained)

### Navigation cost trade-offs

The note from Tidwell et al. is relevant:

> "The presence of full global navigation everywhere is not without cost: it takes up space, clutters the screen, incurs cognitive load, and signals to the user that leaving the page doesn't matter."

Consider mode-appropriate navigation:
- Full navigation during [browsing](../?path=/docs/foundations-intent--interaction--docs#browsing)
- Minimal navigation during focused tasks (slideshow, wizard)
- Balance based on actor intent and context

### Visual design independence

Models can be rendered in various ways:
- Tabs, menus, sidebar trees for Fully Connected or Tree
- Cards, lists, grids for Hub and Spoke
- Progress indicators, stepper components for Step by Step

Choose visual treatment based on space constraints, device type, and brand requirements. Model selection precedes visual design decisions.

## Related

- [Information Architecture foundation](../?path=/docs/foundations-information-architecture--docs) — structural and organizational foundation that navigation models manifest
- [Intent & Interaction foundation](../?path=/docs/foundations-intent--interaction--docs) — behavioural patterns enabled by structural choices
- [Agency foundation](../?path=/docs/foundations-agency--docs) — control distribution implications

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed., Chapter 3: Navigation, Signposts, and Wayfinding
- Nielsen Norman Group (2024) [The Difference Between Information Architecture (IA) and Navigation](https://www.nngroup.com/articles/ia-vs-navigation/)
