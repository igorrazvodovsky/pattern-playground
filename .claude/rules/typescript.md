---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript & modern JavaScript

- Target the latest language features and APIs — no backward-compatibility constraints. Stage-3 decorators for Web Components; JSON imports use `with { type: 'json' }`.
- Runtime type checking goes through `is*` type-guard functions (e.g. `isIOption`, `isOptionToggleValue`); component contracts are interfaces (`IOptionBase`, `IOptionParent`); reusable components are generic (`SelectBase<Value>`, `IOption<Value>`).
- Complex attribute parsing uses custom `ValueConverter` objects (Lit).
- No `any` — proper types, or `unknown` narrowed by a type guard. ESLint enforces this.
