import type { Meta, StoryObj } from "@storybook/react";
import React, { useRef } from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Components/Dialog",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openDialog = () => {
      dialogRef.current?.showModal();
    };

    const closeDialog = () => {
      dialogRef.current?.close();
    };

    return (
      <>
        <dialog ref={dialogRef}>
          <header>
            <h3>Dialog title</h3>
            <button className="button button--plain" onClick={closeDialog}>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>{faker.hacker.phrase()}</p>
          </article>
          <footer>
            <button className="button" autoFocus onClick={closeDialog}>Close</button>
          </footer>
        </dialog>

        <button className="button" onClick={openDialog}>Open dialog</button>
      </>
    );
  },
};

export const Scrolling: Story = {
  render: () => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openDialog = () => {
      dialogRef.current?.showModal();
    };

    const closeDialog = () => {
      dialogRef.current?.close();
    };

    return (
      <>
        <dialog ref={dialogRef}>
          <header>
            <h3>Dialog title</h3>
            <button className="button button--plain" onClick={closeDialog}>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            <p>{faker.lorem.paragraphs(30)}</p>
          </article>
          <footer>
            <button className="button" autoFocus onClick={closeDialog}>Close</button>
          </footer>
        </dialog>

        <button className="button" onClick={openDialog}>Open dialog</button>
      </>
    );
  },
};