import type { SelectedReference, UserMetadata } from './types';

/**
 * Simple Web Component adapter for reference content
 * Creates custom HTML for reference items in different scopes
 */

export function isUserReference(reference: any): reference is SelectedReference & { type: 'user' } {
  return reference?.type === 'user';
}

export function createReferencePreviewHTML(reference: SelectedReference): string {
  const { type, label, metadata } = reference;
  const safeMetadata = metadata ?? {};

  if (isUserReference(reference)) {
    const { role, email } = safeMetadata as UserMetadata;
    const initials = label
      ?.split(' ')
      ?.map(n => n?.at(0) ?? '')
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase() ?? 'N/A';

    return `
      <div class="flow">
        <div class="inline-flow">
          <div class="badge" style="width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            ${initials}
          </div>
          <div>
            <h4>${label}</h4>
            ${role ? `<div><small>${role}</small></div>` : ''}
            ${email ? `<div><small>${email}</small></div>` : ''}
          </div>
        </div>
        <footer>
          <button class="button" data-action="escalate" data-target="mid" type="button">
            View profile
          </button>
        </footer>
      </div>
    `;
  }

  return `
    <div class="flow popover">
      <header>
        <h4>${label}</h4>
        <small>${type}</small>
      </header>

      ${Object.keys(safeMetadata).length > 0 ? `
        <dl>
          ${Object.entries(safeMetadata).slice(0, 3).map(([key, value]) => `
            <div>
              <dt><strong>${key}:</strong></dt>
              <dd>${String(value ?? 'N/A')}</dd>
            </div>
          `).join('')}
        </dl>
      ` : ''}
    </div>
  `;
}

export function createReferenceDetailHTML(reference: SelectedReference): string {
  const { type, label, metadata, id } = reference;
  const safeMetadata = metadata ?? {};

  if (isUserReference(reference)) {
    const { role, email, department, location, joinDate } = safeMetadata as UserMetadata;

    const initials = label
      ?.split(' ')
      ?.map(n => n?.at(0) ?? '')
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase() ?? 'N/A';

    return `
      <div class="flow">
        <header class="inline-flow">
          <div class="inline-flow">
            <div class="badge" style="width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              ${initials}
            </div>
            <div>
              <h2>${label}</h2>
              ${role ? `<div><small>${role}</small></div>` : ''}
              ${department ? `<div><small>${department}</small></div>` : ''}
            </div>
          </div>
          <div class="inline-flow">
            <button class="button" data-action="escalate" data-target="maxi" type="button" title="View full profile">
              ↗
            </button>
            <button class="button" data-action="interaction" data-mode="edit" type="button" title="Send message">
              💬
            </button>
          </div>
        </header>

        <div class="flow">
          ${email ? `
            <div>
              <strong>Email:</strong> <a href="mailto:${email}">${email}</a>
            </div>
          ` : ''}
          ${location ? `
            <div>
              <strong>Location:</strong> ${location}
            </div>
          ` : ''}
          ${joinDate ? `
            <div>
              <strong>Joined:</strong> ${joinDate}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  return `
    <div class="flow">
      <header class="inline-flow">
        <div>
          <h2>${label}</h2>
          <small>${type}</small>
        </div>
        <div class="inline-flow">
          <button class="button" data-action="escalate" data-target="maxi" type="button" title="Open full view">
            ↗
          </button>
          <button class="button" data-action="interaction" data-mode="edit" type="button" title="Edit reference">
            ✎
          </button>
        </div>
      </header>

      <div class="flow">
        <div>
          <strong>ID:</strong> ${id}
        </div>

        ${Object.keys(safeMetadata).length > 0 ? `
          <div>
            <h3>Properties</h3>
            <dl>
              ${Object.entries(safeMetadata).map(([key, value]) => `
                <div>
                  <dt><strong>${key}</strong></dt>
                  <dd>${String(value ?? 'N/A')}</dd>
                </div>
              `).join('')}
            </dl>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Register adapter content with Web Components
export function setupReferenceAdapter() {
  // Listen for reference items needing custom content
  document.addEventListener('pp-item-needs-adapter', (event: CustomEvent) => {
    const { element, item, scope, contentType } = event.detail;

    if (contentType !== 'reference' || !item) return;

    let html = '';
    switch (scope) {
      case 'mini':
        html = createReferencePreviewHTML(item);
        break;
      case 'mid':
        html = createReferenceDetailHTML(item);
        break;
      // maxi scope would be implemented similarly
    }

    if (html) {
      // Find adapter slot and inject content
      const adapterSlot = element.querySelector('[slot="adapter"]');
      if (adapterSlot) {
        adapterSlot.innerHTML = html;
      } else {
        // Replace default content
        element.innerHTML = html;
      }
    }
  });
}

// Auto-setup when this module is imported
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupReferenceAdapter);
  } else {
    setupReferenceAdapter();
  }
}