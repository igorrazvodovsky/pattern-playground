import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Components/Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: () => html`
    <dialog id="dialog-1">
      <header>
        <h3>Dialog title</h3>
        <button onclick="this.closest('dialog').close()"> <iconify-icon class="icon" icon="ph:x"></iconify-icon><span class="inclusively-hidden">Close</span></button>
      </header>
      <article>
        <p>${faker.hacker.phrase()}</p>
      </article>
      <footer>
        <button autofocus onclick="this.closest('dialog').close()">Close</button>
      </footer>
    </dialog>

    <button>Open dialog</button>

    <script>
      const dialog1 = document.querySelector('#dialog-1');
      const openButton1 = dialog1.nextElementSibling;
      openButton1.addEventListener('click', () => dialog1.showModal());
    </script>
  `,
};

export const Scrolling: Story = {
  args: {
    label: "Button",
    loading: false,
    size: "medium"
  },
  render: () => html`
    <dialog id="dialog-2">
      <header>
        <h3>Dialog title</h3>
        <button onclick="this.closest('dialog').close()"> <iconify-icon class="icon" icon="ph:x"></iconify-icon><span class="inclusively-hidden">Close</span></button>
      </header>
      <article>
        <p>${faker.lorem.paragraphs(30)}</p>
      </article>
      <footer>
        <button autofocus onclick="this.closest('dialog').close()">Close</button>
      </footer>
    </dialog>

    <button>Open dialog</button>

    <script>
      const dialog2 = document.querySelector('#dialog-2');
      const openButton2 = dialog2.nextElementSibling;
      openButton2.addEventListener('click', () => dialog2.showModal());
    </script>
  `,
};