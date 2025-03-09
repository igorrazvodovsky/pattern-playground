import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

function capitalizeFirstLetter(v) {
  return String(v).charAt(0).toUpperCase() + String(v).slice(1);
}

const meta = {
  title: "Primitives/Tag",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => html`
    <span class="tag">${capitalizeFirstLetter(faker.word.words())}</span>
    <span class="tag">${capitalizeFirstLetter(faker.word.words())}</span>
    <span class="tag">${capitalizeFirstLetter(faker.word.words())}</span>
    `,
};

export const Pill: Story = {
  render: () => html`<span class="tag tag--pill">Tag</span>`,
};

export const Link: Story = {
  render: () => html`<span class="tag">Tag</span>`,
};

export const Removable: Story = {
  render: () => html`
    <span class="tag">
      Tag
      <button>
        <iconify-icon class="icon" icon="ph:x"></iconify-icon>
      </button>
    </span>`
  ,
};

export const Selectable: Story = {
  render: () => html`
    <label class="form-control tag">
      <input type="checkbox"  />
      Checkbox
    </label>
    <label class="form-control tag">
      <input type="checkbox" />
      Checkbox
    </label>
    <label class="form-control tag">
      <input type="checkbox" checked/>
      Checkbox
    </label>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <span class="tag">
      Tag
      <button disabled>
        <iconify-icon class="icon" icon="ph:x"></iconify-icon>
      </button>
    </span>
    <label class="form-control tag">
      <input type="checkbox" disabled/>
      Checkbox
    </label>
    <label class="form-control tag">
      <input type="checkbox" checked disabled/>
      Checkbox
    </label>
  `,
};

export const Purpose: Story = {
  render: () => html`<span class="tag">Tag</span>`,
};