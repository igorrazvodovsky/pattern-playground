import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../utils/icons';

const meta = {
  title: "Primitives/Badge",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => html`<span class="badge">Badge</span>`,
};

export const Size: Story = {
  render: () => html`
  <div class="flow">
    <h2 style="display: flex; gap: 0.5ch; align-items: center;">Heading 2 <span class="badge badge--pill badge--danger">Large</span></h2>
    <p>In a paragraph <span class="badge">Small</span></p>
  </div>
  `,
};

export const WithButton: Story = {
  render: () => html`
  <div style="display: flex; gap: 1rem; align-items: center;">
    <button class="button" is="pp-buton">Requests<strong class="badge badge--pill badge--info">12</strong></button>
    <button class="button" is="pp-buton"> <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon><span class="inclusively-hidden">Icon button</span><sup class="badge badge--pill badge--danger"></sup></button>
    <div class="avatar"><sup class="badge badge--pill badge--danger">99+</sup></div>
  </div>
  `,
};

export const WithList: Story = {
  render: () => html`
    <pp-list style="max-width: 240px;">
      <pp-list-item>
        <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon class="icon" icon="${getRandomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
        <strong class="badge badge--accent badge--pill" slot="suffix">12</strong>
      </pp-list-item>
    </pp-list>
  `,
};

export const AttributeValuePair: Story = {
  render: () => html`
    <span class="badge"><span class="badge__label">Attribute</span>Value</span>
    <strong class="badge badge--info"><span class="badge__label">${faker.person.jobTitle()}</span>${faker.person.fullName()}</strong>
  `,
};

// TODO: Add buttons for +/-/rnd
export const AnimatedCounter: Story = {
  render: () => html`<span class="badge counter"></span>`,
};

export const Pulse: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <strong class="badge badge--pill badge--pulse badge--accent">1</strong>
      <strong class="badge badge--pill badge--pulse badge--info">1</strong>
      <strong class="badge badge--pill badge--pulse badge--success">1</strong>
      <strong class="badge badge--pill badge--pulse badge--warning">1</strong>
      <strong class="badge badge--pill badge--pulse badge--danger">1</strong>
    </div>
  `,
};

export const Purpose: Story = {
  render: () => html`
    <span class="badge badge--accent">Accent</span>
    <span class="badge badge--info">Info</span>
    <span class="badge badge--success">Success</span>
    <span class="badge badge--warning">Warning</span>
    <span class="badge badge--danger">Danger</span>
    <span class="badge shimmer">Calculating…</span>
  `,
};

export const PurposeHighEmphasis: Story = {
  render: () => html`
    <strong class="badge badge--accent">Accent</strong>
    <strong class="badge badge--info">Info</strong>
    <strong class="badge badge--success">Success</strong>
    <strong class="badge badge--warning">Warning</strong>
    <strong class="badge badge--danger">Danger</strong>
  `,
};

export const PurposeLowEmphasis: Story = {
  render: () => html`
    <span class="badge badge--plain badge--pill badge--accent">Accent</span>
    <span class="badge badge--plain badge--pill badge--info">Info</span>
    <span class="badge badge--plain badge--pill badge--success">Success</span>
    <span class="badge badge--plain badge--pill badge--warning">Warning</span>
    <span class="badge badge--plain badge--pill badge--danger">Danger</span>
  `,
};

export const Pill: Story = {
  render: () => html`
    <span class="badge badge--pill">Default</span>
    <span class="badge badge--pill badge--accent">Accent</span>
    <span class="badge badge--pill badge--info">Info</span>
    <span class="badge badge--pill badge--success">Success</span>
    <span class="badge badge--pill badge--warning">Warning</span>
    <span class="badge badge--pill badge--danger">Danger</span>
  `,
};

export const Dot: Story = {
  render: () => html`
    <span class="badge badge--pill badge--accent"></span>
    <span class="badge badge--pill badge--info"></span>
    <span class="badge badge--pill badge--success"></span>
    <span class="badge badge--pill badge--warning"></span>
    <span class="badge badge--pill badge--danger"></span>
  `,
};

export const withIcon: Story = {
  render: () => html`
    <span class="badge badge--pill"><iconify-icon class="icon" icon="ph:arrows-vertical" slot="icon"></iconify-icon>3</span>
    <span class="badge badge--pill"><iconify-icon class="icon" icon="ph-angle" slot="icon"></iconify-icon>45°</span>
    <span class="badge badge--pill"><iconify-icon class="icon" icon="ph:house" slot="icon"></iconify-icon>Stockholm</span>
    <span class="badge badge--info badge--pill"><iconify-icon class="icon" icon="ph:circle" slot="icon"></iconify-icon>Confirmed</span>
    <span class="badge badge--info badge--pill"><iconify-icon class="icon" icon="ph:circle-half-fill" slot="icon"></iconify-icon>Processing</span>
    <span class="badge badge--warning badge--pill"><iconify-icon class="icon" icon="ph:circle-dashed" slot="icon"></iconify-icon>Attention</span>
    <span class="badge badge--success badge--pill"><iconify-icon class="icon" icon="ph:circle-fill" slot="icon"></iconify-icon>Completed</span>
    <span class="badge badge--warning badge--pill"><iconify-icon class="icon" icon="ph:x-circle" slot="icon"></iconify-icon>Cancelled</span>

  `,
};

export const IconOnly: Story = {
  render: () => html`
  <span>
    <strong class="badge badge--accent badge--pill"><iconify-icon class="icon" icon="ph:heart-fill" slot="icon"></iconify-icon><span class="inclusively-hidden">Heart</span></strong>
  </span>
  <span>
    <strong class="badge badge--success badge--pill"><iconify-icon class="icon" icon="ph:check-fat-fill" slot="icon"></iconify-icon><span class="inclusively-hidden">Success</span></strong>
  </span>
  `,
};

export const IconOnlyInAGroup: Story = {
  render: () => html`
    <div class="flex">
      <span class="badge">1.7"</span>
      <span class="badge"><iconify-icon class="icon" icon="ph:arrows-out-line-horizontal" slot="icon"></iconify-icon><span class="inclusively-hidden">Heart</span></span>
      <span class="badge">4</span>
      <span class="badge">0.36°</span>
    </div>
  `,
};

export const Link: Story = {
  render: () => html`<a href="#" class="badge">Badge</a>`,
};

// https://codepen.io/alvaromontoro/pen/OJqOVyO
export const withTags: Story = {
  render: () => html``,
};