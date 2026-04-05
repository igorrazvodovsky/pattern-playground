---
paths:
  - "src/stories/**/*.mdx"
  - "src/stories/**/*.stories.tsx"
---

# Documentation standards

## Documentation format
- Use `.mdx` format for Storybook documentation with rich interactive content
- Include Meta component for proper Storybook integration: `<Meta title="Category/Name" />`
- *Established categories*: Operations, Actions, Activities, Foundations, Qualities, Concepts, Data visualisation

## Document structure
Standard section order:
1. Import + `<Meta title="Category/Name" />`
2. Fun meter: `> 🙂 **Fun meter: X/5**. [Personal reflection]` — the author's intellectual engagement with the topic, not the pattern's importance or novelty. Inversely proportional to how established and well-documented the area is. The description should name what makes it interesting to *think about* — open questions, unexpected connections, unresolved tensions. The X/5 rating is conventional but the format can vary; a short description without a numeric rating is acceptable
3. `# Title` (sentence case) with a one-sentence definition
4. Core content (varies by pattern type)
5. `## Related patterns` with subcategories — standard set is *Precursors*, *Follow-ups*, *Complementary*, *Tangentially related*, but custom subcategories (e.g., *Containers and primitives*, *Applied in*) are acceptable when they clarify the nature of the relationship better
6. `## Resources & references` for external sources

## Behavioural framework
Use the Intent & Interaction framework (`src/stories/foundations/Interaction.mdx`) to select and design patterns that support how users move through the interface and perform tasks. The framework is grounded in temporal movement and treats interaction as conversational alignment with turn-taking and cooperative principles.

## Content guidelines
- Focus on relational definitions over static properties
- Explain diverse implementations of flexible patterns
- Reference relevant foundations and qualities through inline links
- Weave cross-references naturally into prose, not just in dedicated sections

## Story and pattern descriptions
- Frame descriptions from the *human situation inward*, not from the implementation outward. Start with what problem in activity the pattern addresses or what experiential shift it enables — not what the component does or what API it exposes. Implementation details belong in the body, not the framing.
- Avoid opening descriptions with the `pp-` tag name or technical vocabulary like "container", "wrapper", "semantics". These signal component-catalogue voice rather than design-repertoire voice.
- When an implementation plan produces stories, it should include a *Design framing* section — a few sentences about the human situation the pattern addresses, written in the repertoire voice. If the plan lacks this, flag it as a gap rather than silently filling it with generic filler.

## Documentation linking
When creating cross-references between documentation files:
- *Storybook URLs*: Generated from Meta title - `<Meta title="Category/Name" />` becomes `../?path=/docs/category-name--docs`
- *URL transformation*:
  - Category/Name → category-name
  - Spaces become hyphens
  - Case is lowercased
- *Link format*: Use relative paths like `[Agency](../?path=/docs/foundations-agency--docs)` for internal Storybook links
- *Cross-pattern links*: Reference related patterns in "Related patterns" sections using proper Storybook URLs

## Writing style
- Use British spelling throughout (behaviour, organisation, colour, etc.)
- Always use sentence case for headings and titles
- Prioritize conciseness - Each sentence should add new information. Remove elaborative phrases that restate rather than extend. Trust reader comprehension—avoid over-explaining implications. Edit ruthlessly to remove redundancy.

## Conceptual integrity
When organizing concepts in the pattern library:
- *Test boundaries* - Apply frameworks to edge cases to understand scope (e.g., "Does this apply to human-human collaboration or just human-AI?")
- *Check definitional consistency* - If a foundation is defined as "distribution of X", creating an "X distribution" section may indicate redundancy
- *Question placement* — Each level has a role: Operations are automatic and infrastructural (the substrate); Actions are conscious and goal-directed (what users deliberately do); Activities are motive-driven and strategic (how work unfolds over time). Foundations define universal principles, Qualities describe cross-cutting attributes, Concepts describe what the system knows about. Atomic Design categories (primitive, component, composition, pattern) persist as metadata tags, not as the primary organising dimension.
- *Use Socratic questioning* - Ask "What happens if...?" to test framework boundaries
