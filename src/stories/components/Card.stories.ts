import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { faker } from '@faker-js/faker';

const createCardData = () => {
  return {
    img: faker.image.url(),
    title: faker.word.words(),
    description: faker.hacker.phrase(),
    date: faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
};

const cardsData = faker.helpers.multiple(createCardData, { count: 5 })


const meta = {
  title: "Components/Card",
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: "color" },
    loading: { control: 'boolean' }
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
  <section class="layout-grid">
  ${repeat(cardsData, (card) => html`
    <article class="card">
      <img
        slot="image"
        src="https://images.unsplash.com/photo-1559209172-0ff8f6d49ff7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
      />
      <a href="#">${card.title}</a>
      <p>${card.description}</p>
      <small>${card.date}</small>
    </article>
  `)}
  </section>
    `,
};
