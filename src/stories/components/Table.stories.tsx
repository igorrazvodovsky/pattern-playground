import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect, useRef } from "react";
import { faker } from '@faker-js/faker';
import { transactions } from '../shared-data/index.js';
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
  margin: { top: number; right: number; bottom: number; left: number };
}

// Extend the JSX IntrinsicElements to include our custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pp-bar-chart': React.DetailedHTMLProps<React.HTMLAttributes<BarChartElement>, BarChartElement>;
    }
  }
}

const meta = {
  title: "Components/Table",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SimpleTable: Story = {
  args: {},
  render: () => (
    <pp-table>
      <table>
        <thead>
          <tr>
            <th className="pp-table-align-right">Amount</th>
            <th>Description</th>
            <th>Status</th>
            <th className="pp-table-align-right">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--success">Completed</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--success">Completed</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--success">Completed</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge">Waiting</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--warning">Cancelled</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge">Waiting</span></td>
            <td className="pp-table-align-right">{faker.date.anytime().toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </pp-table>
  ),
};

// Helper functions to generate column summary data
const generateAmountSummary = (): BarChartData => {
  const ranges = [
    { label: '0-100', min: 0, max: 100 },
    { label: '100-500', min: 100, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000+', min: 1000, max: Infinity }
  ];

  const rangeCounts = ranges.map(range => ({
    category: range.label,
    value: transactions.filter(t => t.amount >= range.min && t.amount < range.max).length,
    color: range.label === '0-100' ? '#10b981' :
           range.label === '100-500' ? '#3b82f6' :
           range.label === '500-1000' ? '#f59e0b' : '#ef4444'
  }));

  return {
    data: rangeCounts,
    xAxisLabel: 'Amount Range',
    yAxisLabel: 'Count'
  };
};

const generateStatusSummary = (): BarChartData => {
  const statusCounts = transactions.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    data: Object.entries(statusCounts).map(([status, count]) => ({
      category: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: status === 'completed' ? '#10b981' :
             status === 'pending' ? '#f59e0b' : '#ef4444'
    })),
    xAxisLabel: 'Status',
    yAxisLabel: 'Count'
  };
};

const generateCategorySummary = (): BarChartData => {
  const categoryCounts = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    data: Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      value: count
    })),
    xAxisLabel: 'Category',
    yAxisLabel: 'Count'
  };
};

const generateDateSummary = (): BarChartData => {
  const monthCounts = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    data: Object.entries(monthCounts).map(([month, count]) => ({
      category: month,
      value: count
    })),
    xAxisLabel: 'Month',
    yAxisLabel: 'Count'
  };
};

// Component for mini bar chart in table headers
interface MiniBarChartProps {
  data: BarChartData;
}

function MiniBarChart({ data }: MiniBarChartProps) {
  const chartRef = useRef<BarChartElement | null>(null);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.data = data;
      chartElement.orientation = 'vertical';
      chartElement.showAxes = false;
      chartElement.showGrid = false;
      chartElement.showLegend = false;
      chartElement.animate = true;
      chartElement.sort = 'none';
    }
  }, [data]);

  return (
    <pp-bar-chart ref={chartRef} />
  );
}

export const WithColumnSummaries: Story = {
  args: {},
  render: () => (
    <pp-table>
      <table>
        <thead>
          <tr>
            <th className="pp-table-align-right">
              <MiniBarChart
                data={generateAmountSummary()}
              />
              Amount
            </th>
            <th>
              <MiniBarChart
                data={generateStatusSummary()}
              />
              Status
            </th>
            <th>
              <MiniBarChart
                data={generateCategorySummary()}
              />
              Category
            </th>
            <th className="pp-table-align-right">
              <MiniBarChart
                data={generateDateSummary()}
              />
              Date
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="pp-table-align-right">
                ${transaction.amount.toFixed(2)}
              </td>
              <td>
                <span className={`badge ${
                  transaction.status === 'completed' ? 'badge--success' :
                  transaction.status === 'pending' ? '' : 'badge--warning'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </td>
              <td>{transaction.category}</td>
              <td className="pp-table-align-right">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="pp-table-ellipsis">
                {transaction.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  ),
};

