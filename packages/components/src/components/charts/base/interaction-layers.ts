/**
 * Core interaction contract and basic implementations for chart interactions
 * - Core interaction contract (registerGesture, destroy) designed in Phase 1
 * - Basic gesture implementations (hover, click) in Phase 2
 * - Plugin architecture that works with any renderer
 * - Event delegation and cleanup management
 * - Future-proof interactivity without per-chart duplication
 */

/**
 * Base interface for all chart interactions
 */
export interface ChartInteraction {
  readonly type: string;
  register(element: SVGElement | HTMLElement, config?: InteractionConfig): void;
  destroy(): void;
}

/**
 * Configuration for interactions
 */
export interface InteractionConfig {
  [key: string]: unknown;
}

/**
 * Hover interaction configuration
 */
export interface HoverConfig extends InteractionConfig {
  delay?: number;
  cursor?: string;
  highlightClass?: string;
}

/**
 * Click interaction configuration
 */
export interface ClickConfig extends InteractionConfig {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  doubleClickDelay?: number;
}

/**
 * Zoom interaction configuration (for future implementation)
 */
export interface ZoomConfig extends InteractionConfig {
  minZoom?: number;
  maxZoom?: number;
  enablePan?: boolean;
  wheelDelta?: number;
}

/**
 * Brush selection configuration (for future implementation)
 */
export interface BrushConfig extends InteractionConfig {
  direction?: 'x' | 'y' | 'xy';
  handles?: boolean;
  extent?: [[number, number], [number, number]];
}

/**
 * Event detail for chart interaction events
 */
export interface ChartInteractionEvent {
  type: string;
  target: Element;
  data?: unknown;
  coordinates?: { x: number; y: number };
  originalEvent?: Event;
}

/**
 * Basic hover interaction implementation
 */
export class HoverInteraction implements ChartInteraction {
  readonly type = 'hover';
  private element?: SVGElement | HTMLElement;
  private config: HoverConfig = {};
  private hoverTimeout?: number;

  register(element: SVGElement | HTMLElement, config: HoverConfig = {}): void {
    this.element = element;
    this.config = { delay: 0, cursor: 'pointer', ...config };

    element.addEventListener('mouseenter', this.handleMouseEnter);
    element.addEventListener('mouseleave', this.handleMouseLeave);
    element.addEventListener('mousemove', this.handleMouseMove);
  }

  destroy(): void {
    if (this.element) {
      this.element.removeEventListener('mouseenter', this.handleMouseEnter);
      this.element.removeEventListener('mouseleave', this.handleMouseLeave);
      this.element.removeEventListener('mousemove', this.handleMouseMove);
    }

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }

    this.element = undefined;
  }

  private handleMouseEnter = (event: Event) => {
    if (!this.element) return;

    if (this.config.cursor) {
      this.element.classList.add('chart-hover-cursor');
    }

    if (this.config.delay && this.config.delay > 0) {
      this.hoverTimeout = window.setTimeout(() => {
        this.dispatchHoverEvent('hover-start', event);
      }, this.config.delay);
    } else {
      this.dispatchHoverEvent('hover-start', event);
    }
  };

  private handleMouseLeave = (event: Event) => {
    if (!this.element) return;

    this.element.classList.remove('chart-hover-cursor');

    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = undefined;
    }

    this.dispatchHoverEvent('hover-end', event);
  };

  private handleMouseMove = (event: Event) => {
    if (!this.element) return;
    this.dispatchHoverEvent('hover-move', event);
  };

  private dispatchHoverEvent(type: string, event: Event) {
    if (!this.element) return;

    const rect = this.element.getBoundingClientRect();
    const mouseEvent = event as MouseEvent;
    const coordinates = {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };

    const detail: ChartInteractionEvent = {
      type,
      target: this.element,
      coordinates,
      originalEvent: event
    };

    this.element.dispatchEvent(new CustomEvent(`pp-chart-${type}`, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}

/**
 * Basic click interaction implementation
 */
export class ClickInteraction implements ChartInteraction {
  readonly type = 'click';
  private element?: SVGElement | HTMLElement;
  private config: ClickConfig = {};
  private clickTimeout?: number;
  private clickCount = 0;

  register(element: SVGElement | HTMLElement, config: ClickConfig = {}): void {
    this.element = element;
    this.config = {
      preventDefault: false,
      stopPropagation: false,
      doubleClickDelay: 300,
      ...config
    };

    element.addEventListener('click', this.handleClick);
  }

  destroy(): void {
    if (this.element) {
      this.element.removeEventListener('click', this.handleClick);
    }

    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    this.element = undefined;
  }

  private handleClick = (event: Event) => {
    if (!this.element) return;

    if (this.config.preventDefault) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.clickCount++;

    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }

    this.clickTimeout = window.setTimeout(() => {
      const eventType = this.clickCount === 1 ? 'click' : 'double-click';
      this.dispatchClickEvent(eventType, event);
      this.clickCount = 0;
    }, this.config.doubleClickDelay);
  };

  private dispatchClickEvent(type: string, event: Event) {
    if (!this.element) return;

    const rect = this.element.getBoundingClientRect();
    const mouseEvent = event as MouseEvent;
    const coordinates = {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top
    };

    const detail: ChartInteractionEvent = {
      type,
      target: this.element,
      coordinates,
      originalEvent: event
    };

    this.element.dispatchEvent(new CustomEvent(`pp-chart-${type}`, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}

/**
 * Interaction layer manager that handles multiple interactions on chart elements
 */
export class InteractionLayer {
  private interactions = new Map<string, ChartInteraction>();
  private element?: SVGElement | HTMLElement;

  constructor(element?: SVGElement | HTMLElement) {
    this.element = element;
  }

  /**
   * Register a new interaction
   */
  registerGesture(interaction: ChartInteraction, config?: InteractionConfig): void {
    if (!this.element) {
      throw new Error('No element provided to register interactions on');
    }

    // Remove existing interaction of the same type
    this.removeGesture(interaction.type);

    // Register new interaction
    interaction.register(this.element, config);
    this.interactions.set(interaction.type, interaction);
  }

  /**
   * Remove a specific interaction by type
   */
  removeGesture(type: string): void {
    const interaction = this.interactions.get(type);
    if (interaction) {
      interaction.destroy();
      this.interactions.delete(type);
    }
  }

  /**
   * Check if an interaction type is registered
   */
  hasGesture(type: string): boolean {
    return this.interactions.has(type);
  }

  /**
   * Get all registered interaction types
   */
  getGestureTypes(): string[] {
    return Array.from(this.interactions.keys());
  }

  /**
   * Destroy all interactions and clean up
   */
  destroy(): void {
    for (const interaction of this.interactions.values()) {
      interaction.destroy();
    }
    this.interactions.clear();
    this.element = undefined;
  }

  /**
   * Update the target element for all interactions
   */
  setElement(element: SVGElement | HTMLElement): void {
    const currentInteractions = new Map(this.interactions);

    // Destroy all current interactions
    this.destroy();

    // Set new element
    this.element = element;

    // Re-register all interactions with new element
    for (const [, interaction] of currentInteractions) {
      this.registerGesture(interaction);
    }
  }
}

/**
 * Factory function to create common interaction combinations
 */
export function createStandardInteractions(): InteractionLayer {
  const layer = new InteractionLayer();

  // Add basic hover and click interactions by default
  layer.registerGesture(new HoverInteraction());
  layer.registerGesture(new ClickInteraction());

  return layer;
}

/**
 * Helper function to create chart-specific interaction layer
 */
export function createChartInteractionLayer(
  element: SVGElement | HTMLElement,
  interactions: Array<{ type: ChartInteraction; config?: InteractionConfig }> = []
): InteractionLayer {
  const layer = new InteractionLayer(element);

  for (const { type: interaction, config } of interactions) {
    layer.registerGesture(interaction, config);
  }

  return layer;
}