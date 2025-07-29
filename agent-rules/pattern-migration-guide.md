# Pattern Migration Guide for Storybook Documentation

## Overview
This guide provides a systematic approach for migrating patterns between directories in a Storybook-based design system while maintaining all cross-references and documentation integrity.

## Prerequisites
Before starting any migration:
1. **Create a git branch** for the migration work
2. **Identify the scope** by listing all patterns to be moved
3. **Analyse current state** including Meta titles, cross-references, and file structures
4. **Create a detailed migration plan** as a markdown file for review

## Migration Process Template

### Phase 1: Analysis and Planning
1. **Directory scan**: Use LS tool to identify all files and subdirectories
2. **Pattern inventory**: List all patterns with their current structure:
   - Simple .mdx files
   - .mdx files with companion .stories.tsx files
   - Complex directories with multiple file types
3. **Meta title extraction**: Read all .mdx files to identify:
   - Current Meta component titles
   - Cross-references to other patterns
   - Internal links that will need updating
4. **Dependency mapping**: Document all incoming and outgoing references

### Phase 2: File Structure Migration
For each pattern, follow this sequence:

#### Simple Files (.mdx only)
1. Move file to new location
2. Update Meta title if present
3. Update internal cross-references
4. Search codebase for external references

#### Complex Patterns (with stories/components)
1. Move entire directory structure
2. Update Meta title in .stories.tsx file
3. Check for import path dependencies in TypeScript files
4. Update internal cross-references in .mdx files
5. Search codebase for external references

### Phase 3: URL Reference Updates

#### Storybook URL Pattern Rules
Based on Meta title transformation:
- **Format**: `<Meta title="Category/Name" />` becomes `../?path=/docs/category-name--docs`
- **Transformations**:
  - Spaces → hyphens
  - Uppercase → lowercase  
  - Asterisks (*) → removed from URLs
  - Forward slashes (/) → hyphens

#### Search Strategy
1. **Global search** for old URL patterns across entire codebase
2. **Pattern-specific searches** for each moved pattern
3. **Cross-reference updates** within moved files
4. **Import path updates** in TypeScript files if applicable

### Phase 4: Documentation Updates
1. Update any hierarchy or overview documentation
2. Update CLAUDE.md if it references the old structure
3. Update README files if they mention the directory structure

### Phase 5: Validation
1. **Build test**: Run Storybook build to check for errors
2. **Link verification**: Navigate through Storybook to verify all links work
3. **TypeScript compilation**: Ensure all imports resolve correctly
4. **Cross-reference audit**: Verify all internal documentation links function

## File Types to Handle

### Documentation Files
- **Simple .mdx**: Move file, update Meta title, update references
- **Complex .mdx**: Move file, update Meta title, update references, check companion files

### Story Files  
- **.stories.tsx**: Update Meta title, check import paths, move with .mdx file

### Support Files
- **TypeScript files** (.ts, .tsx): Check import paths, move with pattern
- **JSON data files**: Move with pattern, check import references
- **HTML templates**: Move with pattern, check references
- **CSS files**: Move with pattern, check import paths

### Directory Structures
- **Single files**: Direct move and reference update
- **Pattern directories**: Move entire structure, update all internal references
- **Nested subdirectories**: Preserve structure, update all import paths

## Common URL Reference Patterns

### Internal Storybook Links
```markdown
[Pattern Name](../?path=/docs/category-pattern-name--docs)
```

### Meta Title Formats
```typescript
// Simple explicit title
<Meta title="Category/Pattern Name" />

// Reference to stories
<Meta of={PatternStories} />
```

### Cross-Reference Updates
Search for and update:
- `old-category-pattern-name--docs` → `new-category-pattern-name--docs`
- Relative import paths in TypeScript files
- JSON file references in import statements

## Risk Mitigation Strategies

### Pre-Migration Checklist
- [ ] Git branch created
- [ ] Full pattern inventory completed  
- [ ] All cross-references documented
- [ ] Migration plan reviewed and approved

### During Migration
- [ ] Test build after each pattern migration
- [ ] Update references immediately after moving files
- [ ] Document any unexpected issues or discoveries

### Post-Migration Validation
- [ ] Full Storybook build succeeds
- [ ] All documentation links function correctly
- [ ] No broken imports in TypeScript compilation
- [ ] Cross-reference audit completed

## Template Commands

### Directory Analysis
```bash
# List all files in source directory
ls -la src/stories/[source-category]/

# Search for pattern references across codebase  
grep -r "pattern-name" src/stories/
```

### File Operations
```bash
# Move simple file
mv src/stories/old-location/Pattern.mdx src/stories/new-location/

# Move complex directory
mv src/stories/old-location/PatternDir/ src/stories/new-location/
```

### Reference Search
```bash
# Find all references to old URL pattern
grep -r "old-category-pattern-name--docs" src/stories/

# Find import references
grep -r "from.*old-location" src/
```

## Success Criteria
A successful migration should result in:
- All patterns accessible in new Storybook location
- All cross-references functioning correctly
- No broken links in documentation
- Clean TypeScript compilation
- Successful Storybook build
- All import paths resolving correctly

## Documentation Standards
- Always create a migration plan before executing
- Document any deviations from the standard process
- Update relevant documentation files post-migration
- Include timeline and responsible parties for complex migrations

---

**Note**: This guide follows the documentation linking standards specified in CLAUDE.md and maintains British spelling conventions throughout the process.