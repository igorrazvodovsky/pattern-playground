import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Compositions/Toolbar",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Toolbar: Story = {
  args: {},
  render: () => (
    <div className="toolbar inline-flow">
      <pp-input placeholder="Search">
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
      </pp-input>
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:funnel-simple"></iconify-icon>
        Filter
      </button>
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:stack"></iconify-icon>
        Grouped by <strong>size</strong>
      </button>
      <div className="button-group">
        <pp-dropdown>
          <button className="button" is="pp-button" slot="trigger">
            A→Z
            <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
          </button>
          <pp-list>
            <pp-list-item type="checkbox" defaultChecked>Sorting criteria 1</pp-list-item>
            <pp-list-item>Sorting criteria 2</pp-list-item>
            <pp-list-item>Sorting criteria 3</pp-list-item>
          </pp-list>
        </pp-dropdown>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon="ph:sort-ascending" aria-hidden="true"></iconify-icon>
        </button>
      </div>
    </div>
  ),
};