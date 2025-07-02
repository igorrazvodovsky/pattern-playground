import type { Meta, StoryObj } from "@storybook/react-vite";
import '../../components/modal/modal.ts';

const meta = {
  title: "Components/Drawer",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Drawer: Story = {
  render: () => {
    return (
      <pp-modal>
        <dialog className="drawer drawer--right">
          <header>
            <h3>Drawer</h3>
            <button className="button button--plain" data-close>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <div></div>
          <footer>
            <button className="button" autoFocus data-close>Save</button>
          </footer>
        </dialog>
        <button className="button">Open drawer</button>
      </pp-modal>
    );
  },
};

