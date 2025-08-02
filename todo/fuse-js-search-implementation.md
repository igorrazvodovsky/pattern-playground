# Fuse.js Search Implementation Plan

## Overview
Replace basic string matching in hierarchical search components with Fuse.js for improved fuzzy search, typo tolerance, and relevance scoring across CommandMenu, Filtering, and Reference components.

## Current State Analysis

### Components Using Search
1. **CommandMenu** (`src/stories/patterns/CommandMenu/CommandMenu.tsx`)
   - Uses `unified-hierarchical-search.ts` with `sortByRelevance`
   - Searches commands and actions with simple `includes()` matching
   - Recent items filtering on line 97-101

2. **Filtering** (`src/stories/compositions/Filtering/Filtering.tsx`)
   - Uses same unified search system
   - Searches filter categories and values

3. **Reference** (`src/stories/primitives/reference/Reference.stories.tsx`)
   - Uses ReferenceEditor component with hierarchical data
   - Searches users, projects, documents

### Current Search Implementation
- **File**: `src/utils/unified-hierarchical-search.ts`
- **Method**: Simple `toLowerCase().includes()` matching (lines 26-34)
- **Sorting**: Basic relevance scoring (lines 100-127)
  - Exact matches first
  - Starts-with matches second
  - Alphabetical fallback

## Implementation Plan

### Phase 1: Install and Configure Fuse.js
1. **Install dependency**
   ```bash
   npm install fuse.js
   npm install -D @types/fuse.js
   ```

2. **Create Fuse.js configuration utility**
   - File: `src/utils/fuse-search-config.ts`
   - Define search configurations for different component types
   - Configure keys, weights, and options per use case

### Phase 2: Enhanced Search Utility
1. **Create Fuse.js search wrapper**
   - File: `src/utils/fuse-hierarchical-search.ts`
   - Maintain existing `HierarchicalSearchResults` interface
   - Replace `sortByRelevance` with Fuse.js scoring
   - Keep hierarchical search structure intact

2. **Configuration per component type**
   - **Commands**: Weight `name` higher, include `searchableText`
   - **Filters**: Search across filter type names and values
   - **References**: Search across user names, roles, project titles

### Phase 3: Component Integration
1. **Update unified-hierarchical-search.ts**
   - Replace basic string matching with Fuse.js
   - Maintain backward compatibility with existing interfaces
   - Keep `createSortedSearchFunction` API

2. **Test component behavior**
   - Verify CommandMenu search quality improves
   - Check Filtering component maintains functionality
   - Ensure Reference picker works with fuzzy matching

### Phase 4: Fine-tuning and Optimization
1. **Configure search thresholds**
   - Set appropriate `threshold` values for each component
   - Balance between precision and recall

2. **Performance optimization**
   - Implement search debouncing if needed
   - Consider search result caching for large datasets

## Technical Details

### Fuse.js Configuration Structure
```typescript
interface FuseSearchConfig {
  keys: Array<string | { name: string; weight: number }>;
  threshold: number;
  includeScore: boolean;
  minMatchCharLength: number;
}
```

### Search Result Enhancement
- Maintain existing `SearchableParent` and `SearchableItem` interfaces
- Add optional score information for advanced sorting
- Preserve hierarchical search behavior

### Backwards Compatibility
- Keep existing `createSortedSearchFunction` API
- Ensure all current search behaviors continue working
- Add Fuse.js as enhancement, not replacement of architecture

## Success Criteria
1. **Improved search quality**: Fuzzy matching handles typos
2. **Better relevance**: More accurate result ranking
3. **Maintained performance**: No significant slowdown
4. **API compatibility**: No breaking changes to existing components

## Files to Modify
- `src/utils/unified-hierarchical-search.ts` - Core search logic
- `src/utils/fuse-search-config.ts` - New configuration file
- `src/utils/fuse-hierarchical-search.ts` - New Fuse.js wrapper
- `package.json` - Add Fuse.js dependency

## Testing Strategy
1. **Unit tests**: Test search quality improvements
2. **Integration tests**: Verify component behavior unchanged
3. **Manual testing**: Test search experience across all three components
4. **Performance testing**: Ensure no degradation in search speed