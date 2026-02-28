# State management

## Zustand for local state
- Prefer Zustand over Context API for complex state that needs persistence
- Use Maps for O(1) lookups instead of arrays when frequent searches are needed
- Leverage built-in utilities: Use `shallow` from `zustand/shallow` for object equality
- Persist strategically: Use `persist` middleware with proper serialization for localStorage
- Validate rehydration: Add error handling when loading persisted state

## Service architecture
- *Framework-agnostic core services* - Business logic lives in pure TypeScript classes (e.g., CommentService)
- *Plugin architecture* - Editors and integrations consume services rather than owning them
- *Pointer-based abstractions* - Use pointer objects to make any entity commentable without tight coupling

## Anti-patterns
- Don't use Context for complex state - Use Zustand when persistence or complex logic is needed
- Don't use arrays for frequent lookups - Use Maps for O(1) performance
