import type { Meta, StoryObj } from "@storybook/react-vite";

interface ToolbarArgs {
  showFilter: boolean;
  showGrouping: boolean;
  showSort: boolean;
  searchPlaceholder: string;
}

const meta = {
  title: "Actions/Coordination/Toolbar",
  argTypes: {
    showFilter: {
      control: { type: 'boolean' },
      description: 'Show the filter button',
    },
    showGrouping: {
      control: { type: 'boolean' },
      description: 'Show the grouping button',
    },
    showSort: {
      control: { type: 'boolean' },
      description: 'Show the sort controls',
    },
    searchPlaceholder: {
      control: { type: 'text' },
      description: 'Search input placeholder text',
    },
  },
} satisfies Meta<ToolbarArgs>;

export default meta;
type Story = StoryObj<ToolbarArgs>;

export const Toolbar: Story = {
  args: {
    showFilter: true,
    showGrouping: true,
    showSort: true,
    searchPlaceholder: 'Search',
  },
  render: ({ showFilter, showGrouping, showSort, searchPlaceholder }) => (
    <div className="toolbar flex">
      <pp-input placeholder={searchPlaceholder}>
        <iconify-icon className="icon" icon="ph:magnifying-glass" slot="suffix"></iconify-icon>
      </pp-input>
      {showFilter && (
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon="ph:funnel-simple"></iconify-icon>
          Filter
        </button>
      )}
      {showGrouping && (
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon="ph:stack"></iconify-icon>
          Grouped by <strong>size</strong>
        </button>
      )}
      {showSort && (
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
      )}
    </div>
  ),
};