# ESLint Warning Resolution Plan

## Overview

All 14 current ESLint warnings are `react-refresh/only-export-components` violations. This rule ensures optimal React Fast Refresh functionality during development by requiring that files either export only React components OR only non-component utilities.

## Current Warnings Breakdown

- **EditorProvider.tsx**: 3 warnings (lines 188, 196, 201)
- **LazyEditorPlugin.tsx**: 1 warning (line 95)
- **PerformanceMonitor.tsx**: 1 warning (line 158)
- **ContentAdapterRegistry.tsx**: 3 warnings (lines 62, 70, 75)
- **CommentAwareAdapterBase.tsx**: 1 warning (line 13)
- **QuoteAdapter.tsx**: 3 warnings (lines 34, 51, 98)
- **ModalErrorBoundary.tsx**: 1 warning (line 47)
- **Reference.tsx**: 1 warning (line 377)

## Resolution Strategy: File Separation

### 1. EditorProvider.tsx
**Issue**: Exports component + 3 hooks
**Solution**: Extract hooks to `src/components/editor/hooks/useEditorContext.ts`
- Move `useEditorContext`, `usePlugin`, `useEditorEvents`
- Update all imports across codebase

### 2. LazyEditorPlugin.tsx
**Issue**: Exports component + utility function
**Solution**: Extract utility to `src/components/editor/utils/pluginHelpers.ts`
- Move non-component export to dedicated utility file

### 3. PerformanceMonitor.tsx
**Issue**: Exports component + performance utility
**Solution**: Extract utility to `src/components/editor/utils/performanceUtils.ts`
- Move performance-related utility to dedicated file

### 4. ContentAdapterRegistry.tsx
**Issue**: Exports component + 3 registry functions
**Solution**: Extract functions to `src/components/item-view/utils/adapterUtils.ts`
- Move adapter registry functions to utility file

### 5. CommentAwareAdapterBase.tsx
**Issue**: Exports utility component alongside main component
**Solution**: Extract `CommentSection` to `src/components/item-view/components/CommentSection.tsx`
- Create dedicated component file for CommentSection

### 6. QuoteAdapter.tsx
**Issue**: Exports main component + 3 utility components
**Solution**: Extract utilities to separate component files
- Create individual component files for helper components

### 7. ModalErrorBoundary.tsx
**Issue**: Exports boundary + utility component
**Solution**: Extract utility to separate file
- Move non-boundary components to dedicated files

### 8. Reference.tsx
**Issue**: Exports component + utility function
**Solution**: Extract utility to `src/components/reference/utils/referenceUtils.ts`
- Move reference utilities to dedicated utility file

## Implementation Benefits

- ✅ **Zero ESLint warnings**: Complete resolution of all current warnings
- ✅ **Optimal React Fast Refresh**: Improved development experience with faster hot reloading
- ✅ **Better code organization**: Clear separation between components and utilities
- ✅ **Improved maintainability**: Single responsibility principle for files
- ✅ **Follows codebase patterns**: Aligns with existing modular architecture

## Implementation Order

1. Start with files that have utility functions (easier to extract)
2. Handle component extractions (require more careful refactoring)
3. Update all import statements across the codebase
4. Run ESLint to verify resolution
5. Run tests to ensure no breaking changes

## Alternative Approaches

If file separation is not desired, alternatives include:
- **Rule configuration**: Disable or adjust the rule in ESLint config
- **Selective suppression**: Use `// eslint-disable-next-line` comments
- **Rule exception**: Add specific file patterns to rule exceptions

However, the file separation approach is recommended as it follows React best practices and improves code organization.