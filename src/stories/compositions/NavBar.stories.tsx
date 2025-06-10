import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Nav bar*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const NavBar: Story = {
  args: {},
  render: () => (
    <nav className="navigation">
      <h1 className="logo">{faker.company.name()}</h1>

      <pp-p-plus>
        <div>
          <button className="button button--plain" is="pp-button">{faker.company.buzzNoun()}</button>
          <button className="button button--plain" is="pp-button">{faker.company.buzzNoun()}</button>
          <button className="button button--plain" is="pp-button">{faker.company.buzzNoun()}</button>
          <button className="button button--plain" is="pp-button">{faker.company.buzzNoun()}</button>
          <button className="button button--plain" is="pp-button">{faker.company.buzzNoun()}</button>
        </div>
      </pp-p-plus>

      <div className="navigation__actions inline-flow">
        <button className="button" is="pp-button">Login</button>
        <button className="button" is="pp-button">Sign up</button>
      </div>
    </nav>
  ),
};