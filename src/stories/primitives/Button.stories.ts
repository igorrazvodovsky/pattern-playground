import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Button*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { label: "Button" },
  render: (args) => html` <button class="button" is="pp-buton"> ${args.label} </button>`,
};

export const Variants: Story = {
  render: () => html`
    <button class="button button--primary" is="pp-buton">Primary</button>
    <button class="button button--danger" is="pp-buton">Danger</button>
    <button class="button button--plain" is="pp-buton">Plain</button>
    <button class="button" is="pp-buton" disabled>Disabled</button>
  `,
};

export const Prefixes: Story = {
  render: () => html`
    <button class="button" is="pp-buton"><iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon> With prefix</button>
    <button class="button" is="pp-buton">With suffix <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon></button>
    <button class="button" is="pp-buton"><iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon> With both <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon></button>
    `,
};

export const Toggle: Story = {
  render: () => html`
    <button class="button" is="pp-buton">Simple toggle</button>
    <button class="button" is="pp-buton">Multiple state toggle</button>
  `,
};

export const IconButton: Story = {
  render: (args) => html`<button class="button" is="pp-buton"> <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon><span class="inclusively-hidden">${args.label}</span></button>`,
};

