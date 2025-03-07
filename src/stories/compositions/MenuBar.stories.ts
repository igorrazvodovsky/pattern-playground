import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Nav bar 🚧",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const MenuBar: Story = {
  args: {},
  render: () => html`
    <nav class="navigation">
      <h1 class="logo">${faker.company.name()}</h1>

      <pp-p-plus>
        <div>
          <button class="button--plain" is="pp-buton">${faker.company.buzzNoun()}</button>
          <button class="button--plain" is="pp-buton">${faker.company.buzzNoun()}</button>
          <button class="button--plain" is="pp-buton">${faker.company.buzzNoun()}</button>
          <button class="button--plain" is="pp-buton">${faker.company.buzzNoun()}</button>
          <button class="button--plain" is="pp-buton">${faker.company.buzzNoun()}</button>
        </div>
      </pp-p-plus>

      <div class="navigation__actions">
        <button is="pp-buton">Login</button>
        <button is="pp-buton">Sign up</button>
      </div>
    </nav>
  `,
};
