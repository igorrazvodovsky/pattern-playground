import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Pyramid" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Pyramid

Hub page lists an entire sequence of items. Actors select any item and navigate through the sequence using back/next links. Return to hub anytime to jump to different positions.

## Description

The hub provides overview of all items in a collection or sequence. From there, actors can either start at the beginning and progress linearly using back/next controls, or jump directly to any item that interests them. Once viewing an item, sequential navigation is available, but the hub remains accessible for non-linear access.

Named for its shape: a hub at the top, with individual items below, connected both to the hub and to one another in sequence. This creates dual navigation modes—structured (sequential) and random-access (via hub).

Very common for content sites publishing galleries, photo essays, tutorial sequences, and product showcases.

## Behavioural position

**Primary behaviours supported:**
- [Browsing](../?path=/docs/foundations-intent--interaction--docs#browsing) — hub overview enables pattern recognition and scanning
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — direct access via hub when target is known
- Sequential progression via back/next when linear consumption is preferred

**Flexibility:**
Actors can switch between modes fluidly:
- Start browsing hub, jump to interesting item, progress sequentially for a while, return to hub to jump elsewhere
- This flexibility supports diverse actor preferences and changing intent

The model assumes actors benefit from seeing the full collection upfront. When sequences are very long (50+ items) or contain sensitive content requiring preparation, hub overview may overwhelm rather than orient.

## When to use

**Content structure:**
- Sequential collections (galleries, tutorials, articles split into pages)
- Related items that form a narrative or progression
- 5-30 items ideal (beyond 30, hub becomes crowded)
- Items can be consumed independently but benefit from sequence

**Behavioural needs:**
- Actors want overview before committing to sequence
- Some actors prefer linear progression, others jump around
- Items are bite-sized (images, short articles, steps)
- Context from full collection aids comprehension

**Agency preference:**
- Balanced agency — structure guides but doesn't force
- Actor controls their path through content
- Hub provides cognitive scaffolding without constraint

## When not to use

**Avoid if:**
- Very long sequences (50+ items) — hub becomes unwieldy
- Items must be consumed in strict order due to dependencies
- No meaningful sequence exists (use [grid/list layout](../?path=/docs/compositions-card--docs) instead)
- Mobile bandwidth concerns (loading all hub thumbnails costly)
- Content requires no overview (use simple [step by step](../?path=/docs/compositions-structure-step-by-step--docs))

**Alternative models:**
- [Step by step](../?path=/docs/compositions-structure-step-by-step--docs) for strict sequences
- [Multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for hierarchical content
- [Hub and spoke](../?path=/docs/compositions-structure-hub-and-spoke--docs) when items don't form sequences
- Infinite scroll with anchors for very long sequences

## Variants

### Gallery pyramid
Hub shows thumbnails, items are full images.

**Characteristics:**
- Most common variant
- Visual overview at hub
- Common in photo essays, portfolios
- Dependent on [deep linking](../?path=/docs/primitives-deeplinking--docs) for sharing individual images

### List pyramid
Hub shows titles/descriptions in list format.

**Characteristics:**
- Text-focused
- More items fit in viewport
- Common in multi-page articles, chapter lists
- Lighter than thumbnail approach

### Card pyramid
Hub shows rich cards with images, titles, descriptions.

**Characteristics:**
- Balances visual and textual information
- Good for diverse content types
- More informative than thumbnails
- Common in tutorial sequences, product tours

### Numbered pyramid
Hub explicitly numbers items, progress indication emphasised.

**Characteristics:**
- Strongest sequence signal
- Clear progress tracking
- Approaches [step by step](../?path=/docs/compositions-structure-step-by-step--docs) but maintains flexibility
- Common in courses, instructional content

## States

### Hub states
- **Overview** — showing all items
- **Progress indicated** — showing which items already viewed/completed
- **Current highlighted** — if returning to hub while viewing item

### Item states (on hub)
- **Unvisited** — not yet viewed
- **Current** — currently viewing this item
- **Visited** — previously viewed (helps re-finding)
- **Completed** — marked as complete (for instructional content)

### Navigation states (within item view)
- **Back available** — can navigate to previous item
- **Next available** — can navigate to next item
- **Hub accessible** — return to overview anytime
- **Progress shown** — item N of M displayed

## Agency implications

**Locus:** Shared. Hub provides overview (system guides), actor controls navigation path (human directs).

**Dynamics:** Static structure, dynamic path—sequence is fixed but route through it is actor-chosen.

**Granularity:** High-level choice (which item) and fine-grained sequencing (when to move forward/back/hub).

**Control trade-off:** High [agency](../?path=/docs/foundations-agency--docs) within structured context. Actors aren't

 constrained to linear progression (unlike [step by step](../?path=/docs/compositions-structure-step-by-step--docs)) but structure is still clear (unlike [fully connected](../?path=/docs/compositions-structure-fully-connected--docs)). This balance is appropriate when:
- Content benefits from sequence but doesn't require it
- Diverse actor preferences exist (some linear, some jumping)
- Overview aids decision-making

The hub does impose mild friction—returning to hub to jump elsewhere takes an extra step compared to direct links. This friction is usually acceptable given the orientation benefits.

## Implementation patterns

### Hub layouts
- **Grid** — thumbnails or cards in responsive grid
- **List** — vertical list with titles and descriptions
- **Masonry** — varied-height cards for diverse content
- **Timeline** — horizontal scroll for temporal sequences

### Navigation within items
- **Prominent back/next** — buttons or arrows
- **Swipe gestures** — on touch devices
- **Keyboard arrows** — for power users
- **Return to hub** — button or link, not hidden

### Progress indication
- **Position display** — "3 of 12"
- **Progress bar** — visual representation
- **Hub breadcrumb** — "Gallery > Item 3"
- **Visited state** — mark viewed items on hub

### Deep linking
Essential for shareability:
- Each item has unique URL
- URL includes both item and hub context
- Sharing item URL loads that item but hub remains accessible
- See [Deep Linking primitive](../?path=/docs/primitives-deeplinking--docs)

## Accessibility

### Keyboard navigation
- Tab navigates between hub items
- Arrow keys navigate within item view (previous/next)
- Home/End jump to first/last items
- Escape or designated key returns to hub

### Screen readers
- Hub announces total count ("12 items")
- Items announce position ("Item 3 of 12")
- Navigation controls clearly labelled
- Visited status announced

### Focus management
- Selecting hub item focuses item view
- Returning to hub restores focus to item just viewed
- Sequential navigation maintains logical focus
- Clear focus indicators throughout

### Image galleries
- All images have alt text
- Descriptions available for complex visuals
- Captions are accessible
- Keyboard controls don't interfere with screen reader

## Related patterns

### Implements this model
- Photo gallery interfaces
- Multi-page article systems
- Tutorial and course sequences
- Product showcase pages
- Comic/manga readers

### Complements
- [Deep linking](../?path=/docs/primitives-deeplinking--docs) — essential for sharing and bookmarking items
- Progress tracking and resume features
- Image loading optimisation (lazy loading)
- Breadcrumbs showing hub context

### Precursors
- Simple list → pyramid when sequential relationship emerges

### Evolution paths
- Pyramid → [multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) when multiple pyramids need organisation
- Pyramid → [hybrid with filtering](../?path=/docs/compositions-filtering--docs) for large collections

## Resources & references

- Tidwell, Brewer, Valencia (2020) *Designing Interfaces*, 3rd ed., "Pyramid" pattern
- Nielsen Norman Group (2012) [Photo Galleries: Designing for Delight](https://www.nngroup.com/articles/photo-galleries/)
