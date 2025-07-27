# D3.js Chart Components - Phase 1 Implementation

This directory contains the foundational implementation for D3.js chart components within the Pattern Playground design system. Phase 1 establishes the architecture, base classes, type system, and primitive components that will support all future chart implementations.

## Phase 1 Complete ✅

### 1. Base D3 Abstractions
- **`D3Component`** - Base LitElement with SVG container management and responsive sizing
- **`ChartComponent`** - Chart-specific base class with scale management and interactions
- Both classes follow Lit reactive patterns and pp- prefix conventions

### 2. TypeScript Interfaces
- **`LineChartData`**, **`BarChartData`**, **`AreaChartData`**, **`TreeData`** - Complete type definitions
- **Type guards** - Runtime validation functions (isLineChartData, isBarChartData, etc.)
- **Configuration interfaces** - AxisConfig, LegendConfig, TooltipConfig, ChartConfig

### 3. Data Converters & Validation
- **Pure converter functions** - parseChartData, convertToLineChartData, etc.
- **Data transformation utilities** - transformBarChartData, getDataExtent, getCategories
- **Validation helpers** - validateChartData with comprehensive type checking
- **Real-time update support** - mergeChartData for live data scenarios

### 4. Interaction Layers Framework
- **`ChartInteraction`** interface - Contract for all interaction types
- **`HoverInteraction`** & **`ClickInteraction`** - Basic gesture implementations
- **`InteractionLayer`** - Manager for multiple interactions with registerGesture/destroy
- **Plugin architecture** - Future-proof system for zoom, pan, brush, drill-down

### 5. Chart Primitive Components
- **`<pp-chart-axis>`** - Standalone reusable axis with D3 scale support
- **`<pp-chart-legend>`** - Interactive legend with visibility toggling
- **`<pp-tooltip>`** - Reuses existing tooltip component with advanced Floating UI positioning
- **`<pp-chart-grid>`** - Optional grid lines with configurable density

### 6. CSS Styling Framework
- **Design tokens** - CSS custom properties for colors, typography, spacing (in `src/styles/charts.css`)
- **Dark/light theme support** - Automatic theme switching
- **Responsive design** - Media queries for mobile, tablet, desktop
- **Accessibility features** - High contrast, reduced motion, focus indicators

## Directory Structure

```
src/components/charts/
├── base/                          # Core abstractions and utilities
│   ├── d3-component.ts           # Base D3 LitElement with SVG management
│   ├── chart-component.ts        # Chart-specific base class
│   ├── chart-types.ts            # TypeScript interfaces and type guards
│   ├── data-converters.ts        # Data parsing and validation utilities
│   ├── interaction-layers.ts     # Interaction framework and basic gestures
│   └── index.ts                  # Base module exports
├── primitives/                    # Reusable chart building blocks
│   ├── pp-chart-axis.ts          # Standalone axis component
│   ├── pp-chart-legend.ts        # Interactive legend component
│   ├── pp-chart-grid.ts          # Optional grid lines component
│   └── index.ts                  # Primitives module exports (includes pp-tooltip re-export)
├── renderers/                     # Pure D3 rendering modules (Phase 2+)
├── index.ts                      # Main module exports and initialization
└── README.md                     # This documentation

src/styles/
└── charts.css                    # All chart component styles and design tokens
```

## Usage Examples

### Basic Component Usage
```typescript
import { D3Component, ChartComponent } from './base/index.js';
import './primitives/chart-axis.js';
import './primitives/chart-legend.js';
// Note: CSS is automatically imported via each component

// Extend ChartComponent for custom charts
class MyChart extends ChartComponent {
  setupScales() {
    // Implement scale setup
  }

  renderChart() {
    // Implement chart rendering
  }
}
```

### Data Conversion
```typescript
import { convertToBarChartData, validateChartData } from './base/index.js';

const rawData = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 }
];

const chartData = convertToBarChartData(rawData);
if (validateChartData(chartData, 'bar')) {
  // Data is valid for bar chart
}
```

### Interaction Layer Setup
```typescript
import {
  InteractionLayer,
  HoverInteraction,
  ClickInteraction
} from './base/index.js';

const layer = new InteractionLayer(svgElement);
layer.registerGesture(new HoverInteraction(), { delay: 100 });
layer.registerGesture(new ClickInteraction());
```

### Using Chart Primitives
```html
<pp-chart-axis
  orientation="bottom"
  label="Categories"
  tick-count="5">
</pp-chart-axis>

<pp-chart-legend
  .items=${legendData}
  orientation="horizontal"
  interactive>
</pp-chart-legend>

<pp-tooltip
  content="Chart data point information"
  placement="top"
  trigger="hover">
  <div slot="anchor">Chart element</div>
</pp-tooltip>
```

## CSS Custom Properties

### Color System
```css
--chart-primary-color: #007acc;
--chart-background: #ffffff;
--chart-text-primary: #212529;
--chart-color-1: #007acc;  /* Data series colors */
--chart-color-2: #ff6b35;
/* ... up to --chart-color-10 */
```

### Dark Theme
```css
[data-theme="dark"] {
  --chart-background: #121212;
  --chart-text-primary: #ffffff;
  --chart-primary-color: #4fc3f7;
}
```

### Typography
```css
--chart-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--chart-font-size-sm: 12px;
--chart-font-size-md: 14px;
--chart-font-size-lg: 16px;
```

## Next Phases

### Phase 2: Bar Chart Implementation (Next)
- `bar-chart-renderer.ts` - Pure D3 bar chart rendering
- `pp-bar-chart.ts` - Lit component with full API
- Basic interactions (hover, click) integration
- Real-time data updates via reactive properties
- Responsive design and accessibility features

### Phase 3: Additional Chart Types
- Line charts with multiple series and curve interpolation
- Area charts with stacking support
- Tree diagrams with pan/zoom navigation
- All charts integrated with primitive components

### Phase 4: Advanced Features
- Advanced interactions (zoom, pan, brush, drill-down)
- Animation and transition effects
- Export capabilities (PNG, SVG, PDF)
- Performance optimization and virtualization
- Enhanced accessibility features

## Implementation Notes

### Design Decisions
- **Composition over inheritance** - Components use primitives via composition
- **Pure rendering modules** - D3 logic separated from Lit lifecycle
- **Type-first approach** - Strong TypeScript interfaces throughout
- **Progressive enhancement** - Works without JavaScript, enhanced with it
- **CSS custom properties** - Theme-able and responsive by default

### Performance Considerations
- Lit's efficient re-rendering with `updated()` lifecycle
- D3's enter/update/exit pattern for DOM efficiency
- Minimal DOM manipulation and optimal SVG usage
- Future virtualization support for large datasets

### Accessibility
- ARIA labels and roles on all interactive elements
- Keyboard navigation support throughout
- Screen reader compatibility with semantic markup
- High contrast mode and reduced motion support
- Color blind friendly default color schemes

This Phase 1 implementation provides a robust foundation for building sophisticated chart components while maintaining consistency with the existing design system patterns and progressive enhancement philosophy.