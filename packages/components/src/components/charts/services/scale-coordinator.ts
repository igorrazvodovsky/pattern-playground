/**
 * Scale Coordination Service
 * Manages scale sharing and coordination between chart primitives (axis, grid, etc.).
 * Ensures that all components use consistent scales and can communicate tick positions.
 */

import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { AxisDomain } from 'd3-axis';

/**
 * Types of scales supported by the coordination system
 */
export type ChartScale = ScaleBand<string> | ScaleLinear<number, number>;

/**
 * Scale information with metadata for coordination
 */
export interface ScaleInfo {
  scale: ChartScale;
  type: 'band' | 'linear';
  domain: AxisDomain[];
  range: [number, number];
  axis: 'x' | 'y';
}

/**
 * Scale update event data
 */
export interface ScaleUpdateEvent {
  axis: 'x' | 'y';
  scale: ChartScale;
  ticks?: AxisDomain[];
}

/**
 * Tick information for grid coordination
 */
export interface TickInfo {
  value: AxisDomain;
  position: number;
}

/**
 * Interface for components that consume coordinated scales
 */
export interface ScaleConsumer {
  updateScale(axis: 'x' | 'y', scale: ChartScale): void;
  updateTicks?(axis: 'x' | 'y', ticks: TickInfo[]): void;
}

/**
 * Scale Coordinator class
 * Manages scale distribution and coordination between chart components
 */
export class ScaleCoordinator {
  private xScale: ChartScale | null = null;
  private yScale: ChartScale | null = null;
  private consumers: Set<ScaleConsumer> = new Set();
  private tickCache: Map<'x' | 'y', TickInfo[]> = new Map();

  /**
   * Register a component to receive scale updates
   */
  registerConsumer(consumer: ScaleConsumer): void {
    this.consumers.add(consumer);

    // Immediately update with current scales if available
    if (this.xScale) {
      consumer.updateScale('x', this.xScale);
      const xTicks = this.tickCache.get('x');
      if (xTicks && consumer.updateTicks) {
        consumer.updateTicks('x', xTicks);
      }
    }

    if (this.yScale) {
      consumer.updateScale('y', this.yScale);
      const yTicks = this.tickCache.get('y');
      if (yTicks && consumer.updateTicks) {
        consumer.updateTicks('y', yTicks);
      }
    }
  }

  /**
   * Unregister a component from scale updates
   */
  unregisterConsumer(consumer: ScaleConsumer): void {
    this.consumers.delete(consumer);
  }

  /**
   * Update a scale and notify all consumers
   */
  updateScale(axis: 'x' | 'y', scale: ChartScale): void {
    try {
      if (!scale) {
        console.warn(`Scale coordinator: Attempted to set null scale for ${axis} axis`);
        return;
      }

      if (axis === 'x') {
        this.xScale = scale;
      } else {
        this.yScale = scale;
      }

      // Notify all consumers of the scale update
      this.consumers.forEach(consumer => {
        try {
          consumer.updateScale(axis, scale);
        } catch (error) {
          console.error(`Scale coordinator: Error updating consumer for ${axis} axis:`, error);
        }
      });

      // Generate and cache tick information
      this.updateTickInfo(axis, scale);
    } catch (error) {
      console.error(`Scale coordinator: Error updating ${axis} scale:`, error);
    }
  }

  /**
   * Get the current scale for an axis
   */
  getScale(axis: 'x' | 'y'): ChartScale | null {
    return axis === 'x' ? this.xScale : this.yScale;
  }

  /**
   * Update tick information for grid coordination
   */
  updateTicks(axis: 'x' | 'y', ticks: TickInfo[]): void {
    this.tickCache.set(axis, ticks);

    // Notify consumers that support tick updates
    this.consumers.forEach(consumer => {
      if (consumer.updateTicks) {
        consumer.updateTicks(axis, ticks);
      }
    });
  }

  /**
   * Generate tick information from a scale
   */
  private updateTickInfo(axis: 'x' | 'y', scale: ChartScale): void {
    try {
      const ticks: TickInfo[] = [];

      if ('bandwidth' in scale) {
        // Band scale - ticks at each band position
        const domain = scale.domain();
        if (!Array.isArray(domain)) {
          console.warn(`Scale coordinator: Invalid domain for band scale on ${axis} axis`);
          return;
        }

        domain.forEach(value => {
          try {
            const position = scale(value);
            if (position !== undefined) {
              ticks.push({ value, position: position + scale.bandwidth() / 2 });
            }
          } catch (error) {
            console.warn(`Scale coordinator: Error getting position for value '${value}' on ${axis} axis:`, error);
          }
        });
      } else {
        // Linear scale - use scale.ticks() for optimal tick positions
        try {
          const tickValues = scale.ticks ? scale.ticks(5) : [];
          tickValues.forEach(value => {
            try {
              const position = scale(value);
              if (position !== undefined) {
                ticks.push({ value, position });
              }
            } catch (error) {
              console.warn(`Scale coordinator: Error getting position for tick value ${value} on ${axis} axis:`, error);
            }
          });
        } catch (error) {
          console.warn(`Scale coordinator: Error generating ticks for ${axis} axis:`, error);
        }
      }

      this.updateTicks(axis, ticks);
    } catch (error) {
      console.error(`Scale coordinator: Error updating tick info for ${axis} axis:`, error);
    }
  }

  /**
   * Get scale information with metadata
   */
  getScaleInfo(axis: 'x' | 'y'): ScaleInfo | null {
    const scale = this.getScale(axis);
    if (!scale) return null;

    const type = 'bandwidth' in scale ? 'band' : 'linear';
    const domain = scale.domain();
    const range = scale.range() as [number, number];

    return {
      scale,
      type,
      domain,
      range,
      axis
    };
  }

  /**
   * Get cached tick information
   */
  getTicks(axis: 'x' | 'y'): TickInfo[] {
    return this.tickCache.get(axis) || [];
  }

  /**
   * Clear all scales and consumers
   */
  destroy(): void {
    this.consumers.clear();
    this.tickCache.clear();
    this.xScale = null;
    this.yScale = null;
  }

  /**
   * Utility to check if a scale is a band scale
   */
  static isBandScale(scale: ChartScale): scale is ScaleBand<string> {
    return 'bandwidth' in scale;
  }

  /**
   * Utility to check if a scale is a linear scale
   */
  static isLinearScale(scale: ChartScale): scale is ScaleLinear<number, number> {
    return 'ticks' in scale && !('bandwidth' in scale);
  }
}

/**
 * Factory function to create a scale coordinator
 */
export function createScaleCoordinator(): ScaleCoordinator {
  return new ScaleCoordinator();
}