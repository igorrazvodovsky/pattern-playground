import { html, TemplateResult } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { ModelItem, Attribute, RelationObject } from "../../../../schemas/index";

// Type for related object groups
export type RelationGroups = Record<string, RelationObject[]>;

// Shared card component
const renderCard = (
  content: TemplateResult,
  className: string = '',
  isDashed: boolean = false
) => html`
  <article class="card ${isDashed ? 'dashed' : ''} ${className}">
    ${content}
  </article>
`;

// Shared click handler
const createClickHandler = (id: string, handler: (id: string) => void) => (e: Event) => {
  e.preventDefault();
  handler(id);
};

// Shared error display
const renderError = (error: string) => html`
  <div class="error">
    <iconify-icon icon="ph:warning-circle"></iconify-icon>
    <span>${error}</span>
  </div>
`;

// Shared loading state
const renderLoading = (message: string) => html`
  <small class="muted">${message}</small>
`;

/**
 * Generates breadcrumbs from the path
 * @param pasteurizerItem - The item to generate breadcrumbs for
 * @returns HTML template for breadcrumbs
 */
export const generateBreadcrumbs = (pasteurizerItem: ModelItem) => {
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

/**
 * Renders the attributes section
 * @param attributes - The attributes to render
 * @returns HTML template for attributes
 */
export const renderAttributes = (attributes: Attribute[] | undefined) => {
  if (!attributes || attributes.length === 0) return '';

  return html`
    <details open>
      <summary>Attributes <span class="badge">${attributes.length}</span></summary>
      <ul class="card__attributes badges">
        ${attributes.map(attr => html`
          <span class="badge">${attr.label || attr.name}: ${attr.value}${attr.unit || ''}</span>
        `)}
      </ul>
    </details>
  `;
};

/**
 * Renders the structure section
 * @param childrenIds - The children IDs to render
 * @param handleItemClick - Function to handle item clicks
 * @param getChildItem - Function to get a child item by ID
 * @returns HTML template for structure
 */
export const renderStructure = (
  childrenIds: string[] | undefined,
  handleItemClickFn: (id: string) => void,
  getChildItem: (id: string) => ModelItem | undefined
) => {
  if (!childrenIds || childrenIds.length === 0) return '';

  return html`
    <details open>
      <summary>Structure <span class="badge">${childrenIds.length}</span></summary>
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
            ${childrenIds.map(childId => {
    const childItem = getChildItem(childId);
    if (!childItem) return '';
    return html`
                <tr>
                  <td>
                    <a href="#" data-id="${childItem.id}" @click=${(e: Event) => {
        e.preventDefault();
        handleItemClickFn(childItem.id);
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
  `;
};

/**
 * Renders the rules and constraints section
 * @param rules - The rules to render
 * @returns HTML template for rules
 */
export const renderRulesAndConstraints = (rules: string[] | undefined) => {
  if (!rules || rules.length === 0) return '';

  return html`
    <details open>
      <summary>Rules & Constraints <span class="badge">${rules.length}</span></summary>
      <ul class="card__attributes">
        ${rules.map(rule => html`
          <li>${rule}</li>
        `)}
      </ul>
    </details>
  `;
};

/**
 * Renders AI-inferred components
 * @param loading - Whether the components are loading
 * @param error - Any error that occurred
 * @param aiComponents - The AI components to render
 * @param itemName - The name of the selected item
 * @returns HTML template for AI components
 */
export const renderAIComponents = (
  loading: boolean,
  error: string | null,
  aiComponents: ModelItem[],
  itemName: string
) => {
  if (loading) {
    return renderLoading(`Discovering connections for ${itemName}...`);
  }

  if (error) {
    return renderError(error);
  }

  if (aiComponents.length === 0) {
    return '';
  }

  return html`
    ${repeat(aiComponents, (item) => item.id, (item) => html`
      <li>
        ${renderCard(html`
          <div class="attribute">${item.relationshipDescription || 'Related Component'}</div>
          <h4 class="label">${item.name}</h4>
          <small class="description">${item.description}</small>
        `, '', true)}
      </li>
    `)}
  `;
};

/**
 * Renders the related groups section
 * @param groups - The groups to render
 * @param handleItemClick - Function to handle item clicks
 * @returns HTML template for related groups
 */
export const renderRelatedGroups = (
  groups: RelationGroups | null,
  handleItemClickFn: (id: string) => void
) => {
  if (!groups) return '';

  return html`
    ${Object.entries(groups).map(([groupName, items]) =>
    items.length > 0 ? html`
        <div>
          <details class="borderless" open>
            <summary class="muted">${groupName}</summary>
            <ul class="cards cards--grid layout-grid">
              ${repeat(items, (item) => html`
                <li>
                  ${renderCard(html`
                    <div class="attribute">${item.relationship}</div>
                    <h4 class="label">
                      <a href="#" data-id="${item.name}" @click=${createClickHandler(item.name, handleItemClickFn)}>${item.label}</a>
                    </h4>
                    <small class="description">${item.description}</small>
                  `)}
                </li>
              `)}
            </ul>
          </details>
        </div>
      ` : ''
  )}
  `;
};

/**
 * Renders all related objects (both defined and AI-inferred) in a single container
 * @param relatedObjects - Combined array of related objects
 * @param aiLoading - Whether AI components are loading
 * @param aiError - Any error that occurred during AI fetch
 * @param handleItemClick - Function to handle item clicks
 * @returns HTML template for all related objects
 */
export const renderAllRelatedObjects = (
  relatedObjects: RelationObject[],
  aiLoading: boolean,
  aiError: string | null,
  handleItemClickFn: (id: string) => void
) => {
  if ((!relatedObjects || relatedObjects.length === 0) && !aiError) return '';

  if (aiError) {
    return html`
      <li>
        ${renderCard(html`
          <iconify-icon icon="ph:warning-circle"></iconify-icon>
          <span>${aiError}</span>
        `)}
      </li>
      ${repeat(relatedObjects.filter(obj => !obj.isAIInferred), (item) => item.name, (item) => html`
        <li>
          ${renderCard(html`
            <div class="attribute">${item.relationship}</div>
            <h4 class="label">
              <a href="#" data-id="${item.name}" @click=${createClickHandler(item.name, handleItemClickFn)}>${item.label}</a>
            </h4>
            <small class="description">${item.description}</small>
          `)}
        </li>
      `)}
    `;
  }

  return html`
    ${repeat(relatedObjects, (item) => item.name + (item.isAIInferred ? '-ai' : ''), (item) => html`
      <li>
        ${renderCard(html`
          <div class="attribute">
            ${item.relationship}
            ${item.isAIInferred ? html`<iconify-icon icon="ph:sparkle"></iconify-icon>` : ''}
          </div>
          <h4 class="label">
            <a href="#" data-id="${item.name}" @click=${createClickHandler(item.name, handleItemClickFn)}>${item.label}</a>
          </h4>
          <small class="description">${item.description}</small>
        `, '', item.isAIInferred)}
      </li>
    `)}
    ${aiLoading ? html`
      <li>
        ${renderCard(html`
          <small class="muted">Discovering additional connections...</small>
        `, '', true)}
      </li>
    ` : ''}
  `;
};
