import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../utils/icons';

const meta = {
  title: "Components/Tabs",
  tags: ["autodocs"],
  component: 'pp-tabs',
  argTypes: {
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const tabs = Array.from({ length: 20 }, (_, i) => (
  <React.Fragment key={i}>
    <pp-tab slot="nav" panel={i}>{faker.commerce.productName()}</pp-tab>
    <pp-tab-panel name={i}>
      <p style={{ margin: '1rem' }}>{faker.hacker.phrase()}</p>
    </pp-tab-panel>
  </React.Fragment>
));

export const Basic: Story = {
  render: () => (
    <pp-tab-group>
      <pp-tab slot="nav" panel="1">{faker.vehicle.bicycle()}</pp-tab>
      <pp-tab slot="nav" panel="2">{faker.vehicle.bicycle()}</pp-tab>
      <pp-tab slot="nav" panel="3">{faker.vehicle.bicycle()}</pp-tab>
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
};

export const WithIcons: Story = {
  render: () => (
    <pp-tab-group>
      <pp-tab slot="nav" panel="1">
        {faker.commerce.productName()}
        <iconify-icon className="icon" icon={getRandomIcon()} slot="icon"></iconify-icon>
      </pp-tab>
      <pp-tab slot="nav" panel="2">
        {faker.commerce.productName()}
        <iconify-icon className="icon" icon={getRandomIcon()} slot="icon"></iconify-icon>
      </pp-tab>
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
      <pp-tab slot="nav" panel="1">
        {faker.commerce.productName()}
        <iconify-icon style={{ fontSize: '1.5em' }} className="icon" icon={getRandomIcon()} slot="icon"></iconify-icon>
        <small slot="subtitle">100</small>
      </pp-tab>
      <pp-tab slot="nav" panel="2">
        {faker.commerce.productName()}
        <iconify-icon style={{ fontSize: '1.5em' }} className="icon" icon={getRandomIcon()} slot="icon"></iconify-icon>
        <small slot="subtitle">100</small>
      </pp-tab>
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
      {tabs}
    </pp-tab-group>
  ),
};