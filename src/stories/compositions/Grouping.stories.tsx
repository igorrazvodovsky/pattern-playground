import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Browsing & sensemaking*/Grouping",
} satisfies Meta;

export default meta;
type Story = StoryObj;

type CardData = {
  img: string;
  title: string;
  description: string;
  date: string;
}

type GroupData = {
  name: string;
  cards: CardData[];
}

const createCardData = () => {
  return {
    img: faker.image.url(),
    title: faker.word.words({ count: { min: 3, max: 5 } }),
    description: faker.hacker.phrase(),
    date: faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
};

const cardsData: GroupData[] = Array.from({ length: 3 }, () => ({
  name: "",
  cards: faker.helpers.multiple(createCardData, { count: faker.number.int({ min: 3, max: 6 }) })
}))

cardsData[0].name = "Small";
cardsData[1].name = "Medium";
cardsData[2].name = "Large";

export const Cards: Story = {
  args: {},
  render: () => (
    <div className="flow layer">
      <button className="button" is="pp-button">
        <iconify-icon className="icon" icon="ph:stack"></iconify-icon>
        Grouped by <strong>size</strong>
      </button>
      {cardsData.map((group, index) => (
        <div key={index}>
          <details className="layer borderless" open={index !== 1}>
            <summary>{group.name} <span className="badge">{group.cards.length}</span></summary>
            <ul className="cards layout-grid">
              {group.cards.map((card, cardIndex) => (
                <li key={cardIndex}>
                  <article className="card layer">
                    <a className="label" href="#">{card.title}</a>
                    <p className="description">{card.description}</p>
                    {/* <small>{card.date}</small> */}
                  </article>
                </li>
              ))}
            </ul>
          </details>
        </div>
      ))}
    </div>
  ),
};