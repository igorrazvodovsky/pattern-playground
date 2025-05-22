import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
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

export const Grouping: Story = {
  args: {},
  render: () => html`
    <div class="flow layer">
      <button class="button" is="pp-button">
        <iconify-icon class="icon" icon="ph:stack"></iconify-icon>
        Grouped by <strong>size</strong>
      </button>
      ${repeat(cardsData, (group, index) => html`
        <div>
          <details class="layer borderless" ?open=${index !== 1}>
            <summary>${group.name} <span class="badge">${group.cards.length}</span></summary>
            <ul class="cards layout-grid">
              ${repeat(group.cards, (card) => html`
                <li>
                  <article class="card layer">
                    <a class="label" href="#">${card.title}</a>
                    <p class="description">${card.description}</p>
                    <!-- <small>${card.date}</small> -->
                  </article>
                </li>
              `)}
            </ul>
          </details>
        </div>
      `)}
    </div>
  `,
};
