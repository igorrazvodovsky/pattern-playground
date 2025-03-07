import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';
import { icons } from "../icons.ts";

function randomIcon() { return 'ph:' + icons[icons.length * Math.random() << 0].name }

const meta = {
  title: "Primitives/Priority+",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PriorityPlus: Story = {
  args: {},
  render: () => html`
    <pp-p-plus>
      <div style="display: flex; gap: 1ch; align-items: center;">
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button is="pp-button">
          <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
      </div>
    </pp-p-plus>
  `,
};

