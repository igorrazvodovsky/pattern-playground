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
            <h3>Confirmation</h3>
            <button className="button button--plain" data-close>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>
              Doing this will make some permanent changes. Are you sure you want to proceed?
            </p>
          </article>
          <footer>
            <div className="inline-flow">
              <button className="button button--danger" autoFocus>Do it!</button>
              <button className="button button--secondary" data-close>Cancel</button>
            </div>
          </footer>
        </dialog>
        <button className="button">Do something</button>
      </pp-modal>
    );
  },
};