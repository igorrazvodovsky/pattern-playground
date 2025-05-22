import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Browsing & sensemaking*/Grouping",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const createCardData = () => {
  return {
    img: faker.image.url(),
    title: faker.word.words({ count: { min: 3, max: 5 } }),
    description: faker.hacker.phrase(),
    date: faker.date.recent().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
};

const cardsData = Array.from({ length: 3 }, () =>
  faker.helpers.multiple(createCardData, { count: faker.number.int({ min: 3, max: 6 }) })
)

export const Grouping: Story = {
  args: {},
  render: () => html`
    <div class="flow layer">
      ${repeat(cardsData, (group, index) => html`
        <div>
          <details class="layer borderless" ?open=${index !== 1}>
            <summary>Group ${String.fromCharCode(65 + index)} <span class="badge">${group.length}</span></summary>
            <ul class="cards layout-grid">
              ${repeat(group, (card) => html`
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
