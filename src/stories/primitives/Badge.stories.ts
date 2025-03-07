import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';
import { icons } from "../icons.ts";

function randomIcon() { return 'ph:' + icons[icons.length * Math.random() << 0].name }

const meta = {
  title: "Primitives/Badge 🚧",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Badge: Story = {
  render: () => html`<span class="badge">Badge</span>`,
};

export const WithButton: Story = {
  render: () => html`
  <div style="display: flex; gap: 1rem; align-items: center;">
    <button is="ir-button">Requests<sup class="badge badge--pill badge--info">12</sup></button>
    <button is="ir-button"> <iconify-icon class="icon" icon="ph:circle-dashed"></iconify-icon><span class="inclusively-hidden">Icon button</span><sup class="badge badge--pill badge--danger"></sup></button>
    <div class="avatar"><sup class="badge badge--pill badge--danger">99+</sup></div>
  </div>
  `,
};

export const WithList: Story = {
  render: () => html`
    <pp-list style="max-width: 240px;">
      <pp-list-item>
        <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon class="icon" icon="${randomIcon()}" slot="prefix"></iconify-icon>
        ${faker.hacker.verb()}
        <span class="badge badge--accent badge--pill" slot="suffix">12</span>
      </pp-list-item>
    </pp-list>
  `,
};

export const AttributeValuePair: Story = {
  render: () => html`
    <span class="badge"><span class="badge__label">Attribute</span>Value</span>
    <span class="badge badge--info"><span class="badge__label">${faker.person.jobTitle()}</span>${faker.person.fullName()}</span>
  `,
};

// TODO: Add buttons for +/-/rnd
export const AnimatedCounter: Story = {
  render: () => html`<span class="badge counter"></span>`,
};

export const Pulse: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <span class="badge badge--pill badge--pulse badge--accent">1</span>
      <span class="badge badge--pill badge--pulse badge--info">1</span>
      <span class="badge badge--pill badge--pulse badge--success">1</span>
      <span class="badge badge--pill badge--pulse badge--warning">1</span>
      <span class="badge badge--pill badge--pulse badge--danger">1</span>
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
  `,
};

export const Pill: Story = {
  render: () => html`
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
  render: () => html`<span class="badge badge--pill"><iconify-icon class="icon" icon="${randomIcon()}" slot="icon"></iconify-icon>${faker.word.words()}</span>`,
};

export const IconOnly: Story = {
  render: () => html`<span class="badge badge--pill"><iconify-icon class="icon" icon="${randomIcon()}" slot="icon"></iconify-icon></span>`,
};

// https://codepen.io/alvaromontoro/pen/OJqOVyO
export const withTags: Story = {
  render: () => html``,
};