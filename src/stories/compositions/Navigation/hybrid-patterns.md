import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Hybrid Patterns" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Hybrid navigation patterns

Real-world applications rarely implement pure navigation models. Hybrid patterns combine multiple models to balance competing needs, accommodate diverse content types, or serve different actor contexts.

## Why hybrid patterns matter

Pure models provide conceptual clarity, but actual implementations face constraints:
- Content with mixed characteristics (some hierarchical, some sequential, some flat)
- Diverse actor needs (novices need guidance, experts need efficiency)
- Multiple contexts (desktop vs mobile, browsing vs focused work)
- Evolution over time (features and content accumulate)

Hybrids address these realities. The challenge is maintaining coherence—each additional model increases cognitive load. Good hybrids feel integrated; poor ones feel like stitched-together fragments.

## Common hybrid patterns

### Hub and spoke + fully connected

Hub provides entry point and overview, but spokes include global navigation to all sections.

**Structure:**
- Home screen or dashboard lists all main sections (hub behaviour)
- Each section accessible from hub
- But once in a section, global navigation enables cross-section movement without hub return (fully connected behaviour)

**Agency balance:** Reduces pure hub and spoke's constraint (forced returns) whilst maintaining overview benefit. Shared locus—hub guides entry, actor controls subsequent movement.

**Common implementations:**
- Mobile apps with bottom tab bar (hub-like) plus hamburger menu (fully connected)
- Enterprise portals with dashboard entry plus persistent top navigation
- E-learning platforms with course hub plus cross-module links

**When to use:**
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) feels too constraining
- Cross-section workflows are frequent
- Mobile context benefits from hub clarity but needs navigation flexibility

**Implementation considerations:**
- Bottom tab bar + hamburger menu on mobile
- Dashboard + persistent top nav on desktop
- Clear distinction between "hub" and "in-section" contexts

### Multilevel tree + fully connected

Global navigation for top level, tree navigation within sections, but also cross-section links where natural.

**Structure:**
- Top-level pages fully connected via global menu (fully connected)
- Within sections, hierarchical navigation (multilevel tree)
- Contextual cross-section links bypass hierarchy when relationships exist

**Agency balance:** Structure guides but doesn't trap. Hierarchy provides organisation, fully connected top level enables flexibility, contextual links add shortcuts. Shared locus throughout.

**Common implementations:**
- Large websites with top navigation plus sidebar navigation plus in-content links
- Documentation sites with section menu plus page tree plus related links
- Enterprise applications with module navigation plus feature hierarchy

**When to use:**
- Large content volume with clear sections
- Within-section browsing important
- Cross-section relationships exist but aren't universal
- Desktop-primary context with space for navigation chrome

**Implementation considerations:**
- Top navigation for sections
- Sidebar or expandable tree for within-section
- [Breadcrumbs](../?path=/docs/patterns-breadcrumbs--docs) essential for wayfinding
- Related/see also links for contextual connections

### Step by step + pyramid

Hub shows all steps in process, actors can navigate sequentially or jump to any step.

**Structure:**
- Overview page lists all steps with descriptions (pyramid hub)
- From overview, can start at beginning or jump to specific step
- Within steps, back/next navigation available (step by step)
- Can return to overview anytime

**Agency balance:** Guides without forcing. Structure communicates sequence (step by step) but permits non-linear access (pyramid). Shared to human-centric locus depending on variant.

**Common implementations:**
- E-commerce checkout with step indicator that's clickable
- Multi-step forms with progress bar enabling jumping
- Tutorial sequences with table of contents
- Onboarding flows with skip/jump options

**When to use:**
- Process has logical sequence but strict ordering unnecessary
- Actors have varying expertise (beginners follow sequence, experts jump)
- Returning actors want to skip to specific steps
- Steps can be completed somewhat independently

**Implementation considerations:**
- Stepper component with clickable steps
- Overview that makes sequence clear
- Step validation (some implementations require completing prerequisites before jumping forward)
- Progress persistence (remember completed steps)

**Contrast with pure step by step:**
[Wizard pattern](../?path=/docs/patterns-wizard--docs) is pure step by step—strict sequence, no jumping. This hybrid relaxes that constraint.

### Fully connected + pan and zoom

Global navigation for discrete sections, spatial navigation within rich content.

**Structure:**
- Top-level navigation between named sections (fully connected)
- Within certain sections, continuous spatial navigation (pan and zoom)
- Switch between navigation paradigms based on content type

**Agency balance:** Different loci for different contexts. Fully connected (human-centric) for section navigation, pan and zoom (human-centric spatial) within spatial content.

**Common implementations:**
- News sites with article navigation plus interactive maps/graphics
- Real estate sites with listing navigation plus map view
- Educational sites with lesson navigation plus interactive diagrams
- Design portfolios with project navigation plus zoomable artwork

**When to use:**
- Mix of discrete content (articles, pages) and spatial content (maps, large images)
- Both content types substantial enough to warrant their models
- Clear context switch between modes

**Implementation considerations:**
- Clear visual distinction between navigation modes
- Breadcrumbs or back button to exit spatial content
- Deep linking for spatial content positions
- Mobile: might simplify spatial mode or hide global nav during spatial exploration

### Hub and spoke + flat navigation

Hub lists applications or workspaces, within each app all functions accessible.

**Structure:**
- Launch screen or app switcher shows available tools/workspaces (hub)
- Select one to enter
- Within workspace, flat navigation model applies—all tools accessible, minimal location navigation

**Agency balance:** Hub reduces cognitive load for selecting workspace (system-centric), flat within workspace maximises tool access (human-centric).

**Common implementations:**
- Adobe Creative Suite (hub of apps, flat within Photoshop/Illustrator/etc.)
- Microsoft Office (hub of apps, flat/ribbon within Word/Excel/etc.)
- Operating system app launchers (hub) plus apps (often flat)
- Cloud IDE platforms (hub of projects, flat within editor)

**When to use:**
- Multiple independent workspaces or tools
- Each workspace is feature-rich requiring flat model
- Actors work extensively in one workspace before switching
- Clear task separation between workspaces

**Implementation considerations:**
- Clear way to return to hub (app switcher, close workspace)
- Recent workspaces for quick switching
- Each workspace maintains its own state
- Consider [command menu](../?path=/docs/patterns-command-menu--docs) for workspace switching

### Pyramid + multilevel tree

Multiple pyramids (sequences) organised in tree structure.

**Structure:**
- Tree navigation for categories and sequences
- Within each sequence, pyramid model applies (hub + sequential)

**Agency balance:** Tree provides categorical organisation (shared locus), pyramid provides sequence flexibility within categories (shared locus).

**Common implementations:**
- Learning platforms with courses (tree) containing lessons (pyramid)
- Content sites with sections (tree) containing gallery articles (pyramid)
- Documentation with categories (tree) containing tutorial sequences (pyramid)

**When to use:**
- Many sequences requiring organisation
- Sequences fit into natural categories
- Actors browse categories but navigate flexibly within sequences

**Implementation considerations:**
- Tree shows categories and sequence titles
- Entering sequence switches to pyramid model
- Breadcrumbs show position in both tree and sequence
- Search helps navigate across both structures

## Designing coherent hybrids

### Principles for successful hybrids

**1. Clear context switching**
Actors should understand when navigation model changes:
- Visual cues (different nav UI, layout changes)
- Behavioural cues (different interactions work)
- Mental model alignment (switch makes sense given content)

**2. Consistent fundamentals**
Even as models change, maintain:
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) throughout
- [Search](../?path=/docs/compositions-search--docs) as universal escape hatch
- Consistent branding and visual language
- Unified [command menu](../?path=/docs/patterns-command-menu--docs) if present

**3. Intentional, not accidental**
Hybrids should be designed choices, not accumulated complexity:
- Each model serves specific need
- Combination is simpler than alternatives
- Actor benefit justifies added complexity

**4. Wayfinding aids**
More models mean more chance of disorientation:
- [Breadcrumbs](../?path=/docs/patterns-breadcrumbs--docs) showing full context
- Clear "you are here" indicators
- Easy escape hatches (home, back, search)

### Anti-patterns: bad hybrids

**Frankenstein navigation:**
Multiple models stitched together without coherent logic. Each section uses different navigation paradigm capriciously.

**Fix:** Identify content types and map consistent models to each type.

**Navigation feature creep:**
Pure model starts clean, then accumulates exceptions, shortcuts, and alternative paths until original model is unrecognisable.

**Fix:** Recognise when evolution warrants intentional hybrid. Redesign rather than patch.

**Context confusion:**
Unclear which navigation model applies, or models switch unexpectedly.

**Fix:** Clear visual/behavioural cues for context switches. Consistent model within contexts.

**Premature hybridisation:**
Combining models when single model would suffice, adding complexity without benefit.

**Fix:** Start with simplest model that serves needs. Add complexity only when justified.

## Evolution and adaptation

### From pure to hybrid

Applications often begin with pure models and evolve to hybrids as they mature:

**Small app with fully connected (5-7 pages)**
→ Content grows, sections emerge
→ **Fully connected + tree hybrid** (sections still accessible, hierarchy within)

**Mobile app with hub and spoke (focused sections)**
→ Cross-section workflows increase
→ **Hub and spoke + fully connected hybrid** (adds global nav)

**Simple wizard (strict sequence)**
→ Returning users frustrated by linear requirement
→ **Step by step + pyramid hybrid** (adds overview and jumping)

### Responsive hybrids

Navigation models can vary by context:

**Desktop:** Fully connected (persistent sidebar, all links visible)
**Mobile:** Hub and spoke (space constraints, focus)

This is less a hybrid pattern (combining models) and more **adaptive IA** (different models for different contexts). Both approaches are valid—consistency across devices vs optimisation per device.

## Testing hybrid patterns

Validate that hybrids serve actor needs:

**Mental model testing:**
- Do actors understand when navigation model changes?
- Can they predict what navigation will be available?
- Do they recognise models from other familiar applications?

**Task completion testing:**
- Can actors complete key workflows efficiently?
- Do hybrids enable shortcuts vs pure models?
- Where do actors get lost or frustrated?

**Information architecture validation:**
- [Tree testing](../?path=/docs/compositions-structure-multilevel-tree--docs#resources--references) for hierarchical portions
- First-click testing for hub and global navigation
- A/B testing pure vs hybrid variants

## Related

- Individual navigation models: [Hub and Spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs), [Fully Connected](../?path=/docs/compositions-structure-fully-connected--docs), [Multilevel Tree](../?path=/docs/compositions-structure-multilevel-tree--docs), [Step by Step](../?path=/docs/compositions-structure-step-by-step--docs), [Pyramid](../?path=/docs/compositions-structure-pyramid--docs), [Pan and Zoom](../?path=/docs/compositions-structure-pan-and-zoom--docs), [Flat Navigation](../?path=/docs/compositions-structure-flat-navigation--docs)
- [Information Architecture foundation](../?path=/docs/foundations-information-architecture--docs) — conceptual framework
- [Agency foundation](../?path=/docs/foundations-agency--docs) — control implications of combinations

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed.
- Rosenfeld, Morville, Arango (2015) *Information Architecture*, 4th ed., Chapter 3: Thinking About Information Architecture
