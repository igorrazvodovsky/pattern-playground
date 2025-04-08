import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import type { HeatExchangerData, Variant } from "./types";
import PasteurizerData from "./data/Pasteurizer.json";
import heatExchangerData from "./data/HeatExchanger.json";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";

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
  title: "Patterns/Focus and Context*",
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

export const ContextualNavigation: Story = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'product-model-navigation';

    type SelectedItem = {
      category: string;
      name: string;
      description?: string;
      id: string;
      type?: string;
    } | null;

    const state: { selectedItem: SelectedItem } = {
      selectedItem: null
    };

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
                  <h3 class="label layout-flex">
                    <iconify-icon icon="ph:cube-bold"></iconify-icon>
                    ${data.card.title}
                  </h3>
                  <button class="button button--plain" is="pp-buton">
                    <iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
                    <span class="inclusively-hidden">Actions</span>
                  </button>
                </div>
                <p class="description">${data.card.description}</p>
                <details open>
                  <summary>Attributes <span class="badge">${(Object.keys(data.card.attributes)).length}</span></summary>
                  <ul class="card__attributes badges">
                    ${Object.entries(data.card.attributes).map(([key, attr]) =>
        html`<span class="badge">${attr.label || key}</span>`
      )}
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

    const renderListView = () => {
      const pasteurizerData = PasteurizerData.flattenedModel.slice(0, 10);

      return html`
        <section class="flow">
          <h2>Recent</h2>
          <ul class="cards layout-grid">
            ${repeat(
        pasteurizerData,
        (item) => html`
                <li>
                  <article class="card">
                    <div class="card__header">
                      <h4 class="label">
                        <a href="#" data-id="${item.id}" @click=${(e: Event) => {
            e.preventDefault();
            const target = e.currentTarget as HTMLElement;
            const id = target.dataset.id;
            if (id) {
              const selectedItem = pasteurizerData.find(item => item.id === id);
              if (selectedItem) {
                state.selectedItem = { ...selectedItem, category: 'pasteurizer' };
                renderView();
              }
            }
          }}>${item.name}</a>
                      </h4>
                      <button class="button button--plain" is="pp-buton">
                        <iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
                        <span class="inclusively-hidden">Actions</span>
                      </button>
                    </div>
                    <p class="description">${item.description}</p>
                  </article>
                </li>
              `
      )}
          </ul>
        </section>
      `;
    };

    const renderView = () => {
      if (state.selectedItem) {
        const template = renderItemDetails(state.selectedItem);
        render(template, container);
      } else {
        const template = renderListView();
        render(template, container);
      }
    };

    renderView();
    return container;
  },
};
