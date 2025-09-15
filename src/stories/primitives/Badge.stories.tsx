import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../utils/icons';

const meta = {
  title: "Primitives/Badge",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <span className="badge">Badge</span>,
};

export const Size: Story = {
  render: () => (
    <div className="flow">
      <h2 style={{display: 'flex', gap: '0.5ch', alignItems: 'center'}}>
        Heading 2 <span className="badge badge--pill badge--danger">Large</span>
      </h2>
      <p>In a paragraph <span className="badge">Small</span></p>
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <button className="button" is="pp-button">
        Requests<strong className="badge badge--pill badge--info">12</strong>
      </button>
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:circle-dashed"></iconify-icon>
        <span className="inclusively-hidden">Icon button</span>
        <sup className="badge badge--pill badge--danger"></sup>
      </button>
      <div className="avatar">
        <sup className="badge badge--pill badge--danger">99+</sup>
      </div>
    </div>
  ),
};

export const WithList: Story = {
  render: () => (
    <pp-list style={{maxWidth: '240px'}}>
      <pp-list-item>
        <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
        {faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
        {faker.hacker.verb()}
      </pp-list-item>
      <pp-list-item>
        <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
        {faker.hacker.verb()}
        <strong className="badge badge--accent badge--pill" slot="suffix">12</strong>
      </pp-list-item>
    </pp-list>
  ),
};

export const AttributeValuePair: Story = {
  render: () => (
    <>
      <span className="badge">
        <span className="badge__label">Attribute</span>Value
      </span>
      <strong className="badge badge--info">
        <span className="badge__label">{faker.person.jobTitle()}</span>
        {faker.person.fullName()}
      </strong>
    </>
  ),
};

export const AnimatedCounter: Story = {
  render: () => <span className="badge counter"></span>,
};

export const Pulse: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <strong className="badge badge--pill badge--pulse badge--accent">1</strong>
      <strong className="badge badge--pill badge--pulse badge--info">1</strong>
      <strong className="badge badge--pill badge--pulse badge--success">1</strong>
      <strong className="badge badge--pill badge--pulse badge--warning">1</strong>
      <strong className="badge badge--pill badge--pulse badge--danger">1</strong>
    </div>
  ),
};

export const Purpose: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="badge badge--accent">Accent</span>
      <span className="badge badge--info">Info</span>
      <span className="badge badge--success">Success</span>
      <span className="badge badge--warning">Warning</span>
      <span className="badge badge--danger">Danger</span>
      <span className="badge shimmer">Calculating…</span>
    </div>
  ),
};

export const PurposeHighEmphasis: Story = {
  render: () => (
    <div className="inline-flow">
      <strong className="badge badge--accent">Accent</strong>
      <strong className="badge badge--info">Info</strong>
      <strong className="badge badge--success">Success</strong>
      <strong className="badge badge--warning">Warning</strong>
      <strong className="badge badge--danger">Danger</strong>
    </div>
  ),
};

export const PurposeLowEmphasis: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="badge badge--plain badge--pill badge--accent">Accent</span>
      <span className="badge badge--plain badge--pill badge--info">Info</span>
      <span className="badge badge--plain badge--pill badge--success">Success</span>
      <span className="badge badge--plain badge--pill badge--warning">Warning</span>
      <span className="badge badge--plain badge--pill badge--danger">Danger</span>
    </div>
  ),
};

export const Pill: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="badge badge--pill">Default</span>
      <span className="badge badge--pill badge--accent">Accent</span>
      <span className="badge badge--pill badge--info">Info</span>
      <span className="badge badge--pill badge--success">Success</span>
      <span className="badge badge--pill badge--warning">Warning</span>
      <span className="badge badge--pill badge--danger">Danger</span>
    </div>
  ),
};

export const Dot: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="badge badge--pill badge--accent"></span>
      <span className="badge badge--pill badge--info"></span>
      <span className="badge badge--pill badge--success"></span>
      <span className="badge badge--pill badge--warning"></span>
      <span className="badge badge--pill badge--danger"></span>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="inline-flow">
      <span className="badge badge--pill">
        <iconify-icon className="icon" icon="ph:arrows-vertical" slot="icon"></iconify-icon>3
      </span>
      <span className="badge badge--pill">
        <iconify-icon className="icon" icon="ph-angle" slot="icon"></iconify-icon>45°
      </span>
      <span className="badge badge--pill">
        <iconify-icon className="icon" icon="ph:house" slot="icon"></iconify-icon>Stockholm
      </span>
      <span className="badge badge--info badge--pill">
        <iconify-icon className="icon" icon="ph:circle" slot="icon"></iconify-icon>Confirmed
      </span>
      <span className="badge badge--info badge--pill">
        <iconify-icon className="icon" icon="ph:circle-half-fill" slot="icon"></iconify-icon>Processing
      </span>
      <span className="badge badge--warning badge--pill">
        <iconify-icon className="icon" icon="ph:circle-dashed" slot="icon"></iconify-icon>Attention
      </span>
      <span className="badge badge--success badge--pill">
        <iconify-icon className="icon" icon="ph:circle-fill" slot="icon"></iconify-icon>Completed
      </span>
      <span className="badge badge--warning badge--pill">
        <iconify-icon className="icon" icon="ph:x-circle" slot="icon"></iconify-icon>Cancelled
      </span>
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="inline-flow">
      <span>
        <strong className="badge badge--accent badge--pill">
          <iconify-icon className="icon" icon="ph:heart-fill" slot="icon"></iconify-icon>
          <span className="inclusively-hidden">Heart</span>
        </strong>
      </span>
      <span>
        <strong className="badge badge--success badge--pill">
          <iconify-icon className="icon" icon="ph:check-fat-fill" slot="icon"></iconify-icon>
          <span className="inclusively-hidden">Success</span>
        </strong>
      </span>
    </div>
  ),
};

export const IconOnlyInAGroup: Story = {
  render: () => (
    <div className="flex">
      <span className="badge">1.7"</span>
      <span className="badge">
        <iconify-icon className="icon" icon="ph:arrows-out-line-horizontal" slot="icon"></iconify-icon>
        <span className="inclusively-hidden">Heart</span>
      </span>
      <span className="badge">4</span>
      <span className="badge">0.36°</span>
    </div>
  ),
};

export const Link: Story = {
  render: () => <a href="#" className="badge">Badge</a>,
};

export const WithTags: Story = {
  render: () => <></>,
};