import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../../utils/icons';
import headerHtml from "./CardHeader.html?raw";
import basicHtml from "./CardBasic.html?raw";
import footerHtml from "./CardFooter.html?raw";
import footerAlignedHtml from "./CardFooterAligned.html?raw";
import imageHtml from "./CardImage.html?raw";
import imageOverlayHtml from "./CardImageOverlay.html?raw";
import actionsHtml from "./CardActions.html?raw";
import indicatorsHtml from "./CardIndicators.html?raw";

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
  render: () => (
    <section className="cards layout-grid">
      <div>
        <article className="card">
          <img
            slot="image"
            src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
            alt="A kitten sits patiently between a terracotta pot and decorative grasses."
          />
          <h4 className="label">{faker.word.words()}</h4>
          <p className="description">{faker.hacker.phrase()}</p>
          <small>{faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
        </article>
      </div>
    </section>
  ),
};

export const Basic: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: basicHtml }} />,
};

export const Attributes: Story = {
  render: () => (
    <>
      <section className="cards cards--list">
        <div>
          <article className="card">
            <span className="label">{faker.company.name()}</span>
            <span className="card__attributes badges">
              <span className="badge"><span className="badge__label">67.1</span></span>
              <span className="badge"><span className="badge__label">18</span></span>
              <span className="badge"><span className="badge__label">In progress</span></span>
            </span>
          </article>
        </div>
      </section>
      <br />
      <section className="cards layout-grid">
        <div>
          <article className="card">
            <h4 className="label">{faker.company.name()}</h4>
            <div className="card__attributes badges">
              {attributes.map((attribute, index) => (
                <span key={index} className="badge">
                  <span className="badge__label">{attribute.name}</span>
                  {attribute.value}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  ),
};

export const Description: Story = {
  render: () => (
    <>
      <section className="cards">
        <div>
          <article className="card">
            <h4 className="label">Basic description</h4>
            <p className="description">{faker.word.words(20)}.</p>
          </article>
        </div>
      </section>
      <br />
      <ul className="cards layout-grid">
        <li>
          <article className="card">
            <h4 className="label">Longer description</h4>
            <pp-dropdown hoist placement="right">
              <p slot="trigger" className="description">{description}.</p>
              <pp-list>
                <div className="description--full flow">{description}.</div>
              </pp-list>
            </pp-dropdown>
          </article>
        </li>
        <li>
          <article className="card">
            <h4 className="label">Editable description</h4>
            <pp-dropdown hoist placement="right">
              <p slot="trigger" className="description">{description}.</p>
              <pp-list>
                <textarea autoFocus name="description" defaultValue={description}></textarea>
              </pp-list>
            </pp-dropdown>
          </article>
        </li>
      </ul>
    </>
  ),
};

export const Header: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: headerHtml }} />,
};

export const Footer: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: footerHtml }} />,
};

export const FooterAligned: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: footerAlignedHtml }} />,
};

export const Image: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: imageHtml }} />,
};

export const ImageOverlay: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: imageOverlayHtml }} />,
};

export const Actions: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: actionsHtml }} />,
};

export const Indicators: Story = {
  render: () => <div dangerouslySetInnerHTML={{ __html: indicatorsHtml }} />,
};

export const LayoutList: Story = {
  render: () => (
    <ul className="articles articles--list layout-grid">
      {cardsData.map((card, index) => (
        <li key={index}>
          <article className="card">
            <img
              src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
              alt="A kitten sits patiently between a terracotta pot and decorative grasses."
            />
            <a href="#">{card.title}</a>
            <p>{card.description}</p>
            <footer>
              <small>{card.date}</small>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  ),
};

export const LayoutGrid: Story = {
  render: () => (
    <ul className="cards cards--grid layout-grid">
      {cardsData.map((card, index) => (
        <li key={index}>
          <article className="card">
            <div style={{ fontSize: 'var(--text-xl)', margin: 'var(--space-m)' }}>
              <iconify-icon className="icon" icon={getRandomIcon()} slot="icon"></iconify-icon>
            </div>
            <a href="#">{card.title}</a>
            <p>{card.description}</p>
            <footer>
              <small>{card.date}</small>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  ),
};

export const LayoutAuto: Story = {
  render: () => (
    <ul className="articles">
      {cardsData.map((card, index) => (
        <li key={index}>
          <article className="card">
            <img
              slot="image"
              src="https://images.unsplash.com/photo-1583524505974-6facd53f4597?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80"
              alt="A kitten sits patiently between a terracotta pot and decorative grasses."
            />
            <a href="#">{card.title}</a>
            <p>{card.description}</p>
            <small>{card.date}</small>
          </article>
        </li>
      ))}
    </ul>
  ),
};