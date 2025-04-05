import type { Meta, StoryObj } from "@storybook/web-components";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import stuffData from "./stuff.json";


// Define interfaces for each data type
interface BaseItem {
  category: string;
}

interface Product extends BaseItem {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  category: 'products';
}

interface Attribute extends BaseItem {
  id: string;
  name: string;
  data_type: string;
  help_text: string;
  category: 'attributes';
}

interface Component extends BaseItem {
  id: string;
  name: string;
  type: string;
  help_text: string;
  category: 'components';
}

interface Rule extends BaseItem {
  id: string;
  name: string;
  type: string;
  message: string;
  category: 'rules';
}

type MergedItem = Product | Attribute | Component | Rule;

// Using the imported JSON data from stuff.json
const productData = stuffData.product_modeling.products;
const attributesData = stuffData.product_modeling.shared_attributes;
const componentsData = stuffData.product_modeling.shared_components;
const rulesData = stuffData.product_modeling.shared_rules;

// Merge all data into a single array with category information
const allData: MergedItem[] = [
  ...productData.map(item => ({ ...item, category: 'products' } as Product)),
  ...attributesData.map(item => ({ ...item, category: 'attributes' } as Attribute)),
  ...componentsData.map(item => ({ ...item, category: 'components' } as Component)),
  ...rulesData.map(item => ({ ...item, category: 'rules' } as Rule)),
];

const getAnswer = async () => {
  try {
    console.log("Calling OpenAI API...");
    const response = await callOpenAI("What's the capital of Mars?");
    console.log("Received response:", response);
    return response;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
};

const meta = {
  title: "Patterns/Situational structure*",
  parameters: {
    async: true
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = '<div class="loading">Loading response...</div>';

    console.log("Story rendering, about to call getAnswer()");

    // Add a delay to ensure the DOM is ready
    setTimeout(() => {
      getAnswer()
        .then(response => {
          container.innerHTML = `${response}`;
        })
        .catch(error => {
          container.innerHTML = `
              <p>${error.message}</p>
              <pre>${error.stack}</pre>
          `;
        });
    }, 100);

    return container;
  },
};


export const ProductModelling: Story = {
  render: () => html`
  <section class="flow">
    <div class="cards cards--grid layout-grid">
      <div style="grid-column: span 2">
        <div class="card">
          <div class="grow-wrap">
            <textarea placeholder="Plan, search, @mention" rows="1" name="text" id="text" onInput="this.parentNode.dataset.replicatedValue = this.value"></textarea>
          </div>
          <div class="card__actions">
            <button class="button" is="pp-buton">Continue with…</button>
            <button class="button" is="pp-buton">Create…</button>
            <button class="button" is="pp-buton">Plan…</button>
          </div>
        </div>
      </div>
    </div>

    <h3>All</h3>

      <details class="borderless" open>
        <summary><iconify-icon icon="ph:cube"></iconify-icon> Products <span class="badge">${productData.length}</span></summary>
        <ul class="cards cards--list">
          ${repeat(productData, (item) => html`
            <li>
              <article class="card">
                <a class="label" href="#">${item.name}</a>
                <span class="card__attributes badges">
                  <span class="badge">product</span>
                  <span class="badge">${item.id}</span>
                  <span class="badge">${item.status}</span>
                </span>
              </article>
            </li>
          `)}
        </ul>
      </details>

      <details class="borderless" open>
        <summary><iconify-icon icon="ph:cube"></iconify-icon> Attributes <span class="badge">${attributesData.length}</span></summary>
        <ul class="cards cards--list">
          ${repeat(attributesData, (item) => html`
            <li>
              <article class="card">
                <a class="label" href="#">${item.name}</a>
                <span class="card__attributes badges">
                  <span class="badge">attribute</span>
                  <span class="badge">${item.id}</span>
                  <span class="badge">${item.data_type}</span>
                </span>
              </article>
            </li>
          `)}
        </ul>
      </details>

      <details class="borderless" open>
        <summary><iconify-icon icon="ph:cube"></iconify-icon> Components <span class="badge">${componentsData.length}</span></summary>
        <ul class="cards cards--list">
          ${repeat(componentsData, (item) => html`
            <li>
              <article class="card">
                <a class="label" href="#">${item.name}</a>
                <span class="card__attributes badges">
                  <span class="badge">component</span>
                  <span class="badge">${item.id}</span>
                  <span class="badge">${item.type}</span>
                </span>
              </article>
            </li>
          `)}
        </ul>
      </details>

      <details class="borderless">
        <summary><iconify-icon icon="ph:cube"></iconify-icon> Rules <span class="badge">${rulesData.length}</span></summary>
        <ul class="cards cards--list">
          ${repeat(rulesData, (item) => html`
            <li>
              <article class="card">
                <a class="label" href="#">${item.name}</a>
                <span class="card__attributes badges">
                  <span class="badge">rule</span>
                  <span class="badge">${item.id}</span>
                  <span class="badge">${item.type}</span>
                </span>
              </article>
            </li>
          `)}
        </ul>
      </details>


    <h3>Recent</h3>
    <ul class="cards cards--grid layout-grid">
    ${repeat(allData, (item) => {
    return html`
        <li>
          <article class="card">
            <a class="label" href="#">${item.name}</a>
            <span class="card__attributes badges">
              <span class="badge">${item.category.substring(0, item.category.length - 1)}</span>
              <span class="badge">${item.id}</span>
              ${item.category === 'products' ? html`<span class="badge">${item.status}</span>` : ''}
              ${item.category === 'components' ? html`<span class="badge">${item.type}</span>` : ''}
              ${item.category === 'rules' ? html`<span class="badge">${item.type}</span>` : ''}
            </span>
          </article>
        </li>
      `;
  })}
    </ul>
    </section>
  `,
};