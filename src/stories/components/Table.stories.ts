import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Components/Table",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const SimpleTable: Story = {
  args: {},
  render: () => html`
    <pp-table>
      <table>
        <thead>
          <tr>
            <th class="pp-table-align-right">Amount</th>
            <th>Description</th>
            <th>Method</th>
            <th class="pp-table-align-right">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="pp-table-align-right">${faker.commerce.price()}</td>
            <td class="pp-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="pp-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </pp-table>
  `,
};

//