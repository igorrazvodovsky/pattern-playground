import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import PasteurizerData from "./data/Pasteurizer.json";
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

    const state: {
      selectedItem: SelectedItem,
      aiComponents: ModelItem[],
      loading: boolean,
      error: string | null
    } = {
      selectedItem: null,
      aiComponents: [],
      loading: false,
      error: null
    };

    // Function to fetch AI-inferred components based on the selected item's name
    const fetchAIComponents = async (prompt: string) => {
      state.loading = true;
      state.error = null;
      state.aiComponents = [];
      renderView();

      try {
        await callOpenAI(prompt, {
          stream: true,
          onChunk: (chunk: string, isDone: boolean) => {
            try {
              // Parse the accumulated JSON content
              const parsedData = JSON.parse(chunk);

              if (isDone) {
                // Final event - mark loading as complete
                state.loading = false;
                renderView();
                return;
              }

              // Check if we have a new individual component
              if (parsedData.newComponent) {
                // Convert component to our ModelItem format
                const component = parsedData.newComponent as ModelItem;
                const modelItem: ModelItem = {
                  id: `comp-${state.aiComponents.length + 1}`,
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

                // Add the new component and re-render
                state.aiComponents = [...state.aiComponents, modelItem];
                renderView();
              } else if (parsedData.model && Array.isArray(parsedData.model)) {
                // Convert all components to ModelItem format
                state.aiComponents = parsedData.model.map((component: ModelItem, index: number) => ({
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

        // Use the selected item's name to prompt the AI
        fetchAIComponents(relatedItem.name);
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

      // <iconify-icon class="loading-spinner" icon = "ph:spinner-gap-bold" > </iconify-icon>

      // Render AI-inferred components
      const renderAIComponents = () => {
        if (state.loading) {
          return html`
            <div class="card">
              <small class="muted">Discovering connections for ${item.name}...</small>
            </div>
          `;
        }

        if (state.error) {
          return html`
            <div class="error">
              <iconify-icon icon="ph:warning-circle"></iconify-icon>
              <span>${state.error}</span>
            </div>
          `;
        }

        if (state.aiComponents.length === 0) {
          return '';
        }

        return html`
          ${repeat(state.aiComponents, (item) => item.id, (item) => html`
            <li>
              <article class="card">
                <div class="attribute">${item.relationshipDescription || 'Related Component'}</div>
                <h4 class="label">
                  ${item.name}
                </h4>
                <small class="description">${item.description}</small>
              </article>
            </li>
          `)}
        `;
      };

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

          <div class="cards layout-grid">
            <div>
              <details class="borderless" open>
                <summary class="muted">AI-Inferred Connections</summary>
                <ul class="cards cards--grid layout-grid">
                  ${renderAIComponents()}
                </ul>
              </details>
            </div>

            ${relatedGroups ? html`
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
            ` : ''}
          </div>
        </section>
      `;
    };

    const renderView = () => {
      if (state.selectedItem) {
        const template = renderItemDetails(state.selectedItem);
        render(template, container);
      } else {
        // Initialize with a random item from the PasteurizerData
        const randomIndex = Math.floor(Math.random() * PasteurizerData.flattenedModel.length);
        const randomItem = PasteurizerData.flattenedModel[randomIndex];
        if (randomItem) {
          state.selectedItem = {
            category: 'pasteurizer',
            name: randomItem.name,
            description: randomItem.description || '',
            id: randomItem.id,
            type: randomItem.type
          };
          // Use the selected item's name to prompt the AI
          fetchAIComponents(randomItem.name);
          renderView();
        }
      }
    };

    renderView();
    return container;
  },
};
