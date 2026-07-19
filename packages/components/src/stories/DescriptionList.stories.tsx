import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Components/Description list",
  parameters: {
    docs: {
      description: {
        component: 'Pairs a label with its value — metadata panels, item details, spec sheets.',
      },
    },
  },
  render: () => (
    <dl className="description-list">
      <dt>Status</dt>
      <dd>In progress</dd>
      <dt>Owner</dt>
      <dd>Maya Chen</dd>
      <dt>Created</dt>
      <dd>3 March 2026</dd>
      <dt>Last updated</dt>
      <dd>18 hours ago</dd>
    </dl>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const DescriptionList: Story = {};

export const MultipleValues: Story = {
  render: () => (
    <dl className="description-list">
      <dt>Assignees</dt>
      <dd>Maya Chen</dd>
      <dd>Jonas Weber</dd>
      <dt>Status</dt>
      <dd>In progress</dd>
    </dl>
  ),
};

export const LongDescription: Story = {
  render: () => (
    <dl className="description-list">
      <dt>Summary</dt>
      <dd>
        A concise account of the change, long enough to wrap onto a second line so the
        label stays aligned with the first line of its value rather than centred against
        the whole block.
      </dd>
      <dt>Status</dt>
      <dd>In progress</dd>
    </dl>
  ),
};
