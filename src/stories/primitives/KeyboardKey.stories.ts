import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Primitives/Keyboard key",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const KeyboardKey: Story = {
  render: () => html`Please press <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>W</kbd> to achieve expected results.`,
};

export const InAList: Story = {
  render: () => html`
    <pp-list style="max-width: 320px;">
      <pp-list-item>
        Copy
        <span slot="suffix"><kbd>⌘</kbd> <kbd>C</kbd></span>
      </pp-list-item>
      <pp-list-item>
        Paste
        <span slot="suffix"><kbd>⌘</kbd> <kbd>V</kbd></span>
      </pp-list-item>
      <pp-list-item>
        Find
        <span slot="suffix"><kbd>⌘</kbd> <kbd>F</kbd></span>
      </pp-list-item>
    </pp-list>
  `,
};