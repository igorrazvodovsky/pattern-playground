import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../utils/icons';

const meta = {
  title: "Components/Priority+*",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PriorityPlus: Story = {
  args: {},
  render: () => html`
    <pp-p-plus>
      <div style="display: flex; gap: 1ch; align-items: center;">
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button class="button" is="pp-button">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
          ${faker.word.verb() + ' ' + faker.word.noun()}
        </button>
      </div>
    </pp-p-plus>
  `,
};

