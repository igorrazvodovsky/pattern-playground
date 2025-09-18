# Quickstart: Data View Composition

## Overview
This guide demonstrates how to interact with the Data View composition story in Storybook, which showcases a flexible data display pattern with switchable representations (cards and tables) and dynamic attribute selection.

## Prerequisites
- Storybook running locally (`npm run storybook`)
- Browser with Web Components support (all modern browsers)

## Quick Test Scenarios

### 1. Basic Functionality Test
```
1. Navigate to Storybook (http://localhost:6006)
2. Open "Compositions > Data View" in the sidebar
3. Verify the default card view loads with product data
4. Confirm toolbar controls are visible at the top
```

### 2. View Switching Test
```
1. Click the view switcher dropdown (shows current view mode)
2. Select "Table" from the dropdown
3. Verify products display in table format
4. Click the dropdown again and select "Card"
5. Verify products return to card layout
✓ State should persist between switches
```

### 3. Attribute Selection Test
```
1. Click the attribute selector dropdown
2. Uncheck "Description" attribute
3. Verify description disappears from cards/table
4. Check "Sustainability > Carbon Footprint"
5. Verify carbon footprint data appears
6. Switch views and confirm attributes persist
✓ Selected attributes should remain active across view changes
```

### 4. Combined Interaction Test
```
1. Start in card view with default attributes
2. Select additional attributes:
   - Pricing > MSRP
   - Lifecycle > Design Life
   - Sustainability > Recyclability Score
3. Switch to table view
4. Verify all selected attributes appear as columns
5. Deselect some attributes
6. Switch back to card view
7. Verify cards show only selected attributes
✓ Full state management should work seamlessly
```

## Component Structure

### HTML Structure Generated
```html
<div class="data-view">
  <!-- Toolbar -->
  <div class="toolbar">
    <pp-dropdown><!-- View switcher --></pp-dropdown>
    <pp-dropdown><!-- Attribute selector --></pp-dropdown>
  </div>

  <!-- Card View (when selected) -->
  <div class="cards cards--grid">
    <article class="card"><!-- Product data --></article>
    <!-- More cards... -->
  </div>

  <!-- Table View (when selected) -->
  <pp-table>
    <table>
      <thead><!-- Dynamic columns based on attributes --></thead>
      <tbody><!-- Product rows --></tbody>
    </table>
  </pp-table>
</div>
```

## Key Features Demonstrated

### Progressive Enhancement
- Semantic HTML structure works without JavaScript
- Web Components enhance functionality when available
- CSS provides base styling independent of JS

### Component Composition
- Combines multiple design system components
- `pp-dropdown` for control interfaces
- `pp-table` for table representation
- CSS-only cards for card representation
- `pp-list` and `pp-list-item` for dropdown options

### State Management
- React hooks manage view and attribute state
- State persists across view changes
- Declarative rendering based on state

### Data Flexibility
- Dynamic attribute extraction from nested objects
- Dot notation for nested properties (e.g., "pricing.msrp")
- Handles missing data gracefully

## Customization Points

### Adding New View Modes
1. Add new ViewMode type value
2. Implement new view component
3. Add case in view renderer
4. Update view switcher options

### Adding New Attributes
Attributes are dynamically extracted from product data. To add:
1. Ensure data exists in products.json
2. Attribute automatically appears in selector
3. Implement custom display logic if needed

### Styling Customization
- Card styles: `src/styles/card.css`
- Table styles: via `pp-table` component
- Toolbar styles: `src/styles/toolbar.css`

## Testing Checklist

- [ ] **Initial Load**: Data View loads with products in default view
- [ ] **View Switching**: Can toggle between card and table views
- [ ] **Attribute Selection**: Can select/deselect attributes
- [ ] **State Persistence**: Selections persist across view changes
- [ ] **Data Display**: Selected attributes show correctly in both views
- [ ] **Empty States**: Handles no attributes selected gracefully
- [ ] **Keyboard Navigation**: Dropdowns accessible via keyboard
- [ ] **Screen Reader**: Proper labels and announcements
- [ ] **Responsive**: Layout adapts to viewport size

## Common Issues & Solutions

### Products Not Displaying
- Check products.json is loaded correctly
- Verify import path in story file
- Check browser console for errors

### Dropdowns Not Working
- Ensure Web Components are registered
- Check `pp-dropdown` is imported
- Verify browser supports Web Components

### Attributes Not Updating
- Check state management hooks
- Verify attribute paths are valid
- Ensure re-render triggers on state change

### Styling Issues
- Check CSS cascade layers are loaded
- Verify class names match CSS selectors
- Ensure design tokens are available

## Next Steps

1. **Extend the Pattern**: Add filtering, sorting, and search
2. **Add Persistence**: Save view preferences to localStorage
3. **Performance**: Add virtualization for large datasets
4. **Accessibility**: Add keyboard shortcuts for view switching
5. **Documentation**: Create usage guidelines for developers

## Code Location
- Story implementation: `src/stories/compositions/DataView.stories.tsx`
- Documentation: `src/stories/compositions/DataView.mdx`
- Toolbar integration: `src/stories/compositions/menus-and-actions/Toolbar.stories.tsx`
- Product data: `src/stories/data/products.json`

## Support
For issues or questions about the Data View composition:
1. Check this quickstart guide
2. Review the MDX documentation in Storybook
3. Examine the source code in the files listed above
4. Refer to individual component documentation