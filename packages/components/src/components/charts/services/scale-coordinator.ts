/**
 * Scale Coordination Service
 * Manages scale sharing and coordination between chart primitives (axis, grid, etc.).
 * Ensures that all components use consistent scales and can communicate tick positions.
 */

import type { ScaleBand, ScaleLinear } from 'd3-scale';
import type { AxisDomain } from 'd3-axis';

export type ChartScale = ScaleBand<string> | ScaleLinear<number, number>;

export interface ScaleInfo {
  scale: ChartScale;
  type: 'band' | 'linear';
  domain: AxisDomain[];
  range: [number, number];
  axis: 'x' | 'y';
}

export interface ScaleUpdateEvent {
  axis: 'x' | 'y';
  scale: ChartScale;
  ticks?: AxisDomain[];
}

export interface TickInfo {
  value: AxisDomain;
  position: number;
}

export interface ScaleConsumer {
  updateScale(axis: 'x' | 'y', scale: ChartScale): void;
  updateTicks?(axis: 'x' | 'y', ticks: TickInfo[]): void;
}

export class ScaleCoordinator {
  private xScale: ChartScale | null = null;
  private yScale: ChartScale | null = null;
  private consumers: Set<ScaleConsumer> = new Set();
  private tickCache: Map<'x' | 'y', TickInfo[]> = new Map();

  /** New consumers are immediately replayed the current scales and ticks. */
  registerConsumer(consumer: ScaleConsumer): void {
    this.consumers.add(consumer);

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

  unregisterConsumer(consumer: ScaleConsumer): void {
    this.consumers.delete(consumer);
  }

  /** Store a scale and notify every consumer, then regenerate its ticks. */
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

      this.consumers.forEach(consumer => {
        try {
          consumer.updateScale(axis, scale);
        } catch (error) {
          console.error(`Scale coordinator: Error updating consumer for ${axis} axis:`, error);
        }
      });

      this.updateTickInfo(axis, scale);
    } catch (error) {
      console.error(`Scale coordinator: Error updating ${axis} scale:`, error);
    }
  }

  getScale(axis: 'x' | 'y'): ChartScale | null {
    return axis === 'x' ? this.xScale : this.yScale;
  }

  updateTicks(axis: 'x' | 'y', ticks: TickInfo[]): void {
    this.tickCache.set(axis, ticks);

    this.consumers.forEach(consumer => {
      if (consumer.updateTicks) {
        consumer.updateTicks(axis, ticks);
      }
    });
  }

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

  getTicks(axis: 'x' | 'y'): TickInfo[] {
    return this.tickCache.get(axis) || [];
  }

  destroy(): void {
    this.consumers.clear();
    this.tickCache.clear();
    this.xScale = null;
    this.yScale = null;
  }

  static isBandScale(scale: ChartScale): scale is ScaleBand<string> {
    return 'bandwidth' in scale;
  }

  static isLinearScale(scale: ChartScale): scale is ScaleLinear<number, number> {
    return 'ticks' in scale && !('bandwidth' in scale);
  }
}

export function createScaleCoordinator(): ScaleCoordinator {
  return new ScaleCoordinator();
}