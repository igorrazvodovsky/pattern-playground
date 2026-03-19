import { html, TemplateResult } from "lit";
import { repeat } from 'lit/directives/repeat.js';
import { ModelItem, Attribute, RelationObject } from "../../../../../schemas/index";

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

// Shared details section component
const renderDetailsSection = (
  title: string,
  count: number,
  content: TemplateResult,
  isBorderless: boolean = false
) => html`
  <details class="${isBorderless ? 'borderless' : ''}" open>
    <summary>${title} <span class="badge">${count}</span></summary>
    ${content}
  </details>
`;

// Shared related item card component
const renderRelatedItemCard = (
  item: RelationObject,
  handleItemClickFn: (id: string) => void,
  isAIInferred: boolean = false
) => html`
  <li>
    ${renderCard(html`
      <div class="attribute">
        ${item.relationship}
        ${isAIInferred ? html`<iconify-icon icon="ph:sparkle"></iconify-icon>` : ''}
      </div>
      <h4 class="label">
        <a href="#" data-id="${item.name}" @click=${createClickHandler(item.name, handleItemClickFn)}>${item.label}</a>
      </h4>
      <small class="description">${item.description}</small>
    `, '', isAIInferred)}
  </li>
`;

/**
 * Generates breadcrumbs from the path
 * @param juiceProductionItem - The item to generate breadcrumbs for
 * @returns HTML template for breadcrumbs
 */
export const generateBreadcrumbs = (juiceProductionItem: ModelItem) => {
  if (!juiceProductionItem.path || juiceProductionItem.path.length === 0) {
    return html`
      <span class="crumb">
        <a href="#">Products</a>
      </span>
      <span class="crumb">
        <a href="" aria-current="page">${juiceProductionItem.name}</a>
      </span>
    `;
  }

  return juiceProductionItem.path.map((pathItem, index) => html`
    <span class="crumb">
      <a href="#" ${index === juiceProductionItem.path.length - 1 ? 'aria-current="page"' : ''}>${pathItem}</a>
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

  return renderDetailsSection(
    'Attributes',
    attributes.length,
    html`
      <ul class="card__attributes badges">
        ${attributes.map(attr => html`
          <span class="badge">${attr.label || attr.name}: ${attr.value}${attr.unit || ''}</span>
        `)}
      </ul>
    `
  );
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

  return renderDetailsSection(
    'Structure',
    childrenIds.length,
    html`
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
    `
  );
};

/**
 * Renders the rules and constraints section
 * @param rules - The rules to render
 * @returns HTML template for rules
 */
export const renderRulesAndConstraints = (rules: string[] | undefined) => {
  if (!rules || rules.length === 0) return '';

  return renderDetailsSection(
    'Rules & Constraints',
    rules.length,
    html`
      <ul class="card__attributes">
        ${rules.map(rule => html`
          <li>${rule}</li>
        `)}
      </ul>
    `
  );
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
          <div class="flex">
            <iconify-icon icon="ph:warning-circle"></iconify-icon>
            <span>${aiError}</span>
          </div>
        `)}
      </li>
      ${repeat(
      relatedObjects.filter(obj => !obj.isAIInferred),
      (item) => item.name,
      (item) => renderRelatedItemCard(item, handleItemClickFn)
    )}
    `;
  }

  return html`
    ${repeat(
    relatedObjects,
    (item) => item.name + (item.isAIInferred ? '-ai' : ''),
    (item) => renderRelatedItemCard(item, handleItemClickFn, item.isAIInferred)
  )}
    ${aiLoading ? html`
      <li>
        ${renderCard(html`
          <small class="muted">Discovering additional connections...</small>
        `, '', true)}
      </li>
    ` : ''}
  `;
};
