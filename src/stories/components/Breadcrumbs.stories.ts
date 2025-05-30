import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Components/Breadcrumbs",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => html`

    <pp-breadcrumbs role="navigation">
      <a href="">
        <span class="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span class="inclusively-hidden" class="home-label">Home</span>
      </a>

      <span class="crumb">
        <a href="#">Section</a>
      </span>

      <span class="crumb">
        <a href="" aria-current="page">Subsection</a>
      </span>
    </pp-breadcrumbs>
  `,
};

export const LongPath: Story = {
  args: {},
  render: () => html`

    <pp-breadcrumbs role="navigation">
      <a href="">
        <span class="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span class="inclusively-hidden" class="home-label">Home</span>
      </a>

      <span class="crumb">
        <a href="#">Section</a>
      </span>

      <span class="crumb">
        …
      </span>

      <span class="crumb">
        <a href="#" aria-current="page">The very bottom</a>
      </span>
    </pp-breadcrumbs>
  `,
};

// <span class="badge badge--plain badge--pill badge--success">Active</span>

export const Advanced: Story = {
  args: {},
  render: () => html`

    <pp-breadcrumbs role="navigation">
      <a href="">
        <span class="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span class="inclusively-hidden" class="home-label">Home</span>
      </a>

      <span class="crumb">
        <a href="#">Section B</a>
        <span class="crumbicon">
          <iconify-icon icon="ph:caret-down"></iconify-icon>
          <select
            class="disguised-select"
            title="Navigate to another section"
          >
            <option>Section A</option>
            <option selected>Section B</option>
            <option>Section C</option>
            <option>...</option>
          </select>
        </span>
      </span>

      <span class="crumb">
        <a href="#" aria-current="page">Subsection C</a>
        <span class="crumbicon">
          <iconify-icon icon="ph:caret-down"></iconify-icon>
          <select
            class="disguised-select"
            title="Navigate to another sub collection"
          >
            <option>Subsection A</option>
            <option>Subsection B</option>
            <option selected>Subsection C</option>
            <option>...</option>
          </select>
        </span>
      </span>
    </pp-breadcrumbs>
  `,
};