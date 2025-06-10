import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { faker } from '@faker-js/faker';

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