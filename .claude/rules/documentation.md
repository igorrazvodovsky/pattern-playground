---
paths:
  - "src/stories/**/*.mdx"
---

# Documentation standards

## Documentation format
- Use `.mdx` format for Storybook documentation with rich interactive content
- Include Meta component for proper Storybook integration: `<Meta title="Category/Name" />`
- *Established categories*: Foundations, Primitives, Components, Compositions, Patterns, Qualities, Visual elements, Data visualization

## Document structure
Standard section order:
1. Import + `<Meta title="Category/Name" />`
2. Fun meter: `> 🙂 **Fun meter: X/5**. [How interesting it is to work with this pattern. Typically, it's inversely proportional to how established the pattern is]` — the X/5 rating is conventional but the format can vary; a short description without a numeric rating is acceptable
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
When organizing concepts in the design system:
- *Test boundaries* - Apply frameworks to edge cases to understand scope (e.g., "Does this apply to human-human collaboration or just human-AI?")
- *Check definitional consistency* - If a foundation is defined as "distribution of X", creating an "X distribution" section may indicate redundancy
- *Question placement* — Each level has a role: Foundations define universal principles, Qualities describe cross-cutting attributes, Patterns show interaction approaches, Compositions combine patterns into features, Components implement specific UI elements, Primitives provide building blocks
- *Use Socratic questioning* - Ask "What happens if...?" to test framework boundaries
