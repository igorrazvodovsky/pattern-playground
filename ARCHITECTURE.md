# Architecture

## Tech stack

### Frontend
- *TypeScript* with *Vite* build system
- *Lit* (Web Components) — primary component architecture, `pp-` prefix, Light DOM preferred
- *React* — Storybook stories and complex compositions
- *Storybook* — component documentation and development (port 6006)
- *Astro* — pattern language site (port 4321); MDX, content collections, islands
- *Tiptap* — rich text editing
- *Tldraw* — spatial canvas experiments

### Backend
- *Express* (Node.js) with *OpenAI* API integration
- TypeScript with ES modules
- `apps/server/` with its own `package.json`

## Directory map

```
packages/
└── components/             Component library — Lit + React, Storybook (:6006)
    ├── src/
    │   ├── components/         Web Components (Lit). Organised by composition.
    │   │   ├── register-all.ts     Central registration for all custom elements.
    │   │   ├── component-registry.ts
    │   │   └── PatternGraph.tsx    Force-directed graph (React).
    │   ├── stories/            Storybook documentation. AT-level projection for component stories.
    │   │   ├── operations/         Automatic/infrastructural components
    │   │   ├── actions/            Conscious/goal-directed components
    │   │   ├── activities/         Motive-driven compositions
    │   │   ├── foundations/        Material substrate docs + unmigrated language entries
    │   │   ├── qualities/          Substrate docs + serves as link target (pending cross-ref migration)
    │   │   ├── concepts/           Concept design vocabulary
    │   │   ├── data-visualization/ Charts and data encoding
    │   │   ├── data/               Shared mock data (JSON)
    │   │   └── utils/              Storybook utility components
    │   ├── services/           Framework-agnostic services and API utilities
    │   ├── styles/             Global CSS (layers, tokens). No inline styles.
    │   ├── tokens/             Design tokens
    │   ├── types/              Shared TypeScript types
    │   ├── utility/            Shared utility functions
    │   └── hooks/              React hooks
    └── .storybook/             Storybook config

apps/
├── patterns/               Pattern language site — Astro (:4321)
│   └── src/
│       ├── content/patterns/   Pattern MDX/MD (role:pattern, role:umbrella, role:quality, role:foundation)
│       │   ├── operations/
│       │   ├── actions/
│       │   ├── activities/
│       │   ├── foundations/
│       │   ├── qualities/
│       │   └── data-visualization/
│       ├── content.config.ts   Zod-validated content collection schema
│       ├── pages/              Astro page routes
│       ├── layouts/            Astro layouts
│       ├── components/         Site-specific React/Astro components
│       └── data/               Generated graph data (pattern-graph.json, activity-levels.json)
│
└── server/                 Express backend (:3000)
    ├── handlers/
    ├── services/
    └── server.ts

scripts/                    Workspace-level scripts
├── extract-graph-data.ts   Graph extractor (reads both workspaces; outputs to apps/patterns/src/data/)
plans/                      Executable specifications (workspace-level)
references/                 Research inputs — papers, notes, academic sources
docs/                       Agent-facing knowledge base (workspace-level)
├── index.md                Sectioned docs map
├── specs/                  Settled specifications
├── project/                Project framing and Storybook taxonomy
├── language/               Pattern definition, graph vocabulary, theory
├── quality/                Testing, review, commenting
└── research/               References index for top-level research notes
.claude/rules/              Path-activated coding rules
```

## Two surfaces

The project runs two documentation surfaces:

- *Storybook* (`packages/components/`) — component development and
  demonstration. Organised by AT levels as a practical navigation convention.
  Owned by `role:component` pages.

- *Pattern site* (`apps/patterns/`) — the pattern language. Patterns,
  qualities, foundations, and umbrellas live here as authoritative language
  entries. AT levels here carry design-language semantics, not just navigation.

The AT-level taxonomy in Storybook is a practical sidebar projection for
components. The AT-level taxonomy in the pattern site is the language itself.
These are separate conventions sharing vocabulary; see
[docs/specs/pattern-site.md](docs/specs/pattern-site.md).

Settled workspace boundary specification: [docs/specs/workspace-layout.md](docs/specs/workspace-layout.md).

## Key patterns

- *Progressive enhancement* — CSS-only baselines, JavaScript enhancement layered on top
- *Centralised registration* — all `customElements.define()` calls go through `register-all.ts`
- *Framework-agnostic services* — business logic in pure TypeScript, consumed by both Lit and React
- *Plugin architecture* — editors and integrations consume services rather than owning them
- *Pointer-based abstractions* — make any entity commentable/referenceable without tight coupling
