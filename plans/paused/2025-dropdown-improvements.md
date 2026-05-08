---
title: "Dropdown Component Enhancement Plan"
status: "paused"
kind: "exec-spec"
created: "2025"
last_reviewed: "2026-05-08"
area: "components"
promoted_to: ""
superseded_by: ""
---
# Dropdown Component Enhancement Plan

## Implementation Status

### ✅ **Phase 1: Critical Bug Fixes (COMPLETED)**
- **✅ Shadow DOM Traversal**: Implemented `getDeepestActiveElement()` and `computeClosestContaining()` utilities with proper recursive traversal and infinite loop protection
- **✅ Missing Popup Properties**: Added `flip`, `shift`, `autoSize`, `autoSizePadding`, `flipPadding`, `shiftPadding` properties with proper declarations and usage
- **✅ Event Handling**: Fixed event listener cleanup, improved CloseWatcher management, and enhanced disconnectedCallback
- **✅ Accessible Trigger Detection**: Enhanced to support `pp-icon-button`, generic components, and better type safety with type guards
- **✅ Memory Leak Prevention**: Comprehensive cleanup of event listeners and screen reader announcers

### ✅ **Phase 2: Accessibility & Navigation (COMPLETED)**
- **✅ Enhanced ARIA Attributes**: Added comprehensive ARIA properties to both `pp-list` and `pp-list-item` components
- **✅ Screen Reader Announcements**: Implemented live regions with contextual announcements for all state changes
- **✅ Advanced Keyboard Navigation**: Added Page Up/Down, type-ahead search, improved arrow key handling
- **✅ Focus Management**: Enhanced roving tabindex, focus visibility indicators, and `aria-activedescendant` support
- **✅ WCAG 2.1 AA Compliance**: Full keyboard accessibility, proper focus flow, and screen reader compatibility

### 🚧 **Phase 3: Submenu Support (PARTIALLY IMPLEMENTED — bugs present)**

Structure and basic logic are in place but the feature is not production-ready:

- **✅ `pp-list-item` properties**: `hasSubmenu`, `submenuOpen`, `submenuPlacement` declared and reflected
- **✅ Submenu slot + chevron**: Slot and chevron indicator rendered; CSS classes `list-item--has-submenu` / `list-item--submenu-open` applied
- **✅ ARIA for submenu items**: `aria-haspopup` / `aria-expanded` updated via `@watch` handlers
- **✅ `pp-list` submenu state**: `openSubmenu()`, `closeCurrentSubmenu()`, `closeAllSubmenus()` implemented
- **✅ Keyboard navigation**: ArrowRight opens submenu, ArrowLeft closes and returns focus
- **✅ `pp-dropdown` popup management**: `createSubmenuPopup()` / `destroySubmenuPopup()` / `cleanupSubmenuPopups()`
- **✅ Event bubbling**: `pp-select` from submenu popup bubbles to main dropdown

**Known bugs to fix before Phase 3 can be marked complete:**

1. **Submenu hover broken** (`list-item.ts`): `handleMouseOver` calls `event.stopPropagation()`, which prevents the event from reaching `pp-list`'s `handleMouseOver`. The delay-open and "close other submenus on hover" logic in `list.ts` never fires via mouse.

2. **Submenu popup clones content** (`dropdown.ts → createSubmenuPopup`): uses `cloneNode(true)` which loses event listeners and reactivity. Updates to the original light DOM element won't propagate to the displayed submenu.

3. **Private API duck-cast** (`list.ts → isMouseOverSubmenuPopup`): accesses `(dropdown as any).submenuPopups` — a typed interface or event-based approach is needed.

4. **`init()` not idempotent** (`list-item.ts`): re-connecting the element duplicates `click`, `mouseover`, `focus`, `blur` listeners. Listeners must be removed before re-adding, or registration must be guarded.

5. **Stale TODO comment**: `dropdown.ts:1–3` still has `// TODO: Submenu` — remove once bugs above are resolved.

### 📋 **Phase 4: Polish & Documentation (PLANNED)**
- Animation enhancements based on placement direction
- Performance optimizations
- Comprehensive test coverage (unit, integration, a11y, performance, cross-browser)
- Complete Storybook documentation

---

## Technical Debt Status

### ✅ **Resolved Issues**
1. **✅ Positioning glitch**: Fixed through improved Shadow DOM traversal and proper popup property declarations
2. **✅ Inconsistent Properties**: All popup properties (`flip`, `shift`, `autoSize`, etc.) now properly declared and used
3. **✅ Event Cleanup**: Enhanced event listener management with proper cleanup in disconnectedCallback
4. **✅ TypeScript Type Safety**: Added type guards, improved type definitions, and enhanced accessibility property types

### 🚧 **Remaining Issues**
1. **Submenu bugs**: See Phase 3 bug list above — hover, clone, duck-cast, and listener duplication
2. **Multiple live-region announcers**: Both `pp-dropdown` and `pp-list` independently append `aria-live` divs to `document.body`. Multiple instances on a page accumulate duplicate announcers. A shared singleton or single owner is needed.
3. **`focusOnCurrentItem` is unnecessarily public** (`list.ts`): only called internally; should be private
4. **Code coverage**: Comprehensive testing still needed
5. **Storybook documentation**: Component documentation and examples beyond the basic story

## Success Criteria

- [x] All positioning issues resolved
- [x] Full keyboard navigation support
- [x] Proper Shadow DOM compatibility
- [x] WCAG 2.1 AA compliance
- [ ] Submenu hover and reactivity bugs fixed
- [ ] Comprehensive test coverage
- [ ] Complete Storybook documentation

---

## Detailed Submenu Implementation Plan

The structure described below is largely in place. What remains is fixing the bugs listed in Phase 3.

### Current Architecture

**`pp-list-item`** — has submenu slot, chevron, properties, and ARIA watchers. The `stopPropagation()` call in `handleMouseOver` must be removed or moved to avoid blocking the parent list's hover logic.

**`pp-list`** — has full submenu state management and keyboard navigation. `isMouseOverSubmenuPopup` needs refactoring away from the `any` cast. `focusOnCurrentItem` should be made private.

**`pp-dropdown`** — creates `pp-popup` instances for submenus anchored to the list item. The `cloneNode` approach must be replaced with a live reference strategy (e.g., move the element rather than clone it, or use a portal/slot approach).

### Submenu HTML Structure (unchanged):
```html
<pp-list-item has-submenu>
  Menu Item with Submenu
  <pp-list slot="submenu">
    <pp-list-item>Submenu Item 1</pp-list-item>
    <pp-list-item>Submenu Item 2</pp-list-item>
  </pp-list>
</pp-list-item>
```

### Keyboard Navigation Map:
- `ArrowUp/Down`: Navigate within current menu level
- `ArrowRight`: Open submenu (if available) or enter submenu
- `ArrowLeft`: Close submenu and return to parent
- `Home/End`: Jump to first/last item in current level
- `Escape`: Close current submenu level
- `Enter/Space`: Select current item
- `Tab`: Exit dropdown entirely

### Performance Considerations:
1. **Lazy Submenu Creation**: Only create popup instances when needed
2. **Event Delegation**: Use single listeners on parent list
3. **RAF for Smooth Animations**: Use requestAnimationFrame for submenu transitions
4. **Memory Management**: Properly cleanup submenu event listeners

### Accessibility Requirements:
1. **Screen Reader Support**: Proper announcement of submenu states
2. **Focus Management**: Maintain focus visibility throughout navigation
3. **High Contrast**: Ensure chevron and submenu indicators are visible
4. **Keyboard Only**: Full functionality without mouse
5. **Mobile Support**: Touch-friendly submenu activation

### Phase 4: Polish & Documentation
- Animation enhancements
- Performance optimizations
- Testing improvements
