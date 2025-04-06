import type { Meta, StoryObj } from "@storybook/web-components";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import stuffData from "./stuff.json";
import heatExchangerData from "./HeatExchanger.json";
import type {
  Product,
  Attribute,
  Component,
  Rule,
  MergedItem,
  HeatExchangerData,
  HeatExchangerAttribute,
  Variant,
  SimpleAttribute,
  DimensionAttribute,
  ThroughputAttribute,
  PowerAttribute
} from "./types";

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
  render: () => {
    const formatAttributeValue = (attr: HeatExchangerAttribute): string => {
      if ('value' in attr) {
        if (typeof attr.value === 'object' && 'length' in attr.value) {
          // Handle dimensions
          const dim = attr.value as DimensionAttribute['value'];
          return `${dim.length.value}${dim.length.unit} × ${dim.width.value}${dim.width.unit} × ${dim.height.value}${dim.height.unit}`;
        }
        // Handle simple values
        const val = attr as SimpleAttribute;
        return `${val.value}${val.unit || ''}`;
      } else if ('maxThroughput' in attr) {
        // Handle throughput
        const throughput = attr as ThroughputAttribute;
        return `Max: ${throughput.maxThroughput.value}${throughput.maxThroughput.unit}, Avg: ${throughput.averageThroughput.value}${throughput.averageThroughput.unit}`;
      } else if ('powerConsumption' in attr) {
        // Handle power
        const power = attr as PowerAttribute;
        return `Power: ${power.powerConsumption.value}${power.powerConsumption.unit}, Recovery: ${power.heatRecoveryEfficiency.value}${power.heatRecoveryEfficiency.unit}`;
      }
      return '';
    };

    const formatDimensions = (dimensions: Variant['attributes']['dimensions']): string => {
      return `${dimensions.length.value}${dimensions.length.unit} × ${dimensions.width.value}${dimensions.width.unit} × ${dimensions.height.value}${dimensions.height.unit}`;
    };

    const data = heatExchangerData as HeatExchangerData;

    return html`
      <section class="flow">
        <div class="cards">
          <div>
            <article class="card">
              <div class="card__header">
                <h3 class="label layout-flex"><iconify-icon icon="ph:cube-bold"></iconify-icon> ${data.card.title}</h3>
                <button class="button button--plain" is="pp-buton">
                  <iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
                  <span class="inclusively-hidden">Actions</span>
                </button>
              </div>
              <p class="description">${data.card.description}</p>

              <details open>
                <summary>Attributes</summary>
                <ul class="card__attributes badges">
                  ${Object.entries(data.card.attributes).map(([key, attr]) => {
      const label = attr.label || key;
      const displayValue = formatAttributeValue(attr);
      return html`<span class="badge">${label}: ${displayValue}</span>`;
    })}
                </ul>
              </details>

              <details open>
                <summary>Variants <span class="badge">${data.card.variants.length}</span></summary>
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
                      ${repeat(data.card.variants, (variant) => html`
                        <tr>
                          <td>${variant.label}</td>
                          <td>${variant.description}</td>
                          <td>${variant.attributes.weight.value}${variant.attributes.weight.unit}</td>
                          <td>${formatDimensions(variant.attributes.dimensions)}</td>
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
      </div>
      <div class="cards layout-grid">
        <div>
          <details class="borderless" open>
            <summary class="muted">Parent and Child</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(data.card.relatedObjects.grouped.parentAndChild, (item) => html`
                <li>
                  <article class="card">
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">${item.label}</h4>
                    <small class="description">${item.description}</small>
                  </article>
                </li>
              `)}
            </ul>
          </details>
        </div>

        <div>
          <details class="borderless" open>
            <summary class="muted">Operational Partners</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(data.card.relatedObjects.grouped.operationalPartners, (item) => html`
                <li>
                  <article class="card">
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">${item.label}</h4>
                    <small class="description">${item.description}</small>
                  </article>
                </li>
              `)}
            </ul>
          </details>
        </div>

        <div>
          <details class="borderless" open>
            <summary class="muted">Component Parts</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(data.card.relatedObjects.grouped.componentParts, (item) => html`
                <li>
                  <article class="card">
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">${item.label}</h4>
                    <small class="description">${item.description}</small>
                  </article>
                </li>
              `)}
            </ul>
          </details>
        </div>

        <div>
          <details class="borderless" open>
            <summary class="muted">Support Systems</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(data.card.relatedObjects.grouped.supportSystems, (item) => html`
                <li>
                  <article class="card">
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">${item.label}</h4>
                    <small class="description">${item.description}</small>
                  </article>
                </li>
              `)}
            </ul>
          </details>
        </div>

        <div>
          <details class="borderless" open>
            <summary class="muted">Downstream Partners</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(data.card.relatedObjects.grouped.downstreamPartners, (item) => html`
                <li>
                  <article class="card">
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">${item.label}</h4>
                    <small class="description">${item.description}</small>
                  </article>
                </li>
              `)}
            </ul>
          </details>
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
    `;
  },
};