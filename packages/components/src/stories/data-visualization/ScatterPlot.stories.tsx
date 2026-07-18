import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';

// Import the scatter plot component (this registers the custom element)
import "../../components/charts/scatter-plot.js";
import type { ScatterPlotData } from "../../components/charts/base/chart-types.js";

interface ScatterPlotElement extends HTMLElement {
  data: ScatterPlotData;
  showAxes: boolean;
  showGrid: boolean;
  showSize: boolean;
  pointRadius: number;
  title: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-scatter-plot': React.DetailedHTMLProps<React.HTMLAttributes<ScatterPlotElement>, ScatterPlotElement>;
    }
  }
}

// A cloud with a clear positive association plus scatter — the archetypal case.
const correlationData: ScatterPlotData = {
  data: [
    { x: 12, y: 18, label: 'A' }, { x: 15, y: 22, label: 'B' },
    { x: 18, y: 20, label: 'C' }, { x: 21, y: 28, label: 'D' },
    { x: 24, y: 25, label: 'E' }, { x: 27, y: 33, label: 'F' },
    { x: 30, y: 31, label: 'G' }, { x: 33, y: 38, label: 'H' },
    { x: 36, y: 35, label: 'I' }, { x: 39, y: 44, label: 'J' },
    { x: 42, y: 41, label: 'K' }, { x: 45, y: 49, label: 'L' },
    { x: 48, y: 46, label: 'M' }, { x: 51, y: 55, label: 'N' },
    { x: 54, y: 52, label: 'O' }, { x: 57, y: 61, label: 'P' },
    { x: 20, y: 40, label: 'Outlier' }, { x: 50, y: 20, label: 'Outlier 2' }
  ],
  xAxisLabel: 'Input',
  yAxisLabel: 'Output'
};

// Two categories that separate into distinguishable clusters.
const categoricalData: ScatterPlotData = {
  data: [
    { x: 14, y: 42, category: 'Group A' }, { x: 18, y: 48, category: 'Group A' },
    { x: 16, y: 39, category: 'Group A' }, { x: 22, y: 51, category: 'Group A' },
    { x: 20, y: 45, category: 'Group A' }, { x: 25, y: 54, category: 'Group A' },
    { x: 42, y: 20, category: 'Group B' }, { x: 46, y: 26, category: 'Group B' },
    { x: 44, y: 17, category: 'Group B' }, { x: 50, y: 29, category: 'Group B' },
    { x: 48, y: 23, category: 'Group B' }, { x: 53, y: 32, category: 'Group B' }
  ]
};

// A third quantitative variable carried on bubble area.
const bubbleData: ScatterPlotData = {
  data: [
    { x: 20, y: 30, size: 8, label: 'Small' },
    { x: 35, y: 55, size: 42, label: 'Medium' },
    { x: 50, y: 40, size: 120, label: 'Large' },
    { x: 65, y: 70, size: 65, label: 'Big' },
    { x: 28, y: 62, size: 25, label: 'Modest' },
    { x: 72, y: 35, size: 90, label: 'Wide' },
    { x: 45, y: 22, size: 15, label: 'Tiny-ish' }
  ]
};

interface ScatterPlotWrapperProps {
  data: ScatterPlotData;
  showAxes?: boolean;
  showGrid?: boolean;
  showSize?: boolean;
  pointRadius?: number;
  title?: string;
}

function ScatterPlotWrapper({
  data,
  showAxes = true,
  showGrid = false,
  showSize = false,
  pointRadius = 5,
  title = ''
}: ScatterPlotWrapperProps) {
  const chartRef = useRef<ScatterPlotElement | null>(null);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.data = data;
      chartElement.showAxes = showAxes;
      chartElement.showGrid = showGrid;
      chartElement.showSize = showSize;
      chartElement.pointRadius = pointRadius;
      chartElement.title = title;

      const handlePointHover = (e: CustomEvent) => {
        action('pp-point-hover')(e.detail.data);
      };
      const handlePointClick = (e: CustomEvent) => {
        action('pp-point-click')(e.detail.data);
      };

      chartElement.addEventListener('pp-point-hover', handlePointHover as EventListener);
      chartElement.addEventListener('pp-point-click', handlePointClick as EventListener);

      return () => {
        chartElement.removeEventListener('pp-point-hover', handlePointHover as EventListener);
        chartElement.removeEventListener('pp-point-click', handlePointClick as EventListener);
      };
    }
  }, [data, showAxes, showGrid, showSize, pointRadius, title]);

  return (
    <pp-scatter-plot ref={chartRef} />
  );
}

const meta = {
  title: "Data visualisation/Scatter plot",
  component: ScatterPlotWrapper,
  argTypes: {
    showAxes: {
      control: { type: 'boolean' },
      description: 'Show x and y axes'
    },
    showGrid: {
      control: { type: 'boolean' },
      description: 'Show grid lines'
    },
    showSize: {
      control: { type: 'boolean' },
      description: 'Encode a third variable as bubble area (needs `size` on points)'
    },
    pointRadius: {
      control: { type: 'range', min: 2, max: 12, step: 1 },
      description: 'Radius of points when size encoding is off'
    }
  }
} satisfies Meta<ScatterPlotWrapperProps>;

export default meta;
type Story = StoryObj<ScatterPlotWrapperProps>;

export const Default: Story = {
  args: {
    data: correlationData,
    showAxes: true,
    showGrid: true,
    title: 'Output against input',
  }
};

export const Categories: Story = {
  args: {
    data: categoricalData,
    showAxes: true,
    showGrid: false,
    title: 'Two groups',
  }
};

export const Bubble: Story = {
  args: {
    data: bubbleData,
    showAxes: true,
    showGrid: true,
    showSize: true,
    title: 'Bubble — size on area',
  }
};

export const Minimal: Story = {
  args: {
    data: correlationData,
    showAxes: false,
    showGrid: false,
    title: 'Minimal',
  }
};
