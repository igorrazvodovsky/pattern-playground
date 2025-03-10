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

const createAttribute = () => {
  return {
    name: faker.word.words(),
    value: faker.word.words(),
  }
};

const cardsData = faker.helpers.multiple(createCardData, { count: 5 })
const attributes = faker.helpers.multiple(createAttribute, { count: 5 })

const meta = {
  title: "Components/Card",
  argTypes: {
    // backgroundColor: { control: "color" },
    loading: { control: 'boolean' }
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Card: Story = {
  render: () => html`
<article class="card" style="width: 240px">
  <img
    slot="image"
    src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
    alt="A kitten sits patiently between a terracotta pot and decorative grasses."
  />
  <h4>${faker.word.words()}</h4>
  <p>${faker.hacker.phrase()}</p>
  <small>${faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
</article>
    `,
};

export const Basic: Story = {
  render: () => html`
    <section class="cards">
      <article class="card">
        <p>This is just a basic card.</p>
      </article>
    </section>
  `,
};

export const Body: Story = {
  render: () => html`
    <section class="cards">
      <article class="card">
        <h3>${faker.word.words()}</h3>
        <p>${faker.hacker.phrase()}</p>
        <small>${faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
      </article>
    </section>
`,
};

export const Attributes: Story = {
  render: () => html`
  <section class="cards">
    <article class="card">
      <h4>${faker.company.name()}</h4>
      <div class="card__attributes badges">
      ${repeat(attributes, (attribute) => html`<span class="badge"><span class="badge__label">${attribute.name}</span>${attribute.value}</span>`)}
      </div>
    </article>
  </section>
`,
};

export const Header: Story = {
  render: () => html`
    <section class="cards layout-grid">
      <article class="card">
        <div class="card__header">
          <div class="layout-flex">
            <h4>Header title</h4>
            <span class="badge">4</span>
          </div>
          <button class="button" is="pp-buton"> <iconify-icon class="icon" icon="ph:pencil-simple"></iconify-icon><span class="inclusively-hidden">Edit</span></button>
        </div>
        <p>This card has a header.</p>
      </article>
      <article class="card layer">
        <div class="card__header layer">
          <div class="layout-flex">
            <iconify-icon class="icon" icon="ph:music-notes-fill"></iconify-icon>
            <strong>Song title</strong><span class="muted">• Artist</span>
          </div>
          <button class="button" is="pp-buton"> <iconify-icon class="icon" icon="ph:pause-fill"></iconify-icon><span class="inclusively-hidden">Edit</span></button>
        </div>
        <p>This card has a header.</p>
      </article>
    </section>
  `,
};

export const Footer: Story = {
  render: () => html`
    <section class="cards">
      <article class="card">
        <p>This card has a footer.</p>
        <div class="card__footer">
          <div class="layout-flex">

          </div>
          <div>
            <button class="button" is="pp-buton">Action</button> <button class="button" is="pp-buton">Another action</button>
          </div>
        </div>
      </article>
    </section>
  `,
};

export const Image: Story = {
  render: () => html``,
};

export const LayoutList: Story = {
  render: () => html`
  <section class="articles articles--list layout-grid">
  ${repeat(cardsData, (card) => html`
    <article class="card">
      <img
        slot="image"
        src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
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

export const LayoutGrid: Story = {
  render: () => html`
  <section class="articles articles--grid layout-grid">
  ${repeat(cardsData, (card) => html`
    <article class="card">
      <img
        slot="image"
        src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
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

export const LayoutAuto: Story = {
  render: () => html`
  <section class="articles">
  ${repeat(cardsData, (card) => html`
    <article class="card">
      <img
        slot="image"
        src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
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