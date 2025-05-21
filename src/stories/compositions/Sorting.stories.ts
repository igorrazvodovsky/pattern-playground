import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Compositions/Browsing & sensemaking*/Sorting",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Sorting: Story = {
  args: {},
  render: () => html`
    <div class="button-group">
      <pp-dropdown>
        <button class="button" is="pp-buton" slot="trigger">
          Sorting criteria 1
          <iconify-icon class="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
        </button>
        <pp-list>
          <pp-list-item type="checkbox" checked>Sorting criteria 1</pp-list-item>
          <pp-list-item>Sorting criteria 2</pp-list-item>
          <pp-list-item>Sorting criteria 3</pp-list-item>
        </pp-list>
      </pp-dropdown>
      <button class="button" is="pp-buton">
        <iconify-icon class="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
      </button>
    </div>
  `,
};
