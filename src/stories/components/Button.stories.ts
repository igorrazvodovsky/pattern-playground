import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Components/Button",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: "Button" },
  render: (args) => html` <button is="ir-button"> ${args.label} </button>`,
};

export const Variants: Story = {
  render: () => html`
    <button class="button--primary" is="ir-button">Primary</button>
    <button class="button--danger" is="ir-button">Danger</button>
    <button class="button--plain" is="ir-button">Plain</button>
    <button is="ir-button" disabled>Disabled</button>

  `,
};

export const Prefixes: Story = {
  render: () => html`
    <button is="ir-button"><iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon> With prefix</button>
    <button is="ir-button">With suffix <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon></button>
    <button is="ir-button"><iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon> With both <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon></button>
    `,
};

export const Toggle: Story = {
  render: () => html`
    <button is="ir-button">Simple toggle</button>
    <button is="ir-button">Multiple state toggle</button>
  `,
};

export const IconButton: Story = {
  render: (args) => html`<button is="ir-button"> <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon><span class="inclusively-hidden">${args.label}</span></button>`,
};

