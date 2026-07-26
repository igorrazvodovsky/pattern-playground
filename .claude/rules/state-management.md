---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# State management

- Zustand over Context API for complex or persisted state: `persist` middleware with error-handled rehydration, `shallow` from `zustand/shallow` for object equality, Maps over arrays for frequent lookups.
- Business logic lives in framework-agnostic TypeScript services (e.g. CommentService); editors and integrations consume services rather than owning them (plugin architecture).
- Pointer-based abstractions make any entity commentable/referenceable without tight coupling.
