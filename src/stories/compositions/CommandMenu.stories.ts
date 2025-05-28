import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import '../../components/command-menu/command-menu-component';

type Story = StoryObj;

const meta = {
  title: "Compositions/Command menu*",
} satisfies Meta;

export default meta;


export const CommandMenu: Story = {
  args: {},
  render: () => html`
    <pp-command-menu></pp-command-menu>
  `,
};

export const Dialog: Story = {
  args: {},
  render: () => html`
    <!-- <dialog id="cmd"> -->
      <pp-command-menu></pp-command-menu>
    <!-- </dialog> -->

    <!-- Press <kbd>/</kbd> to open a command menu. -->

    <script>
      const dialog = document.querySelector('#cmd');
      const down = (e) => {
        if (e.key === '/') {
          e.preventDefault()
          dialog.showModal();
        }
      }
      document.addEventListener('keydown', down)
    </script>
  `,
};