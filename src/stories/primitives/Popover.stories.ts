import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Primitives/Popover*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Tooltip: Story = {
  render: () => html`
    <button class="button" popovertarget="popover-tooltip" style="anchor-name: --anchor_1">Hover me</button>
    <div id="popover-tooltip" class="tooltip" popover>
      <p>I am a popover with more information. Hit <kbd>esc</kbd> or click away to close me.</p>
    </div>

    <script>
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
    </script>
  `,
};

export const Toast: Story = {
  render: () => html`
    <button class="button" popovertarget="popover-toast">Toast!</button>
    <div id="popover-toast" class="toast" popover>
      <p>I am a popover with more information. Hit <kbd>esc</kbd> or click away to close me.</p>
    </div>
  `,
};

export const Popover: Story = {
  render: () => html`
    <button class="button" popovertarget="popover-1" style="anchor-name: --anchor_2">Click me</button>
    <div id="popover-1" popover>
      <strong>Popover header</strong>
      <p>${faker.hacker.phrase()}</p>
    </div>
  `,
};