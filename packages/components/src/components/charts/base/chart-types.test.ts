import { describe, it, expect } from 'vitest';
import {
  isLineChartData,
  isBarChartData,
  isScatterPlotData,
  isAreaChartData,
  isChoroplethData,
  isNetworkGraphData,
  isTreeData,
} from './chart-types.js';

// Each guard is the acceptance check its own chart component runs against
// `this.data` before deciding it has something to draw — see `hasData()` in
// bar-chart.ts, scatter-plot.ts and choropleth.ts. So what matters is that a
// guard accepts the shape its component can render and rejects everything the
// component would choke on. They are deliberately *not* a discriminated union:
// line and area both key on `series`, bar and scatter both key on `data`.

const nonObjects = [null, undefined, 'series', 42, true, Symbol('x')];

describe('isLineChartData', () => {
  it('accepts a series array, empty or populated', () => {
    expect(isLineChartData({ series: [] })).toBe(true);
    expect(
      isLineChartData({ series: [{ name: 'a', data: [{ x: 0, y: 1 }] }] })
    ).toBe(true);
  });

  it('rejects a missing or non-array series', () => {
    expect(isLineChartData({})).toBe(false);
    expect(isLineChartData({ series: { name: 'a' } })).toBe(false);
    expect(isLineChartData({ data: [] })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isLineChartData(value)).toBe(false);
  });
});

describe('isBarChartData', () => {
  it('accepts a data array, empty or populated', () => {
    expect(isBarChartData({ data: [] })).toBe(true);
    expect(isBarChartData({ data: [{ category: 'a', value: 1 }] })).toBe(true);
  });

  it('rejects a missing or non-array data', () => {
    expect(isBarChartData({})).toBe(false);
    expect(isBarChartData({ data: 'a,b' })).toBe(false);
    expect(isBarChartData({ series: [] })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isBarChartData(value)).toBe(false);
  });
});

describe('isScatterPlotData', () => {
  it('accepts points carrying numeric x and y', () => {
    expect(isScatterPlotData({ data: [{ x: 1, y: 2 }] })).toBe(true);
    expect(isScatterPlotData({ data: [{ x: 1, y: 2, size: 8 }] })).toBe(true);
  });

  it('accepts an empty data array, which has no point to inspect', () => {
    expect(isScatterPlotData({ data: [] })).toBe(true);
  });

  it('rejects bar points, which key on category and value', () => {
    expect(isScatterPlotData({ data: [{ category: 'a', value: 1 }] })).toBe(false);
  });

  it('rejects points whose x or y is non-numeric', () => {
    expect(isScatterPlotData({ data: [{ x: '2026-01-01', y: 2 }] })).toBe(false);
    expect(isScatterPlotData({ data: [{ x: 1, y: '2' }] })).toBe(false);
  });

  it('rejects a missing or non-array data', () => {
    expect(isScatterPlotData({})).toBe(false);
    expect(isScatterPlotData({ series: [] })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isScatterPlotData(value)).toBe(false);
  });
});

describe('isAreaChartData', () => {
  it('accepts a series array', () => {
    expect(isAreaChartData({ series: [] })).toBe(true);
    expect(
      isAreaChartData({ series: [{ name: 'a', data: [{ x: 0, y: 1, y0: 0 }] }] })
    ).toBe(true);
  });

  it('rejects a missing or non-array series', () => {
    expect(isAreaChartData({})).toBe(false);
    expect(isAreaChartData({ data: [] })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isAreaChartData(value)).toBe(false);
  });
});

describe('isChoroplethData', () => {
  const geometry = { type: 'FeatureCollection', features: [] };

  it('accepts geometry with a features array alongside values', () => {
    expect(isChoroplethData({ geometry, values: [] })).toBe(true);
    expect(
      isChoroplethData({ geometry, values: [{ id: 'SE', value: 3 }] })
    ).toBe(true);
  });

  it('rejects geometry that carries no features array', () => {
    expect(isChoroplethData({ geometry: {}, values: [] })).toBe(false);
    expect(
      isChoroplethData({ geometry: { type: 'FeatureCollection' }, values: [] })
    ).toBe(false);
    expect(isChoroplethData({ geometry: null, values: [] })).toBe(false);
  });

  it('rejects either half arriving without the other', () => {
    expect(isChoroplethData({ geometry })).toBe(false);
    expect(isChoroplethData({ values: [] })).toBe(false);
  });

  it('rejects non-array values', () => {
    expect(isChoroplethData({ geometry, values: { SE: 3 } })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isChoroplethData(value)).toBe(false);
  });
});

describe('isNetworkGraphData', () => {
  const node = (id: string) => ({ id, label: id.toUpperCase() });

  it('accepts nodes and edges together', () => {
    expect(
      isNetworkGraphData({ nodes: [node('a'), node('b')], edges: [{ source: 'a', target: 'b' }] })
    ).toBe(true);
  });

  it('accepts an empty graph, which has no node to inspect', () => {
    expect(isNetworkGraphData({ nodes: [], edges: [] })).toBe(true);
  });

  it('rejects either half arriving without the other', () => {
    expect(isNetworkGraphData({ nodes: [node('a')] })).toBe(false);
    expect(isNetworkGraphData({ edges: [] })).toBe(false);
  });

  it('rejects nodes that carry no id and label, the pair every node is drawn by', () => {
    expect(isNetworkGraphData({ nodes: [{ id: 'a' }], edges: [] })).toBe(false);
    expect(isNetworkGraphData({ nodes: [{ label: 'A' }], edges: [] })).toBe(false);
    expect(isNetworkGraphData({ nodes: [{ id: 1, label: 'A' }], edges: [] })).toBe(false);
  });

  it('rejects non-array nodes or edges', () => {
    expect(isNetworkGraphData({ nodes: {}, edges: [] })).toBe(false);
    expect(isNetworkGraphData({ nodes: [], edges: 'none' })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isNetworkGraphData(value)).toBe(false);
  });
});

describe('isTreeData', () => {
  it('accepts an object root', () => {
    expect(isTreeData({ root: { id: 'a', name: 'A' } })).toBe(true);
  });

  it('rejects a missing or non-object root', () => {
    expect(isTreeData({})).toBe(false);
    expect(isTreeData({ root: 'a' })).toBe(false);
  });

  it('rejects non-objects', () => {
    for (const value of nonObjects) expect(isTreeData(value)).toBe(false);
  });
});
