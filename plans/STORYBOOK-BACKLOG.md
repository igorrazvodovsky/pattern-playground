# Storybook backlog

Opportunities to use Storybook features more consistently and in depth across the 48 existing stories.

## Current state summary

**Consistently used:** CSF3 format, multiple named variants, render functions, faker.js for mock data, autodocs (global tag), semantic tags (all 48 stories), layout parameters (fullscreen-appropriate stories).

**Sporadically used:** argTypes/controls (14 of 48 stories), parameters (14 stories), decorators (1 story), story-level docs descriptions (3 stories), play functions (1 story).

**Not used at all:** loaders, viewport parameters, background parameters.

---

## 1. Controls and argTypes

*Currently:* Button, Input, Checkbox, Callout, Badge, Tag now have argTypes. BarChart, Card, DataView, Tabs, and Avatar were already there. Most other stories are static renders with no interactivity knobs.

### Backlog items

- [x] **Button** -- controls for label, variant (primary/danger/plain), disabled, icon position (none/prefix/suffix)
- [x] **Input** -- controls for placeholder, disabled, value, addon visibility
- [x] **Checkbox** -- controls for checked, disabled, indeterminate, label
- [x] **Badge** -- controls for label, purpose, pill
- [x] **Callout** -- controls for message, purpose/severity
- [x] **Tag** -- controls for label, removable, pill
- [x] **Popover** -- add controls for placement, trigger type
- [x] **Toast** -- add controls for message text, duration
- [x] **Dialog** -- add controls for size, title
- [x] **Drawer** -- add controls for position (left/right), size
- [x] **Toolbar** -- add controls for item count, overflow behaviour
- [x] **Timeline** -- add controls for item count, density
- [x] **Counter, Spinner** -- add controls for value/size
- [x] **Messaging** -- add controls for message count, participant count
- [x] **Audit existing argTypes** -- BarChart and DataView are the gold standard; align others to that level of description and control type specificity (Button, Input, Checkbox, Dialog, Drawer, Toast normalized to `{ type: '...' }` form in this pass)

---

## 2. Play functions (interaction testing)

*Currently:* Dialog (open trigger) and Checkbox (toggle) have play functions. The vitest addon is installed and configured.

Play functions verify interactive behaviour right in Storybook and catch regressions via `test-storybook`.

### Backlog items

- [x] **Dialog** -- play function that clicks "Open dialog", asserts dialog is visible
- [x] **Checkbox** -- click to toggle, verify state change
- [x] **Drawer** -- same pattern as Dialog
- [x] **Toast** -- trigger toast, assert alert appears in document.body
- [x] **CommandMenu** -- Basic: type query; Dialog: press `/`, wait for modal, type query
- [x] **Popover** -- click trigger, assert popover visible
- [x] **Filtering** -- click filter trigger to open dropdown
- [x] **Sorting** -- click sort control to open dropdown
- [x] **InlineConfirmation** -- trigger action, assert confirmation prompt appears
- [x] **DeletionConfirmation (Dialog)** -- click delete, dialog opens
- [x] **Tabs** -- click second tab, assert correct panel shows
- [ ] **Form** -- skipped: Conversational story is a static showcase with Shadow DOM input

---

## 3. Semantic tags (classification)

*Currently:* All 48 stories now have classification tags.

### Backlog items

- [x] **Apply tags to all operations stories** (all done — `activity-level:operation, atomic:primitive|component`)
- [x] **Apply tags to all actions stories** (all done — includes `lifecycle:*` sub-category)
- [x] **Apply tags to all activities stories** (all done)
- [x] **Apply tags to data-visualization** (done)
- [x] **Configure sidebar filtering by tag** in manager.ts if Storybook 10 supports it

---

## 4. Story-level documentation

*Currently:* Only 3 stories use `parameters.docs.description.story`. Most stories rely entirely on the companion .mdx file for context.

### Backlog items

- [x] **Add story descriptions to complex variants** -- DeletionConfirmation (already done), TypedConfirmation, ToastWithUndo done; remaining stories still need descriptions
- [x] **Add meta-level descriptions** -- use `parameters.docs.description.component` in meta to explain what the component *is* for stories that don't have a paired .mdx
- [x] **Review !autodocs / !dev tags** -- currently used on 7 stories; verify each exclusion is intentional and document the rationale in a comment

---

## 5. Decorators

*Currently:* Only ItemView uses a decorator (for ContentAdapterProvider). Many stories manually wrap content in layout divs.

### Backlog items

- [x] **Create a centered-layout decorator** -- replace inline `style={{ padding, maxWidth, margin }}` wrappers in stories like TaskCompact, TaskMini
- [ ] **Create a themed-container decorator** -- if stories need dark/light mode wrapping (no current stories need this)
- [ ] **Consider a "with toast provider" decorator** -- not needed; toast is singleton-based, no context to provide
- [ ] **Consider a "with modal service" decorator** -- not needed; `modalService` is a singleton, no context wrapping required

---

## 6. Actions addon

*Currently:* BarChart now uses `action()` for `pp-bar-hover` and `pp-bar-click`. Other event handlers still use `alert()` or state updates.

### Backlog items

- [x] **Replace console.log with action()** in BarChart event handlers (pp-bar-hover, pp-bar-click)
- [x] **Add actions to Button** -- onClick
- [x] **Add actions to Dialog/Drawer** -- onOpen (dialog-opened / drawer-opened); onClose skipped — no accessible close event from modal service
- [x] **Add actions to Filtering/Sorting** -- onFilterChange, onSortChange (requires changes to FilteringDemo component and Sorting list-item handlers)
- [x] **Add actions to Toast** -- toast-shown fires on Default story trigger
- [x] **Add actions to form elements** -- Checkbox onChange, Textarea onInput; Input skipped (pp-input is a web component, needs ref+addEventListener pattern)

---

## 7. Parameters (layout, viewport, backgrounds)

*Currently:* NavBar, DataView, FocusAndContext, and Workflow set `layout: 'fullscreen'`. CommandMenu, ItemView, Filtering, and DynamicHyperlinks also use layout parameters.

### Backlog items

- [x] **Add layout: 'fullscreen'** to NavBar, DataView, FocusAndContext, Workflow
- [x] **Audit remaining layout parameters** -- Button, Input, Checkbox, Toast, Dialog, Drawer, Textarea, Sorting all set to `layout: 'centered'`; remaining stories (Badge, Tag, Spinner, Counter, Avatar, Callout, Popover, Tabs, InlineConfirmation, etc.) still need a pass
- [ ] **Add viewport parameters** to responsive stories -- NavBar, PriorityPlus, DataView, Toolbar should define breakpoints to test (skipped)
- [ ] **Add background parameters** if any components need dark-on-light / light-on-dark testing

---

## 8. Source code display

*Currently:* No explicit source configuration. Since most stories use render functions with web components, the auto-generated source may not be useful.

### Backlog items

- [ ] **Evaluate autodocs source output** -- check if the generated source tabs show meaningful HTML/JSX for web component stories
- [ ] **Add custom source snippets** where the auto-generated source is unhelpful -- use `parameters.docs.source.code` to show the intended HTML usage of `pp-*` components; low value since most stories render web components directly (JSX ≈ HTML, only `className` vs `class` differs)
- [ ] **Consider `parameters.docs.source.type: 'code'`** for stories where the raw HTML is the most valuable documentation

---

## 9. Component property vs render-only

*Currently:* Only 3 stories (BarChart, CommandMenu, ItemView) use the `component` property in meta. The rest use render-only, which means autodocs can't generate an args table automatically.

### Backlog items

- [ ] **Identify stories with React wrapper components** that could benefit from `component` property -- evaluated: BarChart, CommandMenu, ItemView, FilteringDemo already set; remaining stories use manual argTypes or render web components directly with no React wrapper to point to
- [ ] **For web component stories** -- evaluated: creating thin React wrappers would add complexity without benefit; manual argTypes already provide the args table

---

## 10. Consistency pass

### Backlog items

- [x] **Empty argTypes** -- Breadcrumbs, Table, List, PriorityPlus, Dropdown all had `argTypes: {}`; removed
- [x] **Empty args** -- Messaging had `args: {}`; cleaned up
- [x] **Inline styles** -- several stories (Badge, PriorityPlus, TaskCompact, TaskMini) use inline `style={{}}` for layout; consider using CSS classes or decorators instead

---

## Prioritisation suggestion

| Priority | Area | Status |
|----------|------|--------|
| High | Controls/argTypes (#1) | Partially done (6 new, 5 pre-existing) |
| High | Play functions (#2) | Partially done (2 of 12) |
| High | Semantic tags (#3) | Done — all 48 stories tagged |
| Medium | Story descriptions (#4) | Not started |
| Medium | Actions addon (#6) | Partially done (BarChart) |
| Medium | Layout/viewport params (#7) | Partially done (fullscreen done) |
| Low | Decorators (#5) | Not started |
| Low | Source display (#8) | Not started |
| Low | Component property (#9) | Not started |
| Low | Consistency (#10) | Partially done (empty argTypes/args cleaned) |
