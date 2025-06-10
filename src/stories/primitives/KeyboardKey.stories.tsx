import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Primitives/Keyboard key",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const KeyboardKey: Story = {
  render: () => (
    <>Please press <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>W</kbd> to achieve expected results.</>
  ),
};

export const InAList: Story = {
  render: () => (
    <pp-list style={{maxWidth: '320px'}}>
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
  ),
};