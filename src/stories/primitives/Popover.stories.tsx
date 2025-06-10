import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Primitives/Popover*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Tooltip: Story = {
  render: () => (
    <>
      <button className="button" popoverTarget="popover-tooltip" style={{ anchorName: '--anchor_1' }}>Hover me</button>
      <div id="popover-tooltip" className="tooltip" popover="true">
        <p>I am a popover with more information. Hit <kbd>esc</kbd> or click away to close me.</p>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          const button = document.querySelector('[popovertarget="popover-tooltip"]');
          let timeout = 0;
          button.addEventListener("mouseenter", () => {
            const target = button.getAttribute("popovertarget");
            const popover = document.querySelector("#" + target);
            timeout = setTimeout(() => {
              popover.showPopover();
            }, 1000);
          });

          button.addEventListener("mouseleave", () => {
            clearTimeout(timeout);
          });
        `
      }} />
    </>
  ),
};

export const Toast: Story = {
  render: () => (
    <>
      <button className="button" popoverTarget="popover-toast">Toast!</button>
      <div id="popover-toast" className="toast" popover="true">
        <p>I am a popover with more information. Hit <kbd>esc</kbd> or click away to close me.</p>
      </div>
    </>
  ),
};

export const Popover: Story = {
  render: () => (
    <>
      <button className="button" popoverTarget="popover-1" style={{ anchorName: '--anchor_2' }}>Click me</button>
      <div id="popover-1" popover="true">
        <strong>Popover header</strong>
        <p>{faker.hacker.phrase()}</p>
      </div>
    </>
  ),
};