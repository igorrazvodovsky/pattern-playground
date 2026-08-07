import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { faker } from '@faker-js/faker';
import { transactions } from '@shared/data';
import { formatCurrency, formatDate } from '@shared/format';
// The pp-bar-chart JSX typing lives in src/jsx-types.ts.
import "../components/charts/bar-chart.js";
import type { BarChart } from "../components/charts/bar-chart.js";
import type { BarChartData } from "../components/charts/base/chart-types.js";

const rows = transactions.slice(0, 10);

const meta = {
  title: "Components/Table",
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
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--success">Completed</span></td>
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--success">Completed</span></td>
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge">Waiting</span></td>
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge badge--warning">Cancelled</span></td>
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
          </tr>
          <tr>
            <td className="pp-table-align-right">{faker.commerce.price()}</td>
            <td className="pp-table-ellipsis">
              {faker.lorem.paragraph()}
            </td>
            <td><span className="badge">Waiting</span></td>
            <td className="pp-table-align-right">{formatDate(faker.date.anytime())}</td>
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
    value: rows.filter(t => t.amount >= range.min && t.amount < range.max).length,
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
  const statusCounts = rows.reduce((acc, t) => {
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
  const categoryCounts = rows.reduce((acc, t) => {
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
  const monthCounts = rows.reduce((acc, t) => {
    const month = formatDate(t.date, { year: 'numeric', month: 'short' });
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
  const chartRef = useRef<BarChart | null>(null);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.data = data;
      chartElement.orientation = 'vertical';
      chartElement['show-axes'] = false;
      chartElement['show-grid'] = false;
      chartElement['show-legend'] = false;
      chartElement['animate-chart'] = true;
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
          {rows.map((transaction) => (
            <tr key={transaction.id}>
              <td className="pp-table-align-right">
                {formatCurrency(transaction.amount, 'GBP')}
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
                {formatDate(transaction.date)}
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

