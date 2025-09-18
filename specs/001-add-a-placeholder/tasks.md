# Tasks: Data View Composition

**Input**: Design documents from `/specs/001-add-a-placeholder/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend**: `src/stories/`, `src/components/` at repository root
- **Data**: `src/stories/data/` for JSON files
- **Styles**: `src/styles/` for CSS files
- Paths shown below follow existing project structure

## Phase 3.1: Setup & Preparation
- [ ] T001 Update src/stories/compositions/DataView.mdx with placeholder content and story reference
- [ ] T002 Create src/stories/compositions/DataView.stories.tsx with basic story structure
- [ ] T003 [P] Verify products.json exists at src/stories/data/products.json
- [ ] T004 [P] Check Web Component dependencies (pp-dropdown, pp-list, pp-table) are registered

## Phase 3.2: Type Definitions & Interfaces
- [ ] T005 [P] Create TypeScript interfaces for Product entity in src/stories/compositions/DataView.stories.tsx
- [ ] T006 [P] Define ViewMode type and AttributeSelection type in src/stories/compositions/DataView.stories.tsx
- [ ] T007 [P] Create component prop interfaces (DataViewProps, CardViewProps, TableViewProps) in src/stories/compositions/DataView.stories.tsx

## Phase 3.3: Core Components Implementation
- [ ] T008 Implement CardView component for card representation in src/stories/compositions/DataView.stories.tsx
- [ ] T009 Implement TableView component for table representation in src/stories/compositions/DataView.stories.tsx
- [ ] T010 Create ViewSwitcher dropdown component in src/stories/compositions/DataView.stories.tsx
- [ ] T011 Create AttributeSelector dropdown component with checkbox list in src/stories/compositions/DataView.stories.tsx
- [ ] T012 Implement attribute extraction utility function (getAvailableAttributes) in src/stories/compositions/DataView.stories.tsx

## Phase 3.4: State Management & Logic
- [ ] T013 Implement main DataView component with React hooks for state in src/stories/compositions/DataView.stories.tsx
- [ ] T014 Add view mode switching logic with state persistence in src/stories/compositions/DataView.stories.tsx
- [ ] T015 Add attribute selection toggle logic with Set operations in src/stories/compositions/DataView.stories.tsx
- [ ] T016 Implement attribute value extraction with nested path support in src/stories/compositions/DataView.stories.tsx

## Phase 3.5: Toolbar Integration
- [ ] T017 Create DataViewToolbar component composition in src/stories/compositions/DataView.stories.tsx
- [ ] T018 Update src/stories/compositions/menus-and-actions/Toolbar.stories.tsx with DataView example
- [ ] T019 Apply toolbar CSS classes and flexbox layout in toolbar components

## Phase 3.6: Data Display & Formatting
- [ ] T020 Implement product data mapping for card view with selected attributes in src/stories/compositions/DataView.stories.tsx
- [ ] T021 Implement product data mapping for table view with dynamic columns in src/stories/compositions/DataView.stories.tsx
- [ ] T022 Add missing data handling (show "N/A" for undefined attributes) in display components
- [ ] T023 Format pricing and numeric values with appropriate display formatting in src/stories/compositions/DataView.stories.tsx

## Phase 3.7: Storybook Story Configuration
- [ ] T024 Create default DataView story export in src/stories/compositions/DataView.stories.tsx
- [ ] T025 Add story args for defaultView and defaultAttributes configuration in src/stories/compositions/DataView.stories.tsx
- [ ] T026 Configure story metadata with title "Compositions/Data View" in src/stories/compositions/DataView.stories.tsx

## Phase 3.8: Visual Polish & UX
- [ ] T027 Apply card grid layout CSS classes (cards, cards--grid) in CardView component
- [ ] T028 Apply table styling with pp-table wrapper in TableView component
- [ ] T029 Add empty state handling using src/stories/patterns/states/StateEmpty.mdx patterns when no attributes selected
- [ ] T030 Add empty state for no products scenario using informational empty state pattern
- [ ] T031 Implement smooth transitions between view modes using React rendering

## Phase 3.9: Testing & Validation
- [ ] T032 [P] Test view switching preserves attribute selection in Storybook
- [ ] T033 [P] Test attribute toggle updates both card and table views in Storybook
- [ ] T034 [P] Test dropdown keyboard navigation and accessibility in Storybook
- [ ] T035 [P] Validate all products from products.json render correctly in Storybook
- [ ] T036 [P] Test empty state displays when no attributes are selected in Storybook

## Phase 3.10: Documentation & Cleanup
- [ ] T037 Update src/stories/compositions/DataView.mdx with usage examples and API documentation
- [ ] T038 [P] Run npm run test to verify ESLint and Stylelint pass
- [ ] T039 [P] Add inline documentation comments for complex logic in DataView.stories.tsx
- [ ] T040 Remove any console.log statements and development artifacts

## Dependencies
- Setup (T001-T004) before all implementation
- Type definitions (T005-T007) before component implementation
- Core components (T008-T012) before state management
- State management (T013-T016) before toolbar integration
- All implementation before testing (T031-T034)
- Testing before documentation (T035-T038)

## Parallel Execution Examples
```bash
# Launch type definitions together (different logical units):
Task: "Create TypeScript interfaces for Product entity"
Task: "Define ViewMode type and AttributeSelection type"
Task: "Create component prop interfaces"

# Launch testing tasks together (independent test scenarios):
Task: "Test view switching preserves attribute selection"
Task: "Test attribute toggle updates both views"
Task: "Test dropdown keyboard navigation"
Task: "Validate all products render correctly"

# Launch final cleanup tasks together:
Task: "Run npm run test for linting"
Task: "Add inline documentation comments"
```

## Notes
- All implementation is in TypeScript/React within Storybook stories
- No backend or API work required (using static JSON data)
- Focus on composition of existing Web Components
- State management is local to the story component
- [P] tasks can run simultaneously as they don't conflict

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All interfaces from contracts have TypeScript definitions
- [x] All entities from data-model have corresponding types
- [x] All test scenarios from quickstart have tasks
- [x] Parallel tasks are truly independent (different concerns)
- [x] Each task specifies exact file path
- [x] No parallel tasks modify the same file simultaneously
- [x] Tasks follow logical dependency order

## Execution Summary
- **Total Tasks**: 40
- **Parallel Tasks**: 12 (marked with [P])
- **Estimated Time**: 3-4 hours for full implementation
- **Critical Path**: Setup → Types → Components → State → Integration → Test → Polish

## Empty State Integration
Following the patterns from `src/stories/patterns/states/StateEmpty.mdx`, the Data View will include:

### Informational Empty State (T030)
When no products are available:
```jsx
<div className="empty-state border flow">
  <h3>No products to display</h3>
  <p>Check your data source or try adjusting your filters.</p>
</div>
```

### Blank Slate (T029)
When no attributes are selected:
```jsx
<div className="empty-state border flow">
  <Icon style={{fontSize: "3rem"}} icon="ph:list" />
  <h3>Select attributes to view</h3>
  <p>Choose which product details you'd like to see from the attributes dropdown.</p>
</div>
```

This ensures a consistent user experience following the established empty state patterns in the design system.