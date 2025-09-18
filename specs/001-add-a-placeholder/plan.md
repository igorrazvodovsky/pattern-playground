# Implementation Plan: Data View Composition

**Branch**: `001-add-a-placeholder` | **Date**: 2025-09-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-a-placeholder/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Creating an interactive Data View composition story for Storybook that demonstrates switching between card and table representations of product data, with attribute selection controls organised in a toolbar. This serves as a placeholder implementation to showcase the composition pattern for combining data display components with filtering controls.

## Technical Context
**Language/Version**: TypeScript 5.x / JavaScript ES2023+
**Primary Dependencies**: React 18.x, Storybook 8.x, Lit 3.x (Web Components), Vite 5.x
**Storage**: JSON file (products.json) - no database required
**Testing**: ESLint, Stylelint (as per npm run test)
**Target Platform**: Web browser (modern browsers supporting Web Components)
**Project Type**: web (frontend with Storybook documentation)
**Performance Goals**: Instant view switching (<100ms), smooth attribute filtering
**Constraints**: Must follow existing design system patterns, progressive enhancement approach
**Scale/Scope**: Single story page with 2 view modes and ~5-10 product records

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend only - Storybook story implementation)
- Using framework directly? Yes (React for stories, Web Components for UI)
- Single data model? Yes (Product entity from JSON)
- Avoiding patterns? Yes (direct component composition, no unnecessary abstractions)

**Architecture**:
- EVERY feature as library? N/A - This is a documentation/demo feature
- Libraries listed: Using existing component libraries (pp-dropdown, pp-list, pp-button)
- CLI per library: N/A - Documentation feature
- Library docs: MDX format documentation being created

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? N/A - Story implementation
- Git commits show tests before implementation? N/A - Story implementation
- Order: Contract→Integration→E2E→Unit strictly followed? N/A - Story implementation
- Real dependencies used? Yes (actual components, no mocks)
- Integration tests for: N/A - Story implementation
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? N/A - Story implementation
- Frontend logs → backend? N/A - No backend
- Error context sufficient? Will handle missing data gracefully

**Versioning**:
- Version number assigned? N/A - Part of existing design system
- BUILD increments on every change? N/A - Follows project versioning
- Breaking changes handled? N/A - Additive feature

## Project Structure

### Documentation (this feature)
```
specs/001-add-a-placeholder/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Existing structure - adding to:
src/
├── stories/
│   ├── compositions/
│   │   ├── DataView.mdx          # Main story file (updating)
│   │   ├── DataView.stories.tsx  # New story implementation
│   │   └── menus-and-actions/
│   │       └── Toolbar.stories.tsx # Updating with dropdowns
│   └── data/
│       └── products.json         # Existing data source
└── components/
    └── dropdown/                 # Existing component
```

**Structure Decision**: Using existing project structure (frontend with Storybook)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Card component implementation pattern analysis
   - Table component implementation pattern analysis
   - Dropdown component API and usage
   - Toolbar composition patterns
   - State management for view switching and attribute filtering

2. **Generate and dispatch research agents**:
   ```
   Task: "Analyze existing Card component patterns in src/stories/compositions/"
   Task: "Review Table component implementation in src/stories/components/"
   Task: "Study dropdown component API from src/components/dropdown/"
   Task: "Examine toolbar patterns in src/stories/compositions/menus-and-actions/"
   Task: "Research state management patterns for component composition"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all component patterns documented

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Product entity with all attributes from products.json
   - ViewMode enum (card | table)
   - AttributeSelection set
   - ToolbarState interface

2. **Generate API contracts** from functional requirements:
   - Component props interfaces for DataView story
   - Event handlers for view switching
   - Attribute selection change handlers
   - Output to `/contracts/component-interfaces.ts`

3. **Generate contract tests** from contracts:
   - N/A for Storybook stories (visual testing)

4. **Extract test scenarios** from user stories:
   - Default view renders correctly
   - View switching preserves state
   - Attribute filtering updates display
   - Toolbar controls are accessible

5. **Update agent file incrementally** (O(1) operation):
   - Update CLAUDE.md with Data View composition patterns
   - Add new component relationships
   - Document state management approach

**Output**: data-model.md, /contracts/*, quickstart.md, updated CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each component integration → setup task
- Each view mode → implementation task
- Each control → interaction task
- State management → coordination task

**Ordering Strategy**:
- Setup tasks first (imports, basic structure)
- Core functionality before enhancements
- View components before controls
- Integration last

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following design patterns)
**Phase 5**: Validation (visual testing in Storybook, lint checks)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations - implementation follows existing patterns and simplicity principles.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

**Artifacts Generated**:
- [x] research.md - Component patterns and decisions documented
- [x] data-model.md - Entity relationships and state management defined
- [x] contracts/component-interfaces.ts - TypeScript interfaces created
- [x] quickstart.md - Testing guide and usage instructions written

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*