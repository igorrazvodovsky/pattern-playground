import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import PasteurizerData from "./data/Pasteurizer.json";
// @ts-expect-error - No type definition available for the API module
import { callOpenAI } from "../../../../utils/api.js";

// Define types for the pasteurizer model components
interface Attribute {
  name: string;
  label: string;
  value: string;
  unit: string | null;
}

interface Action {
  actionName: string;
  actionDescription: string;
}

interface RelatedObject {
  referenceId: string;
  relationshipType: string;
  relationshipDescription: string;
}

interface ModelItem {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  path: string[];
  parentId: string | null;
  childrenIds: string[];
  relationshipType: string | null;
  relationshipDescription: string | null;
  attributes: Attribute[];
  rulesAndConstraints: string[];
  possibleActions: Action[];
  relatedObjects: RelatedObject[];
}

const meta = {
  title: "Patterns/Focus and Context*",
  parameters: {
    async: true,
    controls: { disable: true }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;



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

export const StreamingCards: Story = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'streaming-cards flow';

    // Initial state
    const state: {
      prompt: string;
      loading: boolean;
      error: string | null;
      components: ModelItem[];
    } = {
      prompt: 'dairy pasteurization',
      loading: false,
      error: null,
      components: []
    };

    // Function to fetch components
    const fetchComponents = async () => {
      state.loading = true;
      state.error = null;
      state.components = [];
      renderView();

      try {
        await callOpenAI(state.prompt, {
          stream: true,
          onChunk: (chunk: string, isDone: boolean) => {
            console.log('Received chunk:', chunk);
            try {
              // Parse the accumulated JSON content
              const parsedData = JSON.parse(chunk);
              console.log('Parsed data:', parsedData);

              if (isDone) {
                // Final event - mark loading as complete
                state.loading = false;
                renderView();
                return;
              }

              // Check if we have a new individual component
              if (parsedData.newComponent) {
                console.log('New component received:', parsedData.newComponent);
                console.log('Component keys:', Object.keys(parsedData.newComponent));
                // Convert component to our ModelItem format
                const component = parsedData.newComponent as ModelItem;
                const modelItem: ModelItem = {
                  id: `comp-${state.components.length + 1}`,
                  type: 'Component',
                  name: component.name || 'Unnamed Component',
                  label: component.label || '',
                  description: component.description || '',
                  path: [],
                  parentId: null,
                  childrenIds: [],
                  relationshipType: component.relationshipType || null,
                  relationshipDescription: component.relationshipDescription || '',
                  attributes: [],
                  rulesAndConstraints: [],
                  possibleActions: [],
                  relatedObjects: []
                };

                console.log('Created model item:', modelItem);
                console.log('Model item keys:', Object.keys(modelItem));

                // Add the new component and re-render
                state.components = [...state.components, modelItem];
                console.log('Updated components:', state.components);
                renderView();
              } else if (parsedData.model && Array.isArray(parsedData.model)) {
                console.log('Model data received:', parsedData.model);
                // Convert all components to ModelItem format
                state.components = parsedData.model.map((component: ModelItem, index: number) => ({
                  id: `comp-${index + 1}`,
                  type: 'Component',
                  name: component.name || 'Unnamed Component',
                  label: component.label || '',
                  description: component.description || '',
                  path: [],
                  parentId: null,
                  childrenIds: [],
                  relationshipType: component.relationshipType || null,
                  relationshipDescription: component.relationshipDescription || '',
                  attributes: [],
                  rulesAndConstraints: [],
                  possibleActions: [],
                  relatedObjects: []
                }));
                state.loading = !isDone;
                console.log('Updated components from model data:', state.components);
                renderView();
              }
            } catch (err) {
              console.warn('Error parsing chunk:', err);
            }
          }
        });
      } catch (error: unknown) {
        state.error = error instanceof Error ? error.message : 'Failed to fetch data';
        state.loading = false;
        renderView();
      }
    };

    const renderCards = () => {
      console.log('Rendering cards with components:', state.components);
      return html`
        <ul class="cards layout-grid">
          ${repeat(
        state.components,
        (item) => item.id,
        (item) => html`
              <li>
                <article class="card">
                  <div class="attribute">${item.relationshipDescription}</div>
                    <h4 class="label layout-flex">
                      ${item.name}
                    </h4>
                    <small class="description">${item.description}</small>
                  </div>
                </article>
              </li>
            `
      )}
        </ul>
      `;
    };

    const renderView = () => {
      console.log('Rendering view with state:', state);
      const template = html`

        <section class="flow">
          ${state.loading ? html`
            <div class="loading">
              <iconify-icon class="loading-spinner" icon="ph:spinner-gap-bold"></iconify-icon>
              <span>Generating components...</span>
            </div>
          ` : ''}

          ${state.error ? html`
            <div class="error">
              <iconify-icon icon="ph:warning-circle"></iconify-icon>
              <span>${state.error}</span>
            </div>
          ` : ''}

          ${state.components.length > 0 ? renderCards() : ''}
        </section>
      `;

      render(template, container);
    };

    // Initial render
    renderView();

    // Start fetching components
    fetchComponents();

    return container;
  }
};
