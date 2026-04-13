# Architecture

## Tech stack

### Frontend
- *TypeScript* with *Vite* build system
- *Lit* (Web Components) — primary component architecture, `pp-` prefix, Light DOM preferred
- *React* — Storybook stories and complex compositions
- *Storybook* — component documentation and development (port 6006)
- *Tiptap* — rich text editing
- *Tldraw* — spatial canvas experiments

### Backend
- *Express* (Node.js) with *OpenAI* API integration
- TypeScript with ES modules
- Separate `server/` directory with its own `package.json`

## Directory map

```
src/
├── components/                 Web Components (Lit). Organised by composition, not AT level.
│   ├── register-all.ts         Central registration point for all custom elements.
│   ├── component-registry.ts   Dependency-aware registration ordering.
│   └── PatternGraph.tsx        Force-directed graph of pattern relationships (React).
│
├── stories/                    Storybook documentation. Organised by Activity Theory levels.
│   ├── operations/             Automatic, infrastructural patterns
│   ├── actions/                Conscious, goal-directed patterns (lifecycle sub-groups)
│   ├── activities/             Motive-driven, strategic patterns
│   ├── foundations/            Theoretical grounding + material (colour, typography, etc.)
│   ├── qualities/              Cross-cutting attributes (agency, conversation, etc.)
│   ├── concepts/               Concept design vocabulary (Jackson)
│   ├── data-visualization/     Charts and data encoding (placeholder)
│   ├── data/                   Shared mock data (JSON files)
│   └── utils/                  Storybook utility components
│
├── services/                   Framework-agnostic core services and API utilities
├── styles/                     Global CSS (layers, tokens). No inline styles.
├── schemas/                    JSON schemas
├── tldraw/                     Tldraw canvas experiments
├── tokens/                     Design tokens
├── types/                      Shared TypeScript types
├── utility/                    Shared utility functions
├── hooks/                      React hooks
├── activity-levels.json        Generated AT classification data
└── pattern-graph.json          Generated graph data (nodes + edges)

server/                         Express backend (separate package)
plans/                          Design plans and decisions (year/month structure)
references/                     Research inputs — papers, notes, academic sources
docs/                           Agent-facing knowledge base (curated)
.claude/rules/                  Path-activated coding rules
```

## The dual-projection tension

`src/components/` is organised *compositionally* — by what things are made of (following Atomic Design principles). `src/stories/` is organised *experientially* — by Activity Theory levels (what role a pattern plays in human activity). These two organisations coexist deliberately: components don't need to match the story tree, and the story tree doesn't dictate component structure.

The canonical taxonomy for stories is in `docs/storybook-taxonomy.md`.

## Key patterns

- *Progressive enhancement* — CSS-only baselines, JavaScript enhancement layered on top
- *Centralised registration* — all `customElements.define()` calls go through `register-all.ts`
- *Framework-agnostic services* — business logic in pure TypeScript, consumed by both Lit and React
- *Plugin architecture* — editors and integrations consume services rather than owning them
- *Pointer-based abstractions* — make any entity commentable/referenceable without tight coupling
