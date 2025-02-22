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
    <ir-table>
      <table>
        <thead>
          <tr>
            <th class="ir-table-align-right">Amount</th>
            <th>Description</th>
            <th>Method</th>
            <th class="ir-table-align-right">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td class="ir-table-align-right">${faker.commerce.price()}</td>
            <td class="ir-table-ellipsis">
              ${faker.lorem.paragraph()}
            </td>
            <td>Card</td>
            <td class="ir-table-align-right">${faker.date.anytime().toLocaleDateString()}</td>
          </tr>
        </tbody>
      </table>
    </ir-table>
  `,
};

//