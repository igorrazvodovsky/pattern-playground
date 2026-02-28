---
paths:
  - "src/stories/**/*.tsx"
  - "src/stories/**/*.jsx"
  - "src/stories/data/**/*.json"
---

# Mock data

## Best practices
- *Centralized data directory*: Store all shared mock data in `src/stories/data/` as JSON files
- *JSON imports*: Use the import syntax with type assertion for JSON files:
  ```typescript
  import mockData from '../data/mockData.json' with { type: 'json' };
  ```

## When to extract to JSON
- Long arrays (>5 items) with complex object structures
- Reusable data that might be shared across multiple components or stories
- Rich data objects with multiple properties that would clutter the main file
- Leave inline simple arrays with <10 primitive items for basic examples

## When to use existing data files
- *Check first*: Before creating new mock data, check if suitable data exists in `src/stories/data/`
- *Reuse across stories*: Import existing JSON files to maintain consistency across Storybook stories
- *Extend existing*: If close match exists, consider extending an existing file rather than creating new one
