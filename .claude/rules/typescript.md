# TypeScript & modern JavaScript

## Type safety
- *Type guards*: Create `is*` functions for runtime type checking (e.g., `isIOption`, `isOptionToggleValue`)
- *Interfaces*: Define clear interfaces for component contracts (`IOptionBase`, `IOptionParent`)
- *Generic types*: Use generics for reusable components (`SelectBase<Value>`, `IOption<Value>`)
- *Value converters*: Create custom `ValueConverter` objects for complex attribute parsing
- *Strict typing*: All properties should have explicit types, avoid `any`

## Modern features
Use the latest language features and APIs without backward compatibility constraints:
- *ES2023+ features*: Top-level await, private class fields, static class blocks, array methods like `findLast()`, `toSorted()`
- *Import assertions*: Use `with { type: 'json' }` for JSON imports
- *Optional chaining* (`?.`) and *nullish coalescing* (`??`) for safe property access
- *Template literal types* for type-safe string manipulation
- *Const assertions* (`as const`) for immutable type inference
- *Module resolution*: Use `import.meta` for module metadata
- *Decorators*: Use stage 3 decorators for Web Components and class enhancements
- *Native APIs*: Prefer native `fetch()`, `AbortController`, `URL`, `URLSearchParams` over polyfills
- *Modern DOM APIs*: Use `querySelector()`, `closest()`, `matches()`, `toggleAttribute()`

## Anti-patterns
- Don't use `any` - Create proper types or use `unknown` with type guards
- Don't skip type guards - Create `is*` functions for runtime type checking
- Don't avoid generics - Use them for reusable, type-safe components
