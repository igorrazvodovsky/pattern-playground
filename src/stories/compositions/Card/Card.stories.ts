import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { faker } from '@faker-js/faker';
import headerHtml from "./CardHeader.html?raw";
import basicHtml from "./CardBasic.html?raw";
import footerHtml from "./CardFooter.html?raw";
import footerAlignedHtml from "./CardFooterAligned.html?raw";
import imageHtml from "./CardImage.html?raw";
import imageOverlayHtml from "./CardImageOverlay.html?raw";
import actionsHtml from "./CardActions.html?raw";
import { getRandomIcon } from '../../utils/icons';

const createCardData = () => {
  return {
    img: faker.image.url(),
    title: faker.word.words({ count: { min: 3, max: 5 } }),
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
const description = faker.word.words(50);

const meta = {
  title: "Compositions/Card*",
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
  <div>
    <article class="card">
      <img
        slot="image"
        src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
        alt="A kitten sits patiently between a terracotta pot and decorative grasses."
      />
      <h4 class="label">${faker.word.words()}</h4>
      <p class="description">${faker.hacker.phrase()}</p>
      <small>${faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
    </article>
  </div>
</section>
    `,
};

export const Basic: Story = {
  render: () => html`${unsafeHTML(basicHtml)}`,
};

export const Attributes: Story = {
  render: () => html`
  <section class="cards cards--list">
    <div>
      <article class="card">
        <span class="label">${faker.company.name()}</span>
        <span class="card__attributes badges">
          <span class="badge"><span class="badge__label">67.1</span></span>
          <span class="badge"><span class="badge__label">18</span></span>
          <span class="badge"><span class="badge__label">In progress</span></span>
        </span>
      </article>
    </div>
  </section>
  <br />
  <section class="cards layout-grid">
    <div>
      <article class="card">
        <h4 class="label">${faker.company.name()}</h4>
        <div class="card__attributes badges">
        ${repeat(attributes, (attribute) => html`<span class="badge"><span class="badge__label">${attribute.name}</span>${attribute.value}</span>`)}
        </div>
      </article>
    </div>
  </section>
`,
};

export const Description: Story = {
  render: () => html`
  <section class="cards">
    <div>
      <article class="card">
        <h4 class="label">Basic description</h4>
        <p class="description">${faker.word.words(20)}.</p>
      </article>
    </div>
  </section>
  <br />
  <ul class="cards layout-grid">
    <li>
      <article class="card">
        <h4 class="label">Longer description</h4>
        <pp-dropdown hoist placement="right">
          <p slot="trigger" class="description">${description}.</p>
          <pp-list>
            <div class="description--full flow">${description}.</div>
          </pp-list>
        </pp-dropdown>
      </article>
    </li>
    <li>
      <article class="card">
        <h4 class="label">Editable description</h4>
        <pp-dropdown hoist placement="right">
          <p for="description" slot="trigger" class="description">${description}.</p>
          <pp-list>
            <textarea autofocus name="description">${description}</textarea>
          </pp-list>
        </pp-dropdown>
      </article>
    </li>
  </ul>
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

export const ImageOverlay: Story = {
  render: () => html`${unsafeHTML(imageOverlayHtml)}`,
};

export const Actions: Story = {
  render: () => html`${unsafeHTML(actionsHtml)}`,
};

export const LayoutList: Story = {
  render: () => html`
  <ul class="articles articles--list layout-grid">
  ${repeat(cardsData, (card) => html`
    <li>
      <article class="card">
        <img
          src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
          alt="A kitten sits patiently between a terracotta pot and decorative grasses."
        />
        <a href="#">${card.title}</a>
        <p>${card.description}</p>
        <footer>
          <small>${card.date}</small>
        </footer>
      </article>
    </li>
  `)}
  </ul>
    `,
};

export const LayoutGrid: Story = {
  render: () => html`
  <ul class="cards cards--grid layout-grid">
  ${repeat(cardsData, (card) => html`
    <li>
      <article class="card">
        <div style="font-size: var(--text-xl); margin: var(--space-m)">
          <iconify-icon class="icon" icon="${getRandomIcon()}" slot="icon"></iconify-icon>
        </div>
        <a href="#">${card.title}</a>
        <p>${card.description}</p>
        <footer>
          <small>${card.date}</small>
        </footer>
      </article>
    </li>
  `)}
  </ul>
    `,
};

export const LayoutAuto: Story = {
  render: () => html`
  <ul class="articles">
  ${repeat(cardsData, (card) => html`
    <li>
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
    </li>
  `)}
  </ul>
    `,
};

