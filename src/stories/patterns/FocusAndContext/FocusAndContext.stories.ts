import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import PasteurizerData from "./data/Pasteurizer.json";
import { ModelItem, SelectedItem } from "../../../schemas/index";

// Import services and components
import { fetchAIComponents, createModelItem } from "./services/api-service";
import {
  findModelItem,
  createSelectedItem,
  getRandomItem,
  ensureModelItems,
  getAllRelatedObjects
} from "./services/data-service";
import {
  generateBreadcrumbs,
  renderAttributes,
  renderStructure,
  renderRulesAndConstraints,
  renderAllRelatedObjects
} from "./components/ui-components";

// Define meta information for the story
const meta = {
  title: "Patterns/Focus and context*",
  parameters: {
    async: true,
    controls: { disable: true }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Type definitions
type LocalSelectedItem = SelectedItem | null;
type AppState = {
  selectedItem: LocalSelectedItem;
  aiComponents: ModelItem[];
  loading: boolean;
  error: string | null;
};

/**
 * Handles AI component fetching
 * @param prompt - The prompt to send to the AI
 * @param state - The current application state
 * @param updateState - Function to update the state
 */
const handleAIComponentsFetch = async (
  prompt: string,
  state: AppState,
  updateState: (newState: Partial<AppState>) => void
): Promise<void> => {
  updateState({ loading: true, error: null, aiComponents: [] });

  try {
    await fetchAIComponents(prompt, {
      stream: true,
      onChunk: (chunk: string, isDone: boolean) => {
        try {
          // Parse the accumulated JSON content
          const parsedData = JSON.parse(chunk);

          if (isDone) {
            // Final event - mark loading as complete
            updateState({ loading: false });
            return;
          }

          // Check if we have a new individual component
          if (parsedData.newComponent) {
            // Convert component to our ModelItem format
            const component = parsedData.newComponent as Partial<ModelItem>;
            const modelItem = createModelItem(component, state.aiComponents.length + 1);

            // Add the new component
            updateState({
              aiComponents: [...state.aiComponents, modelItem]
            });
          } else if (parsedData.model && Array.isArray(parsedData.model)) {
            // Convert all components to ModelItem format
            const aiComponents = parsedData.model.map((component: Partial<ModelItem>, index: number) =>
              createModelItem(component, index + 1)
            );

            updateState({
              aiComponents,
              loading: !isDone
            });
          }
        } catch (err) {
          console.warn('Error parsing chunk:', err);
        }
      }
    });
  } catch (error: unknown) {
    updateState({
      error: error instanceof Error ? error.message : 'Failed to fetch data',
      loading: false
    });
  }
};

/**
 * Handles item click events
 * @param id - The ID of the clicked item
 * @param state - The current application state
 * @param updateState - Function to update the state
 */
const handleItemClick = (
  id: string,
  state: AppState,
  updateState: (newState: Partial<AppState>) => void
): void => {
  // Ensure the data conforms to ModelItem type
  const typedItems = ensureModelItems(PasteurizerData.flattenedModel);
  const relatedItem = findModelItem(typedItems, id);

  if (relatedItem) {
    const selectedItem = createSelectedItem(relatedItem);
    updateState({ selectedItem });

    // Use the selected item's name to prompt the AI
    handleAIComponentsFetch(relatedItem.name, { ...state, selectedItem }, updateState);
  }
};

/**
 * Renders the details of a selected item
 * @param item - The selected item
 * @param state - The current application state
 * @param updateState - Function to update the state
 * @returns HTML template for item details
 */
const renderItemDetails = (
  item: SelectedItem,
  state: AppState,
  updateState: (newState: Partial<AppState>) => void
) => {
  if (!item) return html``;

  // Ensure the data conforms to ModelItem type
  const typedItems = ensureModelItems(PasteurizerData.flattenedModel);

  // Find the full item data from PasteurizerData
  const pasteurizerItem = findModelItem(typedItems, item.id);

  if (!pasteurizerItem) return html`<p>Item not found</p>`;

  // Type assertion to ensure pasteurizerItem is treated as ModelItem
  const typedPasteurizerItem = pasteurizerItem as ModelItem;
  // Get combined related objects (both regular and AI-inferred)
  const relatedObjects = getAllRelatedObjects(typedPasteurizerItem, typedItems, state.aiComponents);
  const itemClickHandler = (id: string) => handleItemClick(id, state, updateState);

  // Function to get a child item by ID
  const getChildItem = (id: string) => findModelItem(typedItems, id);

  return html`
    <section class="flow">
      <pp-breadcrumbs role="navigation">
        <a href="">
          <span class="crumbicon">
            <iconify-icon icon="ph:house"></iconify-icon>
          </span>
          <span class="inclusively-hidden">Home</span>
        </a>
        ${generateBreadcrumbs(typedPasteurizerItem)}
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

            ${renderAttributes(pasteurizerItem.attributes)}
            ${renderStructure(pasteurizerItem.childrenIds, itemClickHandler, getChildItem)}
            ${renderRulesAndConstraints(pasteurizerItem.rulesAndConstraints)}
          </article>
        </div>
      </div>

      <ul class="cards layout-grid">
        ${renderAllRelatedObjects(relatedObjects, state.loading, state.error, itemClickHandler)}
      </ul>
    </section>
  `;
};

/**
 * Initializes the application with a random item
 * @param state - The current application state
 * @param updateState - Function to update the state
 */
const initializeWithRandomItem = (
  state: AppState,
  updateState: (newState: Partial<AppState>) => void
) => {
  // Ensure the data conforms to ModelItem type
  const typedItems = ensureModelItems(PasteurizerData.flattenedModel);
  const randomItem = getRandomItem(typedItems);

  if (randomItem) {
    const selectedItem = createSelectedItem(randomItem);
    updateState({ selectedItem });

    // Use the selected item's name to prompt the AI
    handleAIComponentsFetch(randomItem.path.toString(), { ...state, selectedItem }, updateState);
  }
};

/**
 * The main story component for Contextual Navigation
 */
export const ContextualNavigation: Story = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'product-model-navigation';

    // Initialize state
    const state: AppState = {
      selectedItem: null,
      aiComponents: [],
      loading: false,
      error: null
    };

    // Function to update state and re-render
    const updateState = (newState: Partial<AppState>) => {
      Object.assign(state, newState);
      renderView();
    };

    // Function to handle breadcrumb navigation
    const handleBreadcrumbNavigation = (event: CustomEvent) => {
      const path = event.detail.value;
      const typedItems = ensureModelItems(PasteurizerData.flattenedModel);

      // Find the item by path
      const item = typedItems.find(item => item.path.includes(path));

      if (item) {
        const selectedItem = createSelectedItem(item);
        updateState({ selectedItem });
        handleAIComponentsFetch(item.name, { ...state, selectedItem }, updateState);
      }
    };

    // Function to render the view based on current state
    const renderView = () => {
      if (state.selectedItem) {
        const template = renderItemDetails(state.selectedItem, state, updateState);
        render(template, container);

        // Add breadcrumb navigation event listener
        const breadcrumbs = container.querySelector('pp-breadcrumbs');
        if (breadcrumbs) {
          breadcrumbs.addEventListener('breadcrumb-navigation', handleBreadcrumbNavigation as EventListener);
        }
      } else {
        initializeWithRandomItem(state, updateState);
      }
    };

    // Initial render
    renderView();
    return container;
  },
};
