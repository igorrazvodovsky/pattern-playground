import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Description list',
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
        A concise account of the change, long enough to wrap onto a second line so the label stays
        aligned with the first line of its value rather than centred against the whole block.
      </dd>
      <dt>Status</dt>
      <dd>In progress</dd>
    </dl>
  ),
};

export const Grouped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When a view stacks several lists — spec sections on an entity page — `.details-list-group` on the shared ancestor makes them one grid, so their label columns share a single `max-content` track instead of each list sizing its own.',
      },
    },
  },
  render: () => (
    <div className="flow details-list-group">
      <section className="flow">
        <h3>Specifications</h3>
        <dl className="description-list">
          <dt>Material</dt>
          <dd>Recycled aluminium</dd>
          <dt>Weight</dt>
          <dd>1.2 kg</dd>
        </dl>
      </section>
      <section className="flow">
        <h3>Lifecycle</h3>
        <dl className="description-list">
          <dt>Design life</dt>
          <dd>10 years</dd>
          <dt>Warranty</dt>
          <dd>2 years</dd>
          <dt>Repairability</dt>
          <dd>High</dd>
        </dl>
      </section>
    </div>
  ),
};

export const Stacked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When each value is a sentence, a label column would squeeze it into a narrow strip. `.description-list--stacked` puts each label above its values instead, in small caps, so a long list of explained links stays easy to scan by group.',
      },
    },
  },
  render: () => (
    <dl className="description-list description-list--stacked">
      <dt>Before this</dt>
      <dd>
        <a href="#">Choose a plan</a> — the plan decides which options the setup offers.
      </dd>
      <dt>Works alongside</dt>
      <dd>
        <a href="#">Progress summary</a> — keeps the person oriented while the steps change.
      </dd>
      <dd>
        <a href="#">Undo</a> — going back must not cost what was already entered.
      </dd>
      <dt>Instead of this</dt>
      <dd>
        <a href="#">Single form</a> — when the questions do not depend on each other, one page is
        faster to fill in and to check.
      </dd>
    </dl>
  ),
};
