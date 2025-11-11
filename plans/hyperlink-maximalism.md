# Hyperlink Maximalism Implementation Plan

## Overview

Implement the "hyperlink maximalism" pattern from [Linus Lee's article](https://thesephist.com/posts/hyperlink/), where documents become densely interconnected knowledge systems through dynamic, on-demand link generation rather than relying solely on author-created static links.

## Core Concept

Transform text into an interactive network where:
- Any word/phrase can become a hyperlink dynamically
- Visual feedback (heatmap) shows connection density
- Text selection triggers contextual search across content
- Related mentions appear ranked by similarity

## Key Components

### 1. Text Analysis Service
**Purpose**: Analyze content and compute connection density

**Features**:
- N-gram extraction from text content
- Similarity scoring between text segments
- Connection density calculation for heatmap visualization
- Real-time analysis as content updates

**Implementation**:
- Framework-agnostic TypeScript service
- Configurable n-gram size (default: 3-4 words)
- Efficient in-memory indexing for fast lookups
- Support for multiple content sources (documents, notes, etc.)

### 2. Hyperlink Heatmap Component
**Purpose**: Visualize connection density across text

**Visual design**:
- Gradient overlay indicating connection strength
- Subtle highlighting that doesn't interfere with readability
- Configurable color schemes
- Responsive to content updates

**Implementation**:
- `<pp-hyperlink-heatmap>` web component
- CSS custom properties for theming
- Uses text analysis service for density calculation
- Light DOM for accessibility

### 3. Connection Popup Component
**Purpose**: Display related content on text selection

**Features**:
- Shows contextually-ranked mentions
- Includes snippets with highlighted matching text
- Keyboard navigation support
- Click-to-navigate to related content

**Implementation**:
- `<pp-connection-popup>` web component
- Positioned relative to selection
- Async loading with spinner for search
- Escape key to dismiss

### 4. Interactive Text Component
**Purpose**: Orchestrate the hyperlink maximalism experience

**Features**:
- Text selection detection
- Heatmap overlay integration
- Popup trigger on selection
- Keyboard shortcuts (Ctrl+L to toggle mode)

**Implementation**:
- `<pp-hyperlink-text>` web component wrapper
- Manages state between heatmap and popup
- Progressive enhancement (works without JS)
- Emits custom events for integration

## Technical Architecture

### Services Layer (Framework-agnostic)
```
HyperlinkService
├── Content indexing and n-gram extraction
├── Similarity scoring algorithms
├── Connection density calculation
└── Search and ranking
```

### Component Layer (Web Components)
```
pp-hyperlink-text (orchestrator)
├── pp-hyperlink-heatmap (visualization)
└── pp-connection-popup (results display)
```

### Integration Points
- Tiptap editor extension (optional)
- Storybook documentation examples
- JSON mock data for testing

## Implementation Phases

### Phase 1: Core Service (Foundation)
- [ ] Create `HyperlinkService` class
- [ ] Implement n-gram extraction
- [ ] Build similarity scoring algorithm
- [ ] Add connection density calculation
- [ ] Write unit tests

### Phase 2: Heatmap Visualization
- [ ] Create `<pp-hyperlink-heatmap>` component
- [ ] Implement density-to-color mapping
- [ ] Add CSS custom property theming
- [ ] Integrate with HyperlinkService
- [ ] Create Storybook stories

### Phase 3: Connection Popup
- [ ] Create `<pp-connection-popup>` component
- [ ] Design popup layout and styling
- [ ] Implement keyboard navigation
- [ ] Add loading states
- [ ] Create Storybook stories

### Phase 4: Orchestration
- [ ] Create `<pp-hyperlink-text>` wrapper component
- [ ] Implement text selection detection
- [ ] Wire up heatmap and popup
- [ ] Add keyboard shortcuts
- [ ] Progressive enhancement testing

### Phase 5: Integration & Documentation
- [ ] Create Tiptap extension (optional)
- [ ] Build comprehensive Storybook examples
- [ ] Add mock data for demonstrations
- [ ] Write MDX documentation
- [ ] Performance testing and optimization

## Algorithm Details

### N-gram Similarity
- Extract overlapping n-grams from text (default n=3-4)
- Compute Jaccard similarity: `|A ∩ B| / |A ∪ B|`
- Rank results by similarity score
- Filter results below threshold (default 0.2)

### Connection Density
For each word/phrase:
1. Extract n-grams containing the word
2. Count matching n-grams across all content
3. Normalize by content size
4. Map to color intensity (0-1 scale)

### Performance Optimization
- Incremental indexing as content changes
- Debounced recalculation on edits
- Web Worker for heavy computation (optional)
- Cached similarity scores

## User Experience

### Interaction Flow
1. User sees text with heatmap overlay (subtle highlighting)
2. User selects/hovers over high-density phrase
3. Popup appears showing related mentions
4. User can navigate to related content
5. Keyboard shortcuts enable power-user workflows

### Accessibility
- Heatmap doesn't interfere with screen readers
- Popup content is keyboard accessible
- ARIA labels for connection counts
- Respects prefers-reduced-motion

## Mock Data Structure

```json
{
  "documents": [
    {
      "id": "doc-1",
      "title": "Document Title",
      "content": "Full text content...",
      "metadata": {
        "created": "2025-01-10",
        "tags": ["tag1", "tag2"]
      }
    }
  ]
}
```

## Testing Strategy

### Unit Tests
- N-gram extraction accuracy
- Similarity scoring correctness
- Connection density calculations
- Edge cases (empty text, special characters)

### Integration Tests
- Component communication
- Service integration
- Event handling
- State management

### Visual Tests
- Heatmap rendering across themes
- Popup positioning
- Responsive behavior
- Loading states

## Future Enhancements

### Advanced Features
- Web browsing history integration
- LLM-powered semantic similarity (beyond n-grams)
- Multi-document graph visualization
- Bidirectional link display
- Link strength over time

### Performance
- IndexedDB persistence for large corpora
- Virtual scrolling for long documents
- Lazy loading of connection data
- Service Worker caching

### UX Refinements
- Configurable heatmap intensity
- Custom color schemes
- Keyboard shortcut customization
- Link preview on hover

## Success Criteria

- [ ] Heatmap renders smoothly on 10,000+ word documents
- [ ] Search returns results in <100ms for typical documents
- [ ] Keyboard navigation supports power users
- [ ] Accessible to screen readers
- [ ] Works gracefully without JavaScript (progressive enhancement)
- [ ] Comprehensive Storybook documentation
- [ ] Clean, maintainable codebase following project conventions

## References

- [Original article](https://thesephist.com/posts/hyperlink/)
- [Notation app](https://notation.linus.zone/) - Reference implementation
- Related patterns: Deep Linking, Reference Systems, Search
