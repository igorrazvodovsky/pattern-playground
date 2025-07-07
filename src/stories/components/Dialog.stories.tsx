import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import '../../components/modal/modal.ts';

const meta = {
  title: "Components/Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    return (
      <pp-modal>
        <dialog>
          <header>
            <h3>Dialog title</h3>
            <button className="button button--plain" data-close>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>{faker.hacker.phrase()}</p>
          </article>
          <footer>
            <button className="button" autoFocus data-close>Close</button>
          </footer>
        </dialog>
        <button className="button">Open dialog</button>
      </pp-modal>
    );
  },
};

export const Scrolling: Story = {
  render: () => {
    return (
      <pp-modal>
        <dialog>
          <header>
            <h3>Dialog</h3>
            <button className="button button--plain" data-close>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>{faker.lorem.paragraphs(30)}</p>
          </article>
          <footer>
            <button className="button" autoFocus data-close>Close</button>
          </footer>
        </dialog>
        <button className="button">Open dialog</button>
      </pp-modal>
    );
  },
};

export const DisruptiveNotification: Story = {
  render: () => {
    return (
      <pp-modal>
        <dialog>
          <header>
            <h3>Delete project</h3>
            <button className="button button--plain" data-close>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>
              Are you sure you want to delete "Marketing Campaign Q4"? This action cannot be undone.
              All associated files, data, and team access will be permanently removed.
            </p>
          </article>
          <footer>
            <div className="inline-flow">
              <button className="button button--danger" autoFocus>Delete project</button>
              <button className="button button--secondary" data-close>Cancel</button>
            </div>
          </footer>
        </dialog>
        <button className="button button--danger">Delete project</button>
      </pp-modal>
    );
  },
};