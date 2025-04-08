import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import PasteurizerData from "./data/Pasteurizer.json";
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

      // Find the full item data from PasteurizerData
      const pasteurizerItem = PasteurizerData.flattenedModel.find(modelItem => modelItem.id === item.id);

      if (!pasteurizerItem) return html`<p>Item not found</p>`;

      // Helper function to format dimensions if they exist
      const formatDimensions = (attributes: Array<{name: string, value: string, unit: string | null, label?: string}>): string => {
        const length = attributes.find(attr => attr.name === 'dimensions_length');
        const width = attributes.find(attr => attr.name === 'dimensions_width');
        const height = attributes.find(attr => attr.name === 'dimensions_height');

        if (length && width && height) {
          return `${length.value}${length.unit || ''} × ${width.value}${width.unit || ''} × ${height.value}${height.unit || ''}`;
        }
        return 'N/A';
      };

      // Generate breadcrumbs from the path
      const generateBreadcrumbs = () => {
        if (!pasteurizerItem.path || pasteurizerItem.path.length === 0) {
          return html`
            <span class="crumb">
              <a href="#">Products</a>
            </span>
            <span class="crumb">
              <a href="" aria-current="page">${pasteurizerItem.name}</a>
            </span>
          `;
        }

        return pasteurizerItem.path.map((pathItem, index) => html`
          <span class="crumb">
            <a href="#" ${index === pasteurizerItem.path.length - 1 ? 'aria-current="page"' : ''}>${pathItem}</a>
          </span>
        `);
      };

      // Group related objects by relationship type
      const groupRelatedObjects = () => {
        if (!pasteurizerItem.relatedObjects || pasteurizerItem.relatedObjects.length === 0) {
          return null;
        }

        type RelationObject = {
          name: string;
          objectType: string;
          label: string;
          description: string;
          relationship: string;
        };

        const groups: {
          parentAndChild: RelationObject[];
          operationalPartners: RelationObject[];
          componentParts: RelationObject[];
          supportSystems: RelationObject[];
          downstreamPartners: RelationObject[];
        } = {
          parentAndChild: [],
          operationalPartners: [],
          componentParts: [],
          supportSystems: [],
          downstreamPartners: []
        };

        pasteurizerItem.relatedObjects.forEach(relation => {
          const relatedItem = PasteurizerData.flattenedModel.find(item => item.id === relation.referenceId);
          if (!relatedItem) return;

          const relationObject = {
            name: relatedItem.name,
            objectType: relatedItem.type,
            label: relatedItem.label || relatedItem.name,
            description: relatedItem.description || '',
            relationship: relation.relationshipType
          };

          // Categorize based on relationship type
          if (relation.relationshipType.includes('Parent') || relation.relationshipType.includes('Child')) {
            groups.parentAndChild.push(relationObject);
          } else if (relation.relationshipType.includes('Operational Partner')) {
            groups.operationalPartners.push(relationObject);
          } else if (relation.relationshipType.includes('Component Part')) {
            groups.componentParts.push(relationObject);
          } else if (relation.relationshipType.includes('Support') || relation.relationshipType.includes('CIP')) {
            groups.supportSystems.push(relationObject);
          } else if (relation.relationshipType.includes('Downstream')) {
            groups.downstreamPartners.push(relationObject);
          }
        });

        return groups;
      };

      const relatedGroups = groupRelatedObjects();

      return html`
        <section class="flow">
          <pp-breadcrumbs role="navigation">
            <a href="">
              <span class="crumbicon">
                <iconify-icon icon="ph:house"></iconify-icon>
              </span>
              <span class="inclusively-hidden">Home</span>
            </a>
            ${generateBreadcrumbs()}
          </pp-breadcrumbs>
          <div class="cards">
            <div>
              <article class="card">
                <div class="card__header">
                  <h3 class="label layout-flex">
                    <iconify-icon icon="ph:cube-bold"></iconify-icon>
                    ${pasteurizerItem.name}
                  </h3>
                  <button class="button button--plain" is="pp-buton">
                    <iconify-icon class="icon" icon="ph:dots-three"></iconify-icon>
                    <span class="inclusively-hidden">Actions</span>
                  </button>
                </div>
                <p class="description">${pasteurizerItem.description}</p>

                ${pasteurizerItem.attributes && pasteurizerItem.attributes.length > 0 ? html`
                  <details open>
                    <summary>Attributes <span class="badge">${pasteurizerItem.attributes.length}</span></summary>
                    <ul class="card__attributes badges">
                      ${pasteurizerItem.attributes.map(attr => html`
                        <span class="badge">${attr.label || attr.name}</span>
                      `)}
                    </ul>
                    ${pasteurizerItem.attributes.some(attr => attr.name.startsWith('dimensions_')) ? html`
                      <p class="dimensions">Dimensions: ${formatDimensions(pasteurizerItem.attributes)}</p>
                    ` : ''}
                  </details>
                ` : ''}

                ${pasteurizerItem.possibleActions && pasteurizerItem.possibleActions.length > 0 ? html`
                  <details open>
                    <summary>Possible Actions <span class="badge">${pasteurizerItem.possibleActions.length}</span></summary>
                    <ul class="card__attributes">
                      ${pasteurizerItem.possibleActions.map(action => html`
                        <li>${action.actionDescription}</li>
                      `)}
                    </ul>
                  </details>
                ` : ''}

                ${pasteurizerItem.rulesAndConstraints && pasteurizerItem.rulesAndConstraints.length > 0 ? html`
                  <details open>
                    <summary>Rules & Constraints <span class="badge">${pasteurizerItem.rulesAndConstraints.length}</span></summary>
                    <ul class="card__attributes">
                      ${pasteurizerItem.rulesAndConstraints.map(rule => html`
                        <li>${rule}</li>
                      `)}
                    </ul>
                  </details>
                ` : ''}
              </article>
            </div>
          </div>

          ${relatedGroups ? html`
            <div class="cards layout-grid">
              ${relatedGroups.parentAndChild.length > 0 ? html`
                <div>
                  <details class="borderless" open>
                    <summary class="muted">Parent and Child</summary>
                    <ul class="cards cards--grid layout-grid">
                      ${repeat(relatedGroups.parentAndChild, (item) => html`
                        <li>
                          <article class="card">
                            <div class="attribute">${item.relationship}</div>
                            <h4 class="label">
                              <a href="#" data-id="${item.objectType === 'Component Part' ? item.name : item.name}" @click=${(e: Event) => {
                                e.preventDefault();
                                const target = e.currentTarget as HTMLElement;
                                const id = target.dataset.id;
                                if (id) {
                                  const relatedItem = PasteurizerData.flattenedModel.find(modelItem =>
                                    modelItem.name === id || modelItem.id === id
                                  );
                                  if (relatedItem) {
                                    state.selectedItem = {
                                      ...relatedItem,
                                      category: 'pasteurizer',
                                      name: relatedItem.name,
                                      description: relatedItem.description || '',
                                      id: relatedItem.id,
                                      type: relatedItem.type
                                    };
                                    renderView();
                                  }
                                }
                              }}>${item.label}</a>
                            </h4>
                            <small class="description">${item.description}</small>
                          </article>
                        </li>
                      `)}
                    </ul>
                  </details>
                </div>
              ` : ''}

              ${relatedGroups.operationalPartners.length > 0 ? html`
                <div>
                  <details class="borderless" open>
                    <summary class="muted">Operational Partners</summary>
                    <ul class="cards cards--grid layout-grid">
                      ${repeat(relatedGroups.operationalPartners, (item) => html`
                        <li>
                          <article class="card">
                            <div class="attribute">${item.relationship}</div>
                            <h4 class="label">
                              <a href="#" data-id="${item.name}" @click=${(e: Event) => {
                                e.preventDefault();
                                const target = e.currentTarget as HTMLElement;
                                const id = target.dataset.id;
                                if (id) {
                                  const relatedItem = PasteurizerData.flattenedModel.find(modelItem =>
                                    modelItem.name === id || modelItem.id === id
                                  );
                                  if (relatedItem) {
                                    state.selectedItem = {
                                      ...relatedItem,
                                      category: 'pasteurizer',
                                      name: relatedItem.name,
                                      description: relatedItem.description || '',
                                      id: relatedItem.id,
                                      type: relatedItem.type
                                    };
                                    renderView();
                                  }
                                }
                              }}>${item.label}</a>
                            </h4>
                            <small class="description">${item.description}</small>
                          </article>
                        </li>
                      `)}
                    </ul>
                  </details>
                </div>
              ` : ''}

              ${relatedGroups.componentParts.length > 0 ? html`
                <div>
                  <details class="borderless" open>
                    <summary class="muted">Component Parts</summary>
                    <ul class="cards cards--grid layout-grid">
                      ${repeat(relatedGroups.componentParts, (item) => html`
                        <li>
                          <article class="card">
                            <div class="attribute">${item.relationship}</div>
                            <h4 class="label">
                              <a href="#" data-id="${item.name}" @click=${(e: Event) => {
                                e.preventDefault();
                                const target = e.currentTarget as HTMLElement;
                                const id = target.dataset.id;
                                if (id) {
                                  const relatedItem = PasteurizerData.flattenedModel.find(modelItem =>
                                    modelItem.name === id || modelItem.id === id
                                  );
                                  if (relatedItem) {
                                    state.selectedItem = {
                                      ...relatedItem,
                                      category: 'pasteurizer',
                                      name: relatedItem.name,
                                      description: relatedItem.description || '',
                                      id: relatedItem.id,
                                      type: relatedItem.type
                                    };
                                    renderView();
                                  }
                                }
                              }}>${item.label}</a>
                            </h4>
                            <small class="description">${item.description}</small>
                          </article>
                        </li>
                      `)}
                    </ul>
                  </details>
                </div>
              ` : ''}

              ${relatedGroups.supportSystems.length > 0 ? html`
                <div>
                  <details class="borderless" open>
                    <summary class="muted">Support Systems</summary>
                    <ul class="cards cards--grid layout-grid">
                      ${repeat(relatedGroups.supportSystems, (item) => html`
                        <li>
                          <article class="card">
                            <div class="attribute">${item.relationship}</div>
                            <h4 class="label">
                              <a href="#" data-id="${item.name}" @click=${(e: Event) => {
                                e.preventDefault();
                                const target = e.currentTarget as HTMLElement;
                                const id = target.dataset.id;
                                if (id) {
                                  const relatedItem = PasteurizerData.flattenedModel.find(modelItem =>
                                    modelItem.name === id || modelItem.id === id
                                  );
                                  if (relatedItem) {
                                    state.selectedItem = {
                                      ...relatedItem,
                                      category: 'pasteurizer',
                                      name: relatedItem.name,
                                      description: relatedItem.description || '',
                                      id: relatedItem.id,
                                      type: relatedItem.type
                                    };
                                    renderView();
                                  }
                                }
                              }}>${item.label}</a>
                            </h4>
                            <small class="description">${item.description}</small>
                          </article>
                        </li>
                      `)}
                    </ul>
                  </details>
                </div>
              ` : ''}

              ${relatedGroups.downstreamPartners.length > 0 ? html`
                <div>
                  <details class="borderless" open>
                    <summary class="muted">Downstream Partners</summary>
                    <ul class="cards cards--grid layout-grid">
                      ${repeat(relatedGroups.downstreamPartners, (item) => html`
                        <li>
                          <article class="card">
                            <div class="attribute">${item.relationship}</div>
                            <h4 class="label">
                              <a href="#" data-id="${item.name}" @click=${(e: Event) => {
                                e.preventDefault();
                                const target = e.currentTarget as HTMLElement;
                                const id = target.dataset.id;
                                if (id) {
                                  const relatedItem = PasteurizerData.flattenedModel.find(modelItem =>
                                    modelItem.name === id || modelItem.id === id
                                  );
                                  if (relatedItem) {
                                    state.selectedItem = {
                                      ...relatedItem,
                                      category: 'pasteurizer',
                                      name: relatedItem.name,
                                      description: relatedItem.description || '',
                                      id: relatedItem.id,
                                      type: relatedItem.type
                                    };
                                    renderView();
                                  }
                                }
                              }}>${item.label}</a>
                            </h4>
                            <small class="description">${item.description}</small>
                          </article>
                        </li>
                      `)}
                    </ul>
                  </details>
                </div>
              ` : ''}
            </div>
          ` : ''}
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
