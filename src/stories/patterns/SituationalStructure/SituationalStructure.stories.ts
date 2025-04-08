import type { Meta, StoryObj } from "@storybook/web-components";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import stuffData from "./data/stuff.json";
import heatExchangerData from "./data/HeatExchanger.json";
import type {
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

    const formatDimensions = (dimensions: Variant['attributes']['dimensions']): string => {
      return `${dimensions.length.value}${dimensions.length.unit} × ${dimensions.width.value}${dimensions.width.unit} × ${dimensions.height.value}${dimensions.height.unit}`;
    };

    const data = heatExchangerData as HeatExchangerData;

    return html`
      <section class="flow">
        <pp-breadcrumbs role="navigation">
          <a href="">
            <span class="crumbicon">
              <iconify-icon icon="ph:house"></iconify-icon>
            </span>
            <span class="inclusively-hidden" class="home-label">Home</span>
          </a>

          <span class="crumb">
            <a href="#">Products</a>
          </span>

          <span class="crumb">
            <a href="#">Pasteurizer 3000</a>
          </span>

          <span class="crumb">
            <a href="" aria-current="page">Heating Assembly</a>
          </span>
        </pp-breadcrumbs>
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
                <summary>Attributes <span class="badge">${(Object.keys(data.card.attributes)).length}</span></summary>
                <ul class="card__attributes badges">
                  ${Object.entries(data.card.attributes).map(([key, attr]) => {
      return html`<span class="badge">${attr.label || key}</span>`;
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
    // Create a container element
    const container = document.createElement('div');
    container.className = 'product-model-navigation';

    // Define a type for the selected item
    type SelectedItem = {
      category: string;
      name: string;
      description?: string;
      help_text?: string;
      message?: string;
      id: string;
      type?: string;
      status?: string;
      data_type?: string;
      unit?: string;
      required?: boolean;
      range?: { min: number; max: number };
      options?: string[];
      default?: string | number | boolean;
    } | null;

    // Define state
    const state: { selectedItem: SelectedItem } = {
      selectedItem: null
    };

    // Helper function to find item by id and category
    const findItemById = (category: string, id: string) => {
      switch (category) {
        case 'products':
          return productData.find(item => item.id === id);
        case 'components':
          return componentsData.find(item => item.id === id);
        case 'attributes':
          return attributesData.find(item => item.id === id);
        case 'rules':
          return rulesData.find(item => item.id === id);
        default:
          return null;
      }
    };

    // Render item details based on category
    const renderItemDetails = (item: SelectedItem) => {
      if (!item) return html``;

      const formatDimensions = (dimensions: Variant['attributes']['dimensions']): string => {
        return `${dimensions.length.value}${dimensions.length.unit} × ${dimensions.width.value}${dimensions.width.unit} × ${dimensions.height.value}${dimensions.height.unit}`;
      };

      const data = heatExchangerData as HeatExchangerData;

      return html`
      <section class="flow">
        <pp-breadcrumbs role="navigation">
          <a href="">
            <span class="crumbicon">
              <iconify-icon icon="ph:house"></iconify-icon>
            </span>
            <span class="inclusively-hidden" class="home-label">Home</span>
          </a>

          <span class="crumb">
            <a href="#">Products</a>
          </span>

          <span class="crumb">
            <a href="#">Pasteurizer 3000</a>
          </span>

          <span class="crumb">
            <a href="" aria-current="page">Heating Assembly</a>
          </span>
        </pp-breadcrumbs>
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
                <summary>Attributes <span class="badge">${(Object.keys(data.card.attributes)).length}</span></summary>
                <ul class="card__attributes badges">
                  ${Object.entries(data.card.attributes).map(([key, attr]) => {
        return html`<span class="badge">${attr.label || key}</span>`;
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
    };

    // Render list view
    const renderListView = () => {
      return html`
        <section class="flow">
          <h2>Recent</h2>
          <ul class="cards layout-grid">
                  ${repeat(
        productData,
        (product) => html`
                      <li>
                        <article class="card">
                        <div class="card__attributes">
                           <span class="badge">${product.type}</span>
                        </div>
                          <h4 class="label">
                            <a data-category="products" data-id="${product.id}" href="">${product.name}</a></h4>
                        </article>
                      </li>
                    `
      )}
                  ${repeat(
        componentsData,
        (component) => html`
                      <li>
                        <article class="card">
                          <div class="card__attributes">
                            <span class="badge">${component.type}</span>
                          </div>
                          <h4 class="label"><a href="#" data-category="components" data-id="${component.id}">${component.name}</a></h4>
                        </article>
                      </li>
                    `
      )}
                  ${repeat(
        attributesData,
        (attribute) => html`
                      <li>
                        <article class="card">
                          <div class="card__attributes">
                            <span class="badge">${attribute.data_type}</span>
                          </div>
                          <h4 class="label"><a data-category="attributes" data-id="${attribute.id}" href="#">${attribute.name}</a></h4>
                        </article>
                      </li>
                    `
      )}
                  ${repeat(
        rulesData,
        (rule) => html`
                      <li>
                        <article class="card">
                          <div class="card__attributes">
                            <span class="badge">${rule.type}</span>
                          </div>
                          <h4 class="label"><a data-category="rules" data-id="${rule.id}" href="#">${rule.name}</a></h4>
                        </article>
                      </li>
                    `
      )}
                </ul>
        </section>
      `;
    };

    // Main render function
    const renderView = () => {
      if (state.selectedItem) {
        const template = renderItemDetails(state.selectedItem);
        render(template, container);
      } else {
        const template = renderListView();
        render(template, container);
      }

      // Add event listeners
      setTimeout(() => {
        if (state.selectedItem) {
          const backBtn = container.querySelector('.back-btn');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              state.selectedItem = null;
              renderView();
            });
          }
        } else {
          const viewDetailsBtns = container.querySelectorAll('.label > a');
          viewDetailsBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              const target = e.target as HTMLElement;
              const category = target.dataset.category;
              const id = target.dataset.id;



              if (category && id) {
                const item = findItemById(category, id);
                if (item) {
                  state.selectedItem = { ...item, category };
                  console.log("TEST");
                  renderView();
                }
              }
            });
          });
        }
      }, 0);
    };

    // Initial render
    setTimeout(() => {
      renderView();
    }, 0);

    return container;
  },
};
