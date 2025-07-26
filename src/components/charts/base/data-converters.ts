/**
 * Pure converter functions for chart data parsing
 * 
 * These functions are kept outside class bodies for simplified typing and easier unit testing.
 * Provides JSON array validation, transformation utilities, and real-time data update helpers.
 */

import type { 
  LineChartData, 
  BarChartData, 
  AreaChartData, 
  TreeData,
  ChartDataPoint
} from './chart-types.js';

import {
  isLineChartData,
  isBarChartData,
  isAreaChartData,
  isTreeData
} from './chart-types.js';

/**
 * Type guard to check if a value is a valid chart data point
 */
export function isChartDataPoint(value: unknown): value is ChartDataPoint {
  return typeof value === 'object' && value !== null;
}

/**
 * Parse JSON string or return the object if already parsed
 */
export function parseChartData<T>(data: string | T): T | null {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
}

/**
 * Convert various input formats to LineChartData
 */
export function convertToLineChartData(input: unknown): LineChartData | null {
  const data = parseChartData(input);
  
  if (isLineChartData(data)) {
    return data;
  }
  
  // Try to convert array of objects to line chart format
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (isChartDataPoint(firstItem) && 'x' in firstItem && 'y' in firstItem) {
      return {
        series: [{
          name: 'Series 1',
          data: data.map(item => ({
            x: item.x as number | string | Date,
            y: item.y as number
          }))
        }]
      };
    }
  }
  
  return null;
}

/**
 * Convert various input formats to BarChartData
 */
export function convertToBarChartData(input: unknown): BarChartData | null {
  const data = parseChartData(input);
  
  if (isBarChartData(data)) {
    return data;
  }
  
  // Try to convert array of objects to bar chart format
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (isChartDataPoint(firstItem) && 'category' in firstItem && 'value' in firstItem) {
      return {
        data: data.map(item => ({
          category: item.category as string,
          value: item.value as number,
          color: item.color as string | undefined
        }))
      };
    }
    
    // Try to convert simple key-value pairs
    if (isChartDataPoint(firstItem)) {
      const keys = Object.keys(firstItem);
      if (keys.length >= 2) {
        const categoryKey = keys[0];
        const valueKey = keys[1];
        return {
          data: data.map(item => ({
            category: String(item[categoryKey]),
            value: Number(item[valueKey]) || 0
          }))
        };
      }
    }
  }
  
  return null;
}

/**
 * Convert various input formats to AreaChartData
 */
export function convertToAreaChartData(input: unknown): AreaChartData | null {
  const data = parseChartData(input);
  
  if (isAreaChartData(data)) {
    return data;
  }
  
  // Try to convert array of objects to area chart format
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (isChartDataPoint(firstItem) && 'x' in firstItem && 'y' in firstItem) {
      return {
        series: [{
          name: 'Series 1',
          data: data.map(item => ({
            x: item.x as number | string | Date,
            y: item.y as number,
            y0: item.y0 as number | undefined
          }))
        }]
      };
    }
  }
  
  return null;
}

/**
 * Convert various input formats to TreeData
 */
export function convertToTreeData(input: unknown): TreeData | null {
  const data = parseChartData(input);
  
  if (isTreeData(data)) {
    return data;
  }
  
  // Try to convert simple nested object structure
  if (isChartDataPoint(data) && 'id' in data && 'name' in data) {
    return {
      root: data as TreeData['root']
    };
  }
  
  return null;
}

/**
 * Validate that data contains required fields for chart type
 */
export function validateChartData(data: unknown, type: 'line' | 'bar' | 'area' | 'tree'): boolean {
  switch (type) {
    case 'line':
      return convertToLineChartData(data) !== null;
    case 'bar':
      return convertToBarChartData(data) !== null;
    case 'area':
      return convertToAreaChartData(data) !== null;
    case 'tree':
      return convertToTreeData(data) !== null;
    default:
      return false;
  }
}

/**
 * Helper for real-time data updates - merges new data with existing
 */
export function mergeChartData<T extends LineChartData | BarChartData | AreaChartData>(
  existing: T,
  newData: Partial<T>
): T {
  return {
    ...existing,
    ...newData
  };
}

/**
 * Transform data for different chart orientations or groupings
 */
export function transformBarChartData(
  data: BarChartData,
  options: {
    orientation?: 'vertical' | 'horizontal';
    sort?: 'asc' | 'desc' | 'none';
  } = {}
): BarChartData {
  let transformedData = { ...data };
  
  // Sort data if requested
  if (options.sort && options.sort !== 'none') {
    const sortedData = [...data.data].sort((a, b) => {
      const comparison = a.value - b.value;
      return options.sort === 'asc' ? comparison : -comparison;
    });
    transformedData.data = sortedData;
  }
  
  // Set orientation
  if (options.orientation) {
    transformedData.orientation = options.orientation;
  }
  
  return transformedData;
}

/**
 * Extract data extent (min/max) for scaling
 */
export function getDataExtent(data: ChartDataPoint[], key: string): [number, number] {
  const values = data
    .map(d => d[key])
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  
  if (values.length === 0) {
    return [0, 1];
  }
  
  return [Math.min(...values), Math.max(...values)];
}

/**
 * Get unique categories from categorical data
 */
export function getCategories(data: ChartDataPoint[], key: string): string[] {
  const categories = data
    .map(d => String(d[key]))
    .filter((v, i, arr) => arr.indexOf(v) === i);
  
  return categories;
}