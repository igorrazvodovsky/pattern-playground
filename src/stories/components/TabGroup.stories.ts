import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { map } from 'lit/directives/map.js';
import { range } from 'lit/directives/range.js';
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

const tabs = Array.from(
  map(
    range(20),
    (i) =>
      html`
<pp-tab slot="nav" panel=${i}> ${faker.commerce.productName()} </pp-tab>
<pp-tab-panel name=${i}>
  <p style="margin: 1rem;">${faker.hacker.phrase()}</p>
</pp-tab-panel>`
  )
);

export const Basic: Story = {
  render: () => html`
    <pp-tab-group>
      <pp-tab slot="nav" panel="1">${faker.vehicle.bicycle()}</pp-tab>
      <pp-tab slot="nav" panel="2">${faker.vehicle.bicycle()}</pp-tab>
      <pp-tab slot="nav" panel="3">${faker.vehicle.bicycle()}</pp-tab>
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
  `,
};

export const WithIcons: Story = {
  render: () => html`
    <pp-tab-group>
      <pp-tab slot="nav" panel="1">
        ${faker.commerce.productName()}
        <iconify-icon class="icon" icon="${getRandomIcon()}" slot="icon"></iconify-icon>
      </pp-tab>
      <pp-tab slot="nav" panel="2">
        ${faker.commerce.productName()}
        <iconify-icon class="icon" icon="${getRandomIcon()}" slot="icon"></iconify-icon>
      </pp-tab>
      <pp-tab-panel name="1">
        <p style="margin: 1rem;">${faker.hacker.phrase()}</p>
      </pp-tab-panel>
      <pp-tab-panel name="2">
        <p style="margin: 1rem;">${faker.hacker.phrase()}</p>
      </pp-tab-panel>
    </pp-tab-group>
  `,
};

export const WithIconsAndSubtitles: Story = {
  render: () => html`
    <pp-tab-group>
      <pp-tab slot="nav" panel="1">
        ${faker.commerce.productName()}
        <iconify-icon style="font-size: 1.5em" class="icon" icon="${getRandomIcon()}" slot="icon"></iconify-icon>
        <small slot="subtitle">100</small>
      </pp-tab>
      <pp-tab slot="nav" panel="2">
        ${faker.commerce.productName()}
        <iconify-icon style="font-size: 1.5em" class="icon" icon="${getRandomIcon()}" slot="icon"></iconify-icon>
        <small slot="subtitle">100</small>
      </pp-tab>
      <pp-tab-panel name="1">
        <p style="margin: 1rem;">${faker.hacker.phrase()}</p>
      </pp-tab-panel>
      <pp-tab-panel name="2">
        <p style="margin: 1rem;">${faker.hacker.phrase()}</p>
      </pp-tab-panel>
    </pp-tab-group>
  `,
};

export const ScrollingTabs = {
  render: () => html`
    <pp-tab-group>
      ${tabs}
    </pp-tab-group>
  `,
};