import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from './utils/icons';
import { userEvent, within } from '@storybook/testing-library';

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
