import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import PasteurizerData from "./data/Pasteurizer.json";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";

// Type for the update callback function
type UpdateCallback = (content: string, isDone: boolean) => void;

// For generic JSON rendering
interface JsonObject {
  [key: string]: JsonValue;
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[] | undefined;

// Basic model item interface for type checking
interface BasicModelItem {
  id?: string;
  component_name?: string;
  name?: string;
  description?: string;
  [key: string]: JsonValue;
}

const getAnswer = async (updateCallback: UpdateCallback) => {
  let responseReceived = false;
  const accumulatedModel: BasicModelItem[] = [];
  let lastProcessedIndex = 0;

  try {
    console.log("Calling OpenAI API...");
    // Try to get data from the API
    const response = await callOpenAI("heat exchanger", {
      stream: true,
      onChunk: (accumulated: string, isDone: boolean) => {
        console.log(`Received chunk, isDone: ${isDone}, length: ${accumulated.length}`);
        console.log("Raw chunk content:", accumulated);
        responseReceived = true;

        try {
          // Parse the accumulated content
          const parsedContent = JSON.parse(accumulated);
          console.log("Parsed chunk content:", parsedContent);

          // If we have a model array, process items one at a time
          if (parsedContent && parsedContent.model && Array.isArray(parsedContent.model)) {
            // Process only new items that haven't been added yet
            const newItems = parsedContent.model.slice(lastProcessedIndex);

            // Process each new item with a delay
            newItems.forEach((item: BasicModelItem, index: number) => {
              setTimeout(() => {
                // Generate a unique ID for each item
                const itemId = `item-${Math.random().toString(36).substr(2, 9)}`;
                const newItem = {
                  ...item,
                  id: itemId
                };

                // Only add items we haven't seen before
                if (!accumulatedModel.some(existing =>
                  existing.component_name === newItem.component_name &&
                  existing.description === newItem.description
                )) {
                  console.log("Adding new item:", newItem);
                  accumulatedModel.push(newItem);

                  // Update the UI with just this new item
                  updateCallback(JSON.stringify({
                    model: [newItem] // Send only the new item
                  }), isDone && index === newItems.length - 1);
                }
              }, index * 500); // Add 500ms delay between each item
            });

            // Update the last processed index
            lastProcessedIndex = parsedContent.model.length;

            console.log("Current accumulated model:", accumulatedModel);
          } else {
            console.log("No model array in chunk, updating with raw content");
            // If we don't have a model array yet, update with the full content
            updateCallback(accumulated, isDone);
          }
        } catch (e) {
          console.error("Error parsing chunk:", e);
          // If parsing fails, still update with the raw content
          updateCallback(accumulated, isDone);
        }
      }
    });
    console.log("Completed streaming response");

    // If we get here but no chunks were received (responseReceived is still false),
    // we should still update the UI with the response
    if (!responseReceived && response) {
      console.log("No chunks received, but we have a response. Updating UI directly...");
      let responseStr = response;
      if (typeof response !== 'string') {
        try {
          responseStr = JSON.stringify(response);
        } catch (e) {
          console.error("Failed to stringify response:", e);
        }
      }

      // Force update with the response
      updateCallback(responseStr, true);
    }

    return response;
  } catch (error) {
    console.error("Error calling OpenAI:", error);

    // Show error message rather than using mock data
    updateCallback(JSON.stringify({
      success: false,
      error: `API Error: ${error instanceof Error ? error.message : String(error)}`
    }), true);

    return null;
  }
};

const meta = {
  title: "Patterns/Focus and Context*",
  parameters: {
    async: true,
    controls: { disable: true }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'flow';

    // Create a streaming response container
    const streamingContainer = document.createElement('div');
    streamingContainer.innerHTML = `
      <div class="streaming-content">
        <div class="loading">Loading response...</div>
      </div>
    `;
    container.appendChild(streamingContainer);

    const streamingContent = streamingContainer.querySelector('.streaming-content');

    // Function to update the UI with streaming content
    const updateStreamingUI = (content: string, isDone: boolean) => {
      console.log(`updateStreamingUI called with content length ${content.length}, isDone: ${isDone}`);
      console.log("Raw content:", content);

      try {
        // Clear the loading message on first update
        if (streamingContent!.querySelector('.loading')) {
          streamingContent!.innerHTML = '';
        }

        // Try to parse the JSON
        let jsonData;
        try {
          jsonData = JSON.parse(content);
          console.log("Successfully parsed content as JSON:", jsonData);

          // Extract the data if it's wrapped
          if (jsonData.success === true && jsonData.data) {
            jsonData = jsonData.data;
            console.log("Extracted data from wrapper:", jsonData);
          }
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          streamingContent!.innerHTML = `
            <div class="error">
              <p>Error parsing JSON response.</p>
            </div>
          `;
          return;
        }

        // Check if we have a model to render
        if (jsonData && jsonData.model && Array.isArray(jsonData.model)) {
          console.log("Rendering model with items:", jsonData.model.length);

          // Get or create the cards container
          let cardsDiv = streamingContent!.querySelector('.cards.layout-grid');
          if (!cardsDiv) {
            cardsDiv = document.createElement('div');
            cardsDiv.className = 'cards layout-grid';
            streamingContent!.appendChild(cardsDiv);
          }

          // Keep track of rendered cards by ID
          const renderedCardIds = new Set(
            Array.from(cardsDiv.querySelectorAll('.card[data-item-id]'))
              .map(card => card.getAttribute('data-item-id'))
          );

          console.log("Currently rendered card IDs:", Array.from(renderedCardIds));

          // Process each item in the model array
          jsonData.model.forEach((item: BasicModelItem) => {
            const itemId = item.id?.toString() || `item-${Math.random().toString(36).substr(2, 9)}`;
            console.log("Processing item:", itemId);

            // Skip if this card is already rendered
            if (renderedCardIds.has(itemId)) {
              console.log("Skipping already rendered item:", itemId);
              return;
            }

            console.log("Creating new card for item:", itemId);

            // Create card wrapper div
            const cardWrapper = document.createElement('div');
            cardWrapper.classList.add('card-wrapper');
            cardWrapper.classList.add('fade-in-animation');

            // Create the card article
            const card = document.createElement('article');
            card.className = 'card';
            card.setAttribute('data-item-id', itemId);

            // Add the card header
            const cardTitle = document.createElement('h4');
            cardTitle.className = 'label layout-flex';
            cardTitle.textContent = String(item.component_name || 'Unnamed Item');
            card.appendChild(cardTitle);

            if (item.description) {
              const description = document.createElement('p');
              description.className = 'description';
              description.textContent = item.description;
              card.appendChild(description);
            }

            // Add the card to the wrapper
            cardWrapper.appendChild(card);
            cardsDiv.appendChild(cardWrapper);

            // Mark this card as rendered
            renderedCardIds.add(itemId);
            console.log("Added new card:", itemId);
          });

          // Add some styles for the animation if they don't exist yet
          if (!document.getElementById('streaming-animation-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'streaming-animation-styles';
            styleEl.textContent = `
              .fade-in-animation {
                animation: fadeIn 0.5s ease-in-out;
                opacity: 1;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `;
            document.head.appendChild(styleEl);
          }
        } else if (isDone && (!jsonData || !jsonData.model || !Array.isArray(jsonData.model) || jsonData.model.length === 0)) {
          // Only show "no components" message when we're done and still have no data
          streamingContent!.innerHTML = `
            <div class="error">
              <p>No components found in the response.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error("Error in updateStreamingUI:", error);

        // Show the error
        streamingContent!.innerHTML = `
          <div class="error">
            <h3>Error Rendering Content</h3>
            <p>${error instanceof Error ? error.message : String(error)}</p>
          </div>
        `;
      }
    };

    // Add a delay to ensure the DOM is ready
    setTimeout(() => {
      getAnswer(updateStreamingUI)
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : String(error);

          streamingContent!.innerHTML = `
            <div class="error">
              <h3>Error</h3>
              <p>${errorMessage}</p>
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
