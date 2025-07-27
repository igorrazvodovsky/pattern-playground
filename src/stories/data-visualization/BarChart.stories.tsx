import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";

// Import the bar chart component (this will register the custom element)
import "../../components/charts/bar-chart.js";
import type { BarChartData } from "../../components/charts/base/chart-types.js";

// Type definition for the pp-bar-chart custom element
interface BarChartElement extends HTMLElement {
  data: BarChartData;
  orientation: 'vertical' | 'horizontal';
  showAxes: boolean;
  showGrid: boolean;
  showLegend: boolean;
  animate: boolean;
  title: string;
  sort: 'asc' | 'desc' | 'none';
}

// Extend the JSX IntrinsicElements to include our custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-bar-chart': React.DetailedHTMLProps<React.HTMLAttributes<BarChartElement>, BarChartElement>;
    }
  }
}

// Sample data for testing
const sampleProductData: BarChartData = {
  data: [
    { category: 'Product A', value: 120, color: '#3b82f6' },
    { category: 'Product B', value: 85, color: '#ef4444' },
    { category: 'Product C', value: 150, color: '#10b981' },
    { category: 'Product D', value: 95, color: '#f59e0b' },
    { category: 'Product E', value: 175, color: '#8b5cf6' }
  ],
  xAxisLabel: 'Products',
  yAxisLabel: 'Sales'
};

const quarterlyData: BarChartData = {
  data: [
    { category: 'Q1 2024', value: 85 },
    { category: 'Q2 2024', value: 120 },
    { category: 'Q3 2024', value: 95 },
    { category: 'Q4 2024', value: 140 }
  ],
  orientation: 'horizontal'
};

const largeDataset: BarChartData = {
  data: [
    { category: 'Jan', value: 45 },
    { category: 'Feb', value: 67 },
    { category: 'Mar', value: 89 },
    { category: 'Apr', value: 123 },
    { category: 'May', value: 156 },
    { category: 'Jun', value: 134 },
    { category: 'Jul', value: 178 },
    { category: 'Aug', value: 145 },
    { category: 'Sep', value: 167 },
    { category: 'Oct', value: 189 },
    { category: 'Nov', value: 198 },
    { category: 'Dec', value: 201 }
  ]
};

interface BarChartWrapperProps {
  data: BarChartData;
  orientation?: 'vertical' | 'horizontal';
  showAxes?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  title?: string;
  sort?: 'asc' | 'desc' | 'none';
  height?: number;
}

function BarChartWrapper({
  data,
  orientation = 'vertical',
  showAxes = true,
  showGrid = false,
  showLegend = false,
  animate = true,
  title = '',
  sort = 'none',
  height = 400
}: BarChartWrapperProps) {
  const chartRef = useRef<BarChartElement | null>(null);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      // Set properties on the custom element
      chartElement.data = data;
      chartElement.orientation = orientation;
      chartElement.showAxes = showAxes;
      chartElement.showGrid = showGrid;
      chartElement.showLegend = showLegend;
      chartElement.animate = animate;
      chartElement.title = title;
      chartElement.sort = sort;

      // Add event listeners for interaction demonstration
      const handleBarHover = (e: CustomEvent) => {
        console.log('Bar hovered:', e.detail.data);
      };

      const handleBarClick = (e: CustomEvent) => {
        console.log('Bar clicked:', e.detail.data);
      };

      chartElement.addEventListener('pp-bar-hover', handleBarHover as EventListener);
      chartElement.addEventListener('pp-bar-click', handleBarClick as EventListener);

      return () => {
        chartElement.removeEventListener('pp-bar-hover', handleBarHover as EventListener);
        chartElement.removeEventListener('pp-bar-click', handleBarClick as EventListener);
      };
    }
  }, [data, orientation, showAxes, showGrid, showLegend, animate, title, sort]);

  return (
    <pp-bar-chart
      ref={chartRef}
      style={{
        width: '100%',
        height: `${height}px`,
        border: '1px solid var(--c-border)',
        borderRadius: '8px'
      }}
    />
  );
}

const meta = {
  title: "Data visualization*/Bar chart",
  component: BarChartWrapper,
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['vertical', 'horizontal'],
      description: 'Chart orientation'
    },
    showAxes: {
      control: { type: 'boolean' },
      description: 'Show x and y axes'
    },
    showGrid: {
      control: { type: 'boolean' },
      description: 'Show grid lines'
    },
    showLegend: {
      control: { type: 'boolean' },
      description: 'Show legend (future feature)'
    },
    animate: {
      control: { type: 'boolean' },
      description: 'Enable animations'
    },
    sort: {
      control: { type: 'radio' },
      options: ['none', 'asc', 'desc'],
      description: 'Sort bars by value'
    },
    height: {
      control: { type: 'range', min: 200, max: 600, step: 50 },
      description: 'Chart height in pixels'
    }
  }
} satisfies Meta<BarChartWrapperProps>;

export default meta;
type Story = StoryObj<BarChartWrapperProps>;

export const Default: Story = {
  args: {
    data: sampleProductData,
    orientation: 'vertical',
    showAxes: true,
    showGrid: false,
    animate: true,
    title: 'Product Sales Data',
    height: 400
  }
};

export const LargeDataset: Story = {
  args: {
    data: largeDataset,
    orientation: 'vertical',
    showAxes: true,
    showGrid: true,
    animate: true,
    title: 'Monthly Sales Data',
    height: 450
  }
};

export const Minimal: Story = {
  args: {
    data: {
      data: [
        { category: 'A', value: 30 },
        { category: 'B', value: 45 },
        { category: 'C', value: 25 }
      ]
    },
    orientation: 'vertical',
    showAxes: false,
    showGrid: false,
    animate: true,
    title: 'Minimal Chart',
    height: 200
  }
};