import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Compositions/Structure/Pan and Zoom" />

> 🗺️ **Fun meter: 2/5**. Mapping out the basics.

# Pan and zoom

Single large continuous spaces rather than discrete pages. Actors navigate by panning (horizontal/vertical movement) and zooming (scale changes). Controls for reset to known position and state.

## Description

Some content is best represented as unified spatial environments rather than collections of separate pages. Maps, large images, timelines, information graphics, and representations of time-based media use continuous space where position and scale matter.

Navigation happens within the space through panning (dragging, scrolling) and zooming (pinching, mouse wheel, zoom controls). The spatial metaphor feels natural—actors explore by moving through and examining content at different scales.

Unlike other navigation models, pan and zoom has no discrete "pages" or "items." Everything exists in a single coordinate system. This continuity eliminates page-to-page transitions but introduces new challenges around orientation and wayfinding.

## Behavioural position

**Primary behaviours supported:**
- [Exploring](../?path=/docs/foundations-intent--interaction--docs#exploring) — spatial metaphors naturally support discovery
- [Navigating](../?path=/docs/foundations-intent--interaction--docs#navigating) — direct access to known locations (with landmarks or coordinates)
- Visual scanning and pattern recognition at multiple scales

**Challenges:**
- [Re-finding](../?path=/docs/foundations-intent--interaction--docs#re-finding) — harder without clear landmarks or bookmarks
- [Transactional search](../?path=/docs/foundations-intent--interaction--docs#transactional-search) — limited unless search features can position/highlight
- Orientation — actors can get lost without good wayfinding

The continuous nature means actors must maintain spatial memory or rely on orientation aids. Getting "lost in space" is a real risk, especially in large or abstract spaces.

## When to use

**Content structure:**
- Continuous spatial information (maps, floor plans)
- Large single images or documents
- Timelines with temporal relationships
- Network diagrams and relationship graphs
- Canvas-based tools (design, whiteboarding)

**Behavioural needs:**
- Spatial relationships matter (proximity, direction, scale)
- Overview + detail required (zoom out for context, zoom in for detail)
- Content too large for single viewport
- Exploration is primary activity

**Agency preference:**
- Maximum spatial agency valued
- Actors comfortable with continuous navigation
- Spatial memory or good wayfinding available

## When not to use

**Avoid if:**
- Content naturally divides into discrete units (use [pyramid](../?path=/docs/compositions-structure-pyramid--docs) or [tree](../?path=/docs/compositions-structure-multilevel-tree--docs))
- Actors need structured guidance (use [step by step](../?path=/docs/compositions-structure-step-by-step--docs))
- Accessibility is critical and spatial alternatives limited
- Simple information display (unnecessary complexity)
- Mobile-only context where touch gestures conflict with other interactions

**Alternative models:**
- [Pyramid](../?path=/docs/compositions-structure-pyramid--docs) for sequences that could be spatial
- [Fully connected](../?path=/docs/compositions-structure-fully-connected--docs) + pan/zoom hybrid for maps with discrete sections
- [Multilevel tree](../?path=/docs/compositions-structure-multilevel-tree--docs) for hierarchical spatial data

## Variants

### Geographic maps
Physical or abstract maps with pan and zoom.

**Characteristics:**
- Most common variant
- Familiar mental model
- Often includes search, markers, layers
- Examples: Google Maps, OpenStreetMap

### Zoomable timelines
Temporal data navigable by panning time and zooming scale.

**Characteristics:**
- Horizontal panning through time
- Zoom changes granularity (centuries → years → days)
- Good for historical data, project timelines

### Infinite canvas
Boundless workspace for creative tools.

**Characteristics:**
- No edges or limits
- Common in design tools (Figma, Miro)
- Supports spatial organisation of work
- Often combined with [flat navigation](../?path=/docs/compositions-structure-flat-navigation--docs)

### Zoomable UI
Interface elements organised spatially and accessed by zooming.

**Characteristics:**
- Experimental navigation paradigm
- Overview at high level, detail at low level
- Examples: Prezi presentations, some data visualisations
- Can feel disorienting if poorly executed

## States

### View states
- **Overview** — zoomed out, showing broad context
- **Detail** — zoomed in, examining specific area
- **Transitioning** — animating between positions/scales
- **Lost** — actor uncertain of position (failure state)

### Interaction states
- **Panning** — actively dragging view
- **Zooming** — actively changing scale
- **Idle** — viewing without navigation
- **Loading** — fetching data for new visible area

### Orientation states
- **Oriented** — actor knows their position
- **Landmarks visible** — recognisable features in view
- **Disoriented** — requires reset or wayfinding

## Agency implications

**Locus:** Human-centric. Actor has continuous control over position and scale.

**Dynamics:** Dynamic. Navigation decisions are constant and fluid rather than discrete.

**Granularity:** Fine-grained. Precise control over exact position and zoom level.

**Control trade-off:** Maximum spatial [agency](../?path=/docs/foundations-agency--docs). Actors have complete freedom of movement, but this freedom brings responsibility. Without good wayfinding or landmarks, actors can become disoriented. The model assumes:
- Spatial competence (comfortable navigating 2D/3D spaces)
- Good spatial memory or external aids (bookmarks, landmarks)
- Motivation to explore rather than be guided

The continuous control is empowering for skilled actors but can overwhelm novices. Provide good defaults (home view) and clear reset mechanisms.

## Implementation patterns

### Pan controls
- **Drag to pan** — mouse drag or touch drag
- **Arrow keys** — keyboard panning
- **Scrollbars** — traditional but less common
- **Edge panning** — move cursor to edge to pan

### Zoom controls
- **Pinch gesture** — mobile standard
- **Mouse wheel** — desktop standard
- **Zoom buttons** — +/- buttons for explicit control
- **Double-tap/click** — zoom to point
- **Zoom to fit** — reset to show all content

### Orientation aids
- **Minimap** — small overview showing current viewport
- **Landmarks** — prominent features for spatial reference
- **Coordinates** — lat/long or x/y display
- **Compass** — orientation indicator
- **Reset button** — return to default view

### Performance optimisation
- **Viewport culling** — only render visible area
- **Level of detail** — show less detail when zoomed out
- **Tile loading** — load map tiles as needed
- **Debounced updates** — batch rapid pan/zoom actions

## Accessibility

### Keyboard navigation
- Arrow keys for panning
- +/- or other keys for zooming
- Home key returns to default view
- Tab navigates between interactive elements within view

### Screen readers
Spatial content is inherently visual and challenging for screen readers:
- Provide text alternative describing spatial relationships
- Offer structured navigation (list of locations, timeline entries)
- Announce current position/scale when it changes
- Consider hybrid approach (spatial view + list view)

### Alternative navigation
- Search functionality to jump to locations
- List of landmarks or points of interest
- Structured menu as alternative to spatial exploration
- Keyboard shortcuts for common locations

### Motion and animation
- Respect prefers-reduced-motion
- Provide instant jump option vs. animated transitions
- Disable auto-panning features for motion sensitivity

## Related patterns

### Implements this model
- Map interfaces (Google Maps, mapping libraries)
- Infinite canvas tools (Figma, Miro, tldraw)
- Zoomable timelines
- Large image viewers
- Network visualisations

### Complements
- [Search](../?path=/docs/compositions-search--docs) — enables jumping to locations
- [Deep linking](../?path=/docs/primitives-deep-linking--docs) — encode position and zoom in URLs for sharing
- Bookmarks or saved views
- Minimap or overview + detail patterns
- Layers or filtering for complex spaces

### Hybrid patterns
- [Fully Connected + Pan and Zoom](../?path=/docs/compositions-structure-hybrid-patterns--docs#fully-connected--pan-and-zoom) — global nav for sections, spatial within sections

### Precursors
- Large single image → pan and zoom for exploration

## Resources & references

- Shneiderman (1996) [The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations](https://ieeexplore.ieee.org/document/545307) — "Overview first, zoom and filter, details on demand"
- Nielsen Norman Group (2021) [Maps and Location in UX](https://www.nngroup.com/articles/maps-location-ux/)
- Bederson, Hollan (1994) [Pad++: A Zooming Graphical Interface for Exploring Alternate Interface Physics](https://dl.acm.org/doi/10.1145/192426.192435)
