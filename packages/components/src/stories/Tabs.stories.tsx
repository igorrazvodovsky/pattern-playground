import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from './utils/icons';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: "Components/Tabs",
  tags: ['autodocs', 'activity-level:operation', 'atomic:component', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Tabbed interface that organises related content into discrete panels.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const manyTabs = Array.from({ length: 20 }, (_, i) => (
  <pp-tab key={i} panel={i}>{faker.commerce.productName()}</pp-tab>
));

const manyPanels = Array.from({ length: 20 }, (_, i) => (
  <pp-tab-panel key={i} name={i}>
    <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
  </pp-tab-panel>
));

export const Basic: Story = {
  render: () => (
    <pp-tab-group>
      <div data-slot="nav">
        <pp-tab panel="1">{faker.vehicle.bicycle()}</pp-tab>
        <pp-tab panel="2">{faker.vehicle.bicycle()}</pp-tab>
        <pp-tab panel="3">{faker.vehicle.bicycle()}</pp-tab>
      </div>
      <pp-tab-panel name="1">
        This is the tab panel.
      </pp-tab-panel>
      <pp-tab-panel name="2">
        This is another tab panel.
      </pp-tab-panel>
      <pp-tab-panel name="3">
        Yeap, another one.
      </pp-tab-panel>
    </pp-tab-group>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    await userEvent.click(tabs[1]);
    await waitFor(() => expect(tabs[1]).toHaveAttribute('aria-selected', 'true'));
    // Panels other than the active one carry aria-hidden, so the role query
    // returns exactly the one the clicked tab controls.
    await waitFor(() => expect(canvas.getAllByRole('tabpanel')).toHaveLength(1));
    expect(canvas.getByRole('tabpanel')).toHaveAttribute('name', tabs[1].getAttribute('panel'));
  },
};

export const WithIcons: Story = {
  render: () => (
    <pp-tab-group>
      <div data-slot="nav">
        <pp-tab panel="1">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="icon"></iconify-icon>
          {faker.commerce.productName()}
        </pp-tab>
        <pp-tab panel="2">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="icon"></iconify-icon>
          {faker.commerce.productName()}
        </pp-tab>
      </div>
      <pp-tab-panel name="1">
        <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
      </pp-tab-panel>
      <pp-tab-panel name="2">
        <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
      </pp-tab-panel>
    </pp-tab-group>
  ),
};

export const WithIconsAndSubtitles: Story = {
  render: () => (
    <pp-tab-group>
      <div data-slot="nav">
        <pp-tab panel="1">
          <iconify-icon style={{ fontSize: '1.5em' }} className="icon" icon={getRandomIcon()} data-slot="icon"></iconify-icon>
          {faker.commerce.productName()}
          <small data-slot="subtitle">100</small>
        </pp-tab>
        <pp-tab panel="2">
          <iconify-icon style={{ fontSize: '1.5em' }} className="icon" icon={getRandomIcon()} data-slot="icon"></iconify-icon>
          {faker.commerce.productName()}
          <small data-slot="subtitle">100</small>
        </pp-tab>
      </div>
      <pp-tab-panel name="1">
        <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
      </pp-tab-panel>
      <pp-tab-panel name="2">
        <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
      </pp-tab-panel>
    </pp-tab-group>
  ),
};

/**
 * Moving between tabs without a pointer. Arrow keys walk the strip and, by
 * default, switch the panel as they go — the actor sees each section while
 * scanning rather than having to commit to one. Home and End jump to the
 * ends, and the walk wraps, so no tab is more than a few keys away.
 */
export const KeyboardNavigation: Story = {
  name: 'Keyboard navigation',
  render: () => (
    <pp-tab-group>
      <div data-slot="nav">
        <pp-tab panel="first">First</pp-tab>
        <pp-tab panel="second">Second</pp-tab>
        <pp-tab panel="third">Third</pp-tab>
      </div>
      <pp-tab-panel name="first">First panel.</pp-tab-panel>
      <pp-tab-panel name="second">Second panel.</pp-tab-panel>
      <pp-tab-panel name="third">Third panel.</pp-tab-panel>
    </pp-tab-group>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second, third] = canvas.getAllByRole('tab');

    first.focus();
    await waitFor(() => expect(first).toHaveFocus());

    // Default activation is `auto`: the arrow moves focus and the selection
    // together, so the panel follows the actor's scan.
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(second).toHaveFocus());
    await waitFor(() => expect(second).toHaveAttribute('aria-selected', 'true'));
    expect(canvas.getByRole('tabpanel')).toHaveAttribute('name', 'second');

    await userEvent.keyboard('{End}');
    await waitFor(() => expect(third).toHaveFocus());
    await waitFor(() => expect(third).toHaveAttribute('aria-selected', 'true'));

    // Past the last tab, the walk wraps rather than dead-ending.
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(first).toHaveFocus());

    await userEvent.keyboard('{Home}');
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(third).toHaveFocus());
  },
};

/**
 * `activation="manual"` splits the two things the arrow keys do by default:
 * focus moves, the panel does not change until the actor presses Enter or
 * Space. Worth it when switching a panel costs something — a fetch, a form
 * the actor would lose — and scanning past it shouldn't pay that cost.
 */
export const ManualActivation: Story = {
  name: 'Manual activation',
  render: () => (
    <pp-tab-group activation="manual">
      <div data-slot="nav">
        <pp-tab panel="first">First</pp-tab>
        <pp-tab panel="second">Second</pp-tab>
      </div>
      <pp-tab-panel name="first">First panel.</pp-tab-panel>
      <pp-tab-panel name="second">Second panel.</pp-tab-panel>
    </pp-tab-group>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first, second] = canvas.getAllByRole('tab');

    first.focus();
    await waitFor(() => expect(first).toHaveAttribute('aria-selected', 'true'));

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(second).toHaveFocus());
    // Focus has moved; selection has not.
    expect(second).toHaveAttribute('aria-selected', 'false');
    expect(canvas.getByRole('tabpanel')).toHaveAttribute('name', 'first');

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(second).toHaveAttribute('aria-selected', 'true'));
    expect(canvas.getByRole('tabpanel')).toHaveAttribute('name', 'second');
  },
};

export const ScrollingTabs = {
  render: () => (
    <pp-tab-group>
      <div data-slot="nav">
        {manyTabs}
      </div>
      {manyPanels}
    </pp-tab-group>
  ),
};
