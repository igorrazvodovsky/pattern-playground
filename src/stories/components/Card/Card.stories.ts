import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { faker } from '@faker-js/faker';
import headerHtml from "./CardHeader.html?raw";
import basicHtml from "./CardBasic.html?raw";
import footerHtml from "./CardFooter.html?raw";
import footerAlignedHtml from "./CardFooterAligned.html?raw";
import imageHtml from "./CardImage.html?raw";

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
<section class="cards layout-grid">
  <article class="card">
    <img
      slot="image"
      src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
      alt="A kitten sits patiently between a terracotta pot and decorative grasses."
    />
    <h4>${faker.word.words()}</h4>
    <p>${faker.hacker.phrase()}</p>
    <small>${faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
  </article>
</section>
    `,
};

export const Basic: Story = {
  render: () => html`${unsafeHTML(basicHtml)}`,
};

export const Body: Story = {
  render: () => html`
    <section class="cards layout-grid">
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
      <span>${faker.company.name()}</span>
      <span class="card__attributes badges">
        <span class="badge"><span class="badge__label">67.1</span></span>
        <span class="badge"><span class="badge__label">18</span></span>
        <span class="badge"><span class="badge__label">In progress</span></span>
      </span>
    </article>
  </section>
  <br />
  <section class="cards layout-grid">
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
  render: () => html`${unsafeHTML(headerHtml)}`,
};

export const Footer: Story = {
  render: () => html`${unsafeHTML(footerHtml)}`,
};

export const FooterAligned: Story = {
  render: () => html`${unsafeHTML(footerAlignedHtml)}`,
};

export const Image: Story = {
  render: () => html`${unsafeHTML(imageHtml)}`,
};

export const LayoutList: Story = {
  render: () => html`
  <section class="articles articles--list layout-grid">
  ${repeat(cardsData, (card) => html`
    <article class="card">
      <img
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

