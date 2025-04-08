import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import PasteurizerData from "./data/Pasteurizer.json";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";
import { modelItemSchema } from "./types.ts"
import { z } from "zod";

const getAnswer = async () => {
  try {
    console.log("Calling OpenAI API...");
    const response = await callOpenAI("heat exchanger");
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
    container.className = 'flow';
    container.innerHTML = '<div class="loading">Loading response...</div>';

    console.log("Story rendering, about to call getAnswer()");

    // Add a delay to ensure the DOM is ready
    setTimeout(() => {
      getAnswer()
        .then(response => {
          try {
            // Parse the response as JSON
            const responseData = JSON.parse(response);

            // Check if we have a valid model array
            if (responseData && responseData.model && Array.isArray(responseData.model)) {
              // Create a section for the cards
              const cardsSection = document.createElement('section');
              cardsSection.className = 'flow';

              // Add a heading
              const heading = document.createElement('h2');
              heading.textContent = 'API Response';
              cardsSection.appendChild(heading);

              // Create a container for the cards
              const cardsContainer = document.createElement('div');
              cardsContainer.className = 'cards layout-grid';

              // Process each item in the model
              responseData.model.forEach((item: z.infer<typeof modelItemSchema>) => {
                // Create a card for each item
                const cardDiv = document.createElement('div');

                // Create the card article
                const card = document.createElement('article');
                card.className = 'card';

                // Create card header
                const cardHeader = document.createElement('div');
                cardHeader.className = 'card__header';

                // Add title with icon
                const title = document.createElement('h4');
                title.className = 'label layout-flex';
                title.innerHTML = `${item.name}`;

                // Add relationship description
                if (item.relationshipDescription) {
                  const relationshipDescription = document.createElement('div');
                  relationshipDescription.className = 'attribute';
                  relationshipDescription.textContent = item.relationshipDescription;
                  card.appendChild(relationshipDescription);
                }

                card.appendChild(title);

                // Add description
                if (item.description) {
                  const description = document.createElement('p');
                  description.className = 'description';
                  description.textContent = item.description;
                  card.appendChild(description);
                }

                // Add the card to the container
                cardDiv.appendChild(card);
                cardsContainer.appendChild(cardDiv);
              });

              // Add the cards container to the section
              cardsSection.appendChild(cardsContainer);

              // Replace the loading message with the cards
              container.innerHTML = '';
              container.appendChild(cardsSection);
            } else {
              // If the response is not in the expected format, display it as is
              container.innerHTML = `
                <div class="card">
                  <div class="card__header">
                    <h3 class="label">API Response</h3>
                  </div>
                  <p class="description">${response}</p>
                </div>
              `;
            }
          } catch (parseError) {
            // If we can't parse the response as JSON, display it as text
            console.error("Error parsing API response:", parseError);
            container.innerHTML = `
              <div class="card">
                <div class="card__header">
                  <h3 class="label">API Response</h3>
                </div>
                <p class="description">${response}</p>
              </div>
            `;
          }
        })
        .catch(error => {
          container.innerHTML = `
            <div class="card">
              <div class="card__header">
                <h3 class="label">Error</h3>
              </div>
              <p class="description">${error.message}</p>
              <pre>${error.stack}</pre>
            </div>
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

    const handleItemClick = (id: string) => {
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
    };

    const renderItemDetails = (item: SelectedItem) => {
      if (!item) return html``;

      // Find the full item data from PasteurizerData
      const pasteurizerItem = PasteurizerData.flattenedModel.find(modelItem => modelItem.id === item.id);

      if (!pasteurizerItem) return html`<p>Item not found</p>`;

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

        const groups: Record<string, RelationObject[]> = {
          'Parent and Child': [],
          'Operational Partners': [],
          'Component Parts': [],
          'Support Systems': [],
          'Downstream Partners': []
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
            groups['Parent and Child'].push(relationObject);
          } else if (relation.relationshipType.includes('Operational Partner')) {
            groups['Operational Partners'].push(relationObject);
          } else if (relation.relationshipType.includes('Component Part')) {
            groups['Component Parts'].push(relationObject);
          } else if (relation.relationshipType.includes('Support') || relation.relationshipType.includes('CIP')) {
            groups['Support Systems'].push(relationObject);
          } else if (relation.relationshipType.includes('Downstream')) {
            groups['Downstream Partners'].push(relationObject);
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
                        <span class="badge">${attr.label || attr.name}: ${attr.value}${attr.unit || ''}</span>
                      `)}
                    </ul>
                  </details>
                ` : ''}

                ${pasteurizerItem.childrenIds && pasteurizerItem.childrenIds.length > 0 ? html`
                  <details open>
                    <summary>Structure <span class="badge">${pasteurizerItem.childrenIds.length}</span></summary>
                    <pp-table>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${pasteurizerItem.childrenIds.map(childId => {
                            const childItem = PasteurizerData.flattenedModel.find(item => item.id === childId);
                            if (!childItem) return '';
                            return html`
                              <tr>
                                <td>
                                  <a href="#" data-id="${childItem.id}" @click=${(e: Event) => {
                                    e.preventDefault();
                                    handleItemClick(childItem.id);
                                  }}>${childItem.name}</a>
                                </td>
                                <td>${childItem.type}</td>
                                <td class="pp-table-ellipsis">${childItem.description}</td>
                              </tr>
                            `;
                          })}
                        </tbody>
                      </table>
                    </pp-table>
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
              ${Object.entries(relatedGroups).map(([groupName, items]) =>
        items.length > 0 ? html`
                  <div>
                    <details class="borderless" open>
                      <summary class="muted">${groupName}</summary>
                      <ul class="cards cards--grid layout-grid">
                        ${repeat(items, (item) => html`
                          <li>
                            <article class="card">
                              <div class="attribute">${item.relationship}</div>
                              <h4 class="label">
                                <a href="#" data-id="${item.name}" @click=${(e: Event) => {
            e.preventDefault();
            handleItemClick(item.name);
          }}>${item.label}</a>
                              </h4>
                              <small class="description">${item.description}</small>
                            </article>
                          </li>
                        `)}
                      </ul>
                    </details>
                  </div>
                ` : ''
      )}
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
            handleItemClick(item.id);
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
