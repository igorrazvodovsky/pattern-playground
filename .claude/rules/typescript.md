---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript & modern JavaScript

- Target the latest language features and APIs — no backward-compatibility constraints. JSON imports use `with { type: 'json' }`.
- Runtime type checking goes through `is*` type-guard functions (e.g. `isIOption`, `isOptionToggleValue`); component contracts are interfaces (`IOptionBase`, `IOptionParent`); reusable components are generic (`SelectBase<Value>`, `IOption<Value>`).
- Elena coerces an attribute by the type its prop currently holds. A prop that accepts more than one type (e.g. string-or-`Date`) routes its attribute through an `attributeChangedCallback` override that hands the raw string to the property.
