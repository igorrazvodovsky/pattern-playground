import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useRef } from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Components/Drawer",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Drawer: Story = {
  render: () => {
    const drawerRef = useRef<HTMLDialogElement>(null);

    const openDrawer = () => {
      drawerRef.current?.showModal();
    };

    const closeDrawer = () => {
      drawerRef.current?.close();
    };

    const handleDrawerClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const isInDrawer = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      
      if (!isInDrawer) {
        closeDrawer();
      }
    };

    return (
      <>
        <dialog ref={drawerRef} onClick={handleDrawerClick} className="drawer drawer--right">
          <header>
            <h3>Drawer</h3>
            <button className="button button--plain" onClick={closeDrawer}>
              <iconify-icon className="icon" icon="ph:x"></iconify-icon>
              <span className="inclusively-hidden">Close</span>
            </button>
          </header>
          <article>
            Drawer body.
          </article>
          <footer>
            <button className="button" autoFocus onClick={closeDrawer}>Save</button>
          </footer>
        </dialog>

        <button className="button" onClick={openDrawer}>Open drawer</button>
      </>
    );
  },
};

