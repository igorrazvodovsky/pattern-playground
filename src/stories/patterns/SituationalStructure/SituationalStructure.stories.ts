import type { Meta, StoryObj } from "@storybook/web-components";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { html } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import stuffData from "./data/stuff.json";
import heatExchangerData from "./data/HeatExchanger.json";
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
import { state } from 'lit/decorators.js';
import { LitElement } from 'lit';

// Using the imported JSON data from stuff.json
const productData = stuffData.product_modeling.products;
const attributesData = stuffData.product_modeling.shared_attributes;
const componentsData = stuffData.product_modeling.shared_components;
const rulesData = stuffData.product_modeling.shared_rules;

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

export const ExampleProductModelView: Story = {
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
      </section>
    `;
  },
};

export const ExampleProductModelNavigation: Story = {
  render: () => {
    class ProductModelNavigation extends LitElement {
      @state()
      private selectedItem: MergedItem | null = null;

      private handleItemClick(item: MergedItem) {
        this.selectedItem = item;
        this.requestUpdate();
      }

      private handleBackClick() {
        this.selectedItem = null;
        this.requestUpdate();
      }

      private renderItemDetails(item: MergedItem) {
        switch (item.category) {
          case 'products':
            return html`
              <div class="card">
                <div class="card__header">
                  <button class="button button--plain" @click=${() => this.handleBackClick()}>
                    <iconify-icon icon="ph:arrow-left"></iconify-icon>
                    Back to list
                  </button>
                  <h2>${item.name}</h2>
                </div>
                <div class="card__content">
                  <p class="description">${item.description}</p>
                  <div class="card__attributes">
                    <span class="badge">ID: ${item.id}</span>
                    <span class="badge">Type: ${item.type}</span>
                    <span class="badge">Status: ${item.status}</span>
                  </div>
                </div>
              </div>
            `;
          case 'components':
            return html`
              <div class="card">
                <div class="card__header">
                  <button class="button button--plain" @click=${() => this.handleBackClick()}>
                    <iconify-icon icon="ph:arrow-left"></iconify-icon>
                    Back to list
                  </button>
                  <h2>${item.name}</h2>
                </div>
                <div class="card__content">
                  <p class="description">${item.help_text}</p>
                  <div class="card__attributes">
                    <span class="badge">ID: ${item.id}</span>
                    <span class="badge">Type: ${item.type}</span>
                  </div>
                </div>
              </div>
            `;
          case 'attributes':
            return html`
              <div class="card">
                <div class="card__header">
                  <button class="button button--plain" @click=${() => this.handleBackClick()}>
                    <iconify-icon icon="ph:arrow-left"></iconify-icon>
                    Back to list
                  </button>
                  <h2>${item.name}</h2>
                </div>
                <div class="card__content">
                  <p class="description">${item.help_text}</p>
                  <div class="card__attributes">
                    <span class="badge">ID: ${item.id}</span>
                    <span class="badge">Data Type: ${item.data_type}</span>
                  </div>
                </div>
              </div>
            `;
          case 'rules':
            return html`
              <div class="card">
                <div class="card__header">
                  <button class="button button--plain" @click=${() => this.handleBackClick()}>
                    <iconify-icon icon="ph:arrow-left"></iconify-icon>
                    Back to list
                  </button>
                  <h2>${item.name}</h2>
                </div>
                <div class="card__content">
                  <p class="description">${item.message}</p>
                  <div class="card__attributes">
                    <span class="badge">ID: ${item.id}</span>
                    <span class="badge">Type: ${item.type}</span>
                  </div>
                </div>
              </div>
            `;
          default:
            return null;
        }
      }

      render() {
        return html`
          <section class="flow">
            ${this.selectedItem
            ? this.renderItemDetails(this.selectedItem)
            : html`
                  <h2>Product Model Navigation</h2>
                  <div class="cards layout-grid">
                    <div>
                      <details open>
                        <summary>Products</summary>
                        <ul class="cards cards--grid layout-grid">
                          ${repeat(
              productData.map(item => ({ ...item, category: 'products' } as Product)),
              (product) => html`
                              <li>
                                <article class="card">
                                  <h3 class="label">${product.name}</h3>
                                  <p class="description">${product.description}</p>
                                  <button
                                    class="button button--primary"
                                    @click=${() => this.handleItemClick(product)}
                                  >
                                    View Details
                                  </button>
                                </article>
                              </li>
                            `
            )}
                        </ul>
                      </details>
                    </div>

                    <div>
                      <details open>
                        <summary>Components</summary>
                        <ul class="cards cards--grid layout-grid">
                          ${repeat(
              componentsData.map(item => ({ ...item, category: 'components' } as Component)),
              (component) => html`
                              <li>
                                <article class="card">
                                  <h3 class="label">${component.name}</h3>
                                  <p class="description">${component.help_text}</p>
                                  <span class="badge">${component.type}</span>
                                  <button
                                    class="button button--primary"
                                    @click=${() => this.handleItemClick(component)}
                                  >
                                    View Details
                                  </button>
                                </article>
                              </li>
                            `
            )}
                        </ul>
                      </details>
                    </div>

                    <div>
                      <details open>
                        <summary>Attributes</summary>
                        <ul class="cards cards--grid layout-grid">
                          ${repeat(
              attributesData.map(item => ({ ...item, category: 'attributes' } as Attribute)),
              (attribute) => html`
                              <li>
                                <article class="card">
                                  <h3 class="label">${attribute.name}</h3>
                                  <p class="description">${attribute.help_text}</p>
                                  <button
                                    class="button button--primary"
                                    @click=${() => this.handleItemClick(attribute)}
                                  >
                                    View Details
                                  </button>
                                </article>
                              </li>
                            `
            )}
                        </ul>
                      </details>
                    </div>

                    <div>
                      <details open>
                        <summary>Rules</summary>
                        <ul class="cards cards--grid layout-grid">
                          ${repeat(
              rulesData.map(item => ({ ...item, category: 'rules' } as Rule)),
              (rule) => html`
                              <li>
                                <article class="card">
                                  <h3 class="label">${rule.name}</h3>
                                  <p class="description">${rule.message}</p>
                                  <span class="badge">${rule.type}</span>
                                  <button
                                    class="button button--primary"
                                    @click=${() => this.handleItemClick(rule)}
                                  >
                                    View Details
                                  </button>
                                </article>
                              </li>
                            `
            )}
                        </ul>
                      </details>
                    </div>
                  </div>
                `}
          </section>
        `;
      }
    }

    customElements.define('product-model-navigation', ProductModelNavigation);
    return html`<product-model-navigation></product-model-navigation>`;
  },
};