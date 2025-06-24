import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

const meta = {
  title: "Components/Breadcrumbs",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <pp-breadcrumbs role="navigation">
      <a href="">
        <span className="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span className="inclusively-hidden home-label">Home</span>
      </a>

      <span className="crumb">
        <a href="#">Section</a>
      </span>

      <span className="crumb">
        <a href="" aria-current="page">Subsection</a>
      </span>
    </pp-breadcrumbs>
  ),
};

export const LongPath: Story = {
  render: () => (
    <pp-breadcrumbs role="navigation">
      <a href="">
        <span className="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span className="inclusively-hidden home-label">Home</span>
      </a>

      <span className="crumb">
        <a href="#">Section</a>
      </span>

      <span className="crumb">
        …
      </span>

      <span className="crumb">
        <a href="#" aria-current="page">The very bottom</a>
      </span>
    </pp-breadcrumbs>
  ),
};

export const Advanced: Story = {
  render: () => (
    <pp-breadcrumbs role="navigation">
      <a href="">
        <span className="crumbicon">
          <iconify-icon icon="ph:house"></iconify-icon>
        </span>
        <span className="inclusively-hidden home-label">Home</span>
      </a>

      <span className="crumb">
        <a href="#">Section B</a>
        <span className="crumbicon">
          <iconify-icon icon="ph:caret-down"></iconify-icon>
          <select
            className="disguised-select"
            title="Navigate to another section"
          >
            <option>Section A</option>
            <option selected>Section B</option>
            <option>Section C</option>
            <option>...</option>
          </select>
        </span>
      </span>

      <span className="crumb">
        <a href="#" aria-current="page">Subsection C</a>
        <span className="crumbicon">
          <iconify-icon icon="ph:caret-down"></iconify-icon>
          <select
            className="disguised-select"
            title="Navigate to another sub collection"
          >
            <option>Subsection A</option>
            <option>Subsection B</option>
            <option selected>Subsection C</option>
            <option>...</option>
          </select>
        </span>
      </span>
    </pp-breadcrumbs>
  ),
};