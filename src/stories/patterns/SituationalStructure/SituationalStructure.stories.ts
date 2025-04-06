import type { Meta, StoryObj } from "@storybook/web-components";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import stuffData from "./stuff.json";
import heatExchangerData from "./HeatExchanger.json";


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


export const ExampleProductModelNavigation: Story = {
  render: () => html`
  <section class="flow">
    <div class="cards layout-grid">
      <div style="grid-column: span 3">
        <article class="card">
          <div class="card__header">
            <div class="layout-flex">
              <iconify-icon icon="ph:cube"></iconify-icon>
              <h3 class="label">${heatExchangerData.card.title}</h3>
            </div>
            <button class="button button--plain" is="pp-buton">
              <iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
              <span class="inclusively-hidden">Actions</span>
            </button>
          </div>
          <p class="description">${heatExchangerData.card.description}</p>

          <details open>
            <summary>Attributes</summary>
            <ul class="card__attributes badges">
              ${Object.entries(heatExchangerData.card.attributes).map(([key, attr]) => {
    const label = 'label' in attr ? attr.label : key;
    let displayValue = '';

    if ('value' in attr && typeof attr.value === 'object') {
      // Handle nested objects like dimensions
      displayValue = Object.entries(attr.value)
        .filter(([dimKey]) => dimKey !== 'label')
        .map(([, dimValue]) => {
          const val = dimValue as { value: number | string; unit?: string };
          return `${val.value}${val.unit || ''}`;
        })
        .join(' × ');
    } else if ('value' in attr) {
      // Handle simple values
      const val = attr as { value: number | string; unit?: string };
      displayValue = `${val.value}${val.unit || ''}`;
    } else if ('maxThroughput' in attr) {
      // Handle production capacity
      displayValue = `Max: ${attr.maxThroughput.value}${attr.maxThroughput.unit}, Avg: ${attr.averageThroughput.value}${attr.averageThroughput.unit}`;
    } else if ('powerConsumption' in attr) {
      // Handle energy efficiency
      displayValue = `Power: ${attr.powerConsumption.value}${attr.powerConsumption.unit}, Recovery: ${attr.heatRecoveryEfficiency.value}${attr.heatRecoveryEfficiency.unit}`;
    }

    return html`<span class="badge">${label}: ${displayValue}</span>`;
  })}
            </ul>
          </details>

          <details open>
            <summary>Variants <span class="badge">${heatExchangerData.card.variants.length}</span></summary>
            <pp-table>
              <table>
                <thead>
                  <tr>
                    <th>Variant</th>
                    <th>Description</th>
                    <th>Weight</th>
                    <th>Dimensions</th>
                    <th>Efficiency</th>
                    <th>Inspection Interval</th>
                    <th>Lifetime</th>
                  </tr>
                </thead>
                <tbody>
                  ${repeat(heatExchangerData.card.variants, (variant) => html`
                    <tr>
                      <td>${variant.label}</td>
                      <td>${variant.description}</td>
                      <td>${variant.attributes.weight.value}${variant.attributes.weight.unit}</td>
                      <td>${Object.entries(variant.attributes.dimensions)
      .filter(([dimKey]) => dimKey !== 'label')
      .map(([, dimValue]) => {
        const val = dimValue as { value: number; unit: string };
        return `${val.value}${val.unit}`;
      })
      .join(' × ')}</td>
                      <td>${variant.attributes.thermalEfficiency.value}${variant.attributes.thermalEfficiency.unit}</td>
                      <td>${variant.predictiveMaintenance.serviceSchedule.inspectionInterval}</td>
                      <td>${variant.predictiveMaintenance.replacementSchedule.expectedLifetime}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </pp-table>
          </details>
        </article>
      </div>
    </div>

    <h3>By type</h3>
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