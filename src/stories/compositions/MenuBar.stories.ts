import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Menu bar",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => html`
    <nav class="navigation">
      <h1 class="logo">Acme</h1>

      <div class="navigation__menu">
        <button is="ir-button" aria-expanded="false" aria-controls="#menu">
          <iconify-icon class="icon" icon="ph:list"></iconify-icon>
          <span class="inclusively-hidden">Menu</span>
        </button>

        <ul id="menu" role="list">
          <li>${faker.word.words()}</li>
          <li>${faker.word.words()}</li>
          <li>${faker.word.words()}</li>
          <li>${faker.word.words()}</li>
          <li>${faker.word.words()}</li>
        </ul>
      </div>

      <div class="navigation__actions">
        <button is="ir-button">Login</button>
        <button is="ir-button">Sign up</button>
      </div>
    </nav>
  `,
};
