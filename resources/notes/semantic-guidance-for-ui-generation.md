# Semantic Guidance for UI Generation

Notes on improving design system documentation for AI-driven UI generation, based on *Bridging Gulfs in UI Generation through Semantic Guidance* (Park et al., CHI 2026).

## Core insight

Effective UI generation requires *structured semantic input* rather than free-form prompts. Design systems already contain the knowledge AI needs—but it's implicit. Making it explicit improves generation quality.

## The semantic hierarchy

The paper identifies four levels, mapping to typical design system structure:

| Paper's level | Project equivalent | Key attributes |
|---------------|-------------------|----------------|
| Product | — | Description, Target User, Goal |
| Design System | `foundations/` | Design Style, Color, Typography, Visual Property, Visual Mood, Tone of Voice |
| Feature | `patterns/`, `compositions/` | Function, Content, Information Architecture |
| Component | `components/`, `primitives/` | Type, Interactivity, State, Content, Properties |

Semantics flow *vertically* (between levels) and *horizontally* (within levels). Changes cascade.

---

## Gaps to address

### Undocumented attributes

These emerged as essential for generation but are often missing from design systems:

*Design System level*
- **Visual Mood** — emotional tone (warm, energetic, calm), distinct from design style
- **Tone of Voice** — UX writing style, not just typography specs

*Component level*
- **Interactivity** — hover states, transitions, animations as semantic information
- **State semantics** — what each state *means*, not just appearance

### Implicit relationships

Design knowledge lives in designers' heads. Document:
- What affects what (upstream/downstream dependencies)
- What conflicts with what (incompatible combinations)
- What assumes what (defaults when unspecified)

---

## Actionable improvements

### 1. Add semantic metadata to documentation

```yaml
semantics:
  level: component
  implements:
    - interactivity: [hover, focus, active, disabled]
    - states: [empty, loading, error, success]
  affected_by:
    - design_style: "border-radius scales with style formality"
    - target_user: "touch target size increases for accessibility needs"
  conflicts:
    - { condition: "minimalist + high density", resolution: "prioritize minimalist" }
```

### 2. Make relationships explicit

In component/pattern documentation:

```markdown
## Semantic relationships
- **Affected by**: Target User, Visual Mood, Design Style
- **Affects**: Information Architecture, Typography scale
- **Conflicts with**: information-dense layouts when minimalist style is set
```

### 3. Reframe decision trees as semantic mappings

| If Target User is... | And Goal is... | Then select... |
|---------------------|----------------|----------------|
| elderly users | reduce friction | large touch targets, high contrast variant |
| power users | maximize throughput | dense layout, keyboard shortcuts |

### 4. Document cross-cutting constraints

```markdown
## Compatibility notes
- "Minimalist" design style conflicts with information-dense content layouts
- "Playful" visual mood requires vibrant color palette, not muted pastels
- Elderly target users override typography minimums regardless of style
```

### 5. Add "Why" alongside "What"

For each component/pattern, document:
- What semantic attributes it *implements*
- What higher-level semantics it *supports* (goals, user types, moods)
- What it *assumes* if unspecified

---

## Relationship types

The paper identifies three relationship types for analysis:

- **Values Match Well** — compatible, mutually reinforcing choices
- **Values Conflict** — incompatible choices requiring resolution
- **Needs Value** — missing specification that should be provided

---

## Key quotes

> "Effective UI generation requires more than just describing visual appearance or listing desired features. It demands understanding and specifying information across multiple abstraction levels while managing the complex relationships between them."

> "Interactivity and state—often absent in static UI taxonomies—emerged as meaningful semantics in generative contexts, indicating that generative workflows surface design dimensions that are otherwise latent."

---

## Source

Park, S., Lee, S., Choi, E., Kim, H., Kweon, M., Song, Y., & Seo, J. (2026). Bridging Gulfs in UI Generation through Semantic Guidance. *CHI '26*.

Full paper: `resources/papers/Bridging Gulfs in UI Generation through Semantic Guidance.md`
