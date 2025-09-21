/**
 * Utilities for robust Shadow DOM traversal and element detection
 */

/**
 * Gets the deepest active element, traversing through shadow roots
 * This is critical for proper focus management in nested shadow DOM scenarios
 * @example
 * // In a nested shadow DOM structure
 * const activeEl = getDeepestActiveElement();
 * console.log(activeEl); // Returns the actual focused element, not the shadow host
 */
export function getDeepestActiveElement(): Element | null {
  let activeElement = document.activeElement;
  let depth = 0;
  const MAX_DEPTH = 10; // Prevent infinite loops in malformed DOM

  while (activeElement?.shadowRoot?.activeElement && depth < MAX_DEPTH) {
    activeElement = activeElement.shadowRoot.activeElement;
    depth++;
  }

  return activeElement;
}

/**
 * Traverses up the DOM tree including shadow DOM boundaries to find the closest element matching a tag name
 * This replaces the basic shadow DOM detection with proper recursive traversal
 * @param element - The element to start searching from
 * @param tagName - The tag name to search for (case-insensitive)
 * @example
 * // Find closest containing dropdown element across shadow boundaries
 * const dropdown = computeClosestContaining(focusedElement, 'pp-dropdown');
 */
export function computeClosestContaining(element: Element | null | undefined, tagName: string): Element | null {
  if (!element) return null;

  const depth = 0;
  const MAX_DEPTH = 20; // Prevent infinite recursion

  function traverseUp(el: Element, targetTag: string, currentDepth: number): Element | null {
    if (currentDepth >= MAX_DEPTH) return null;

    // First try the standard closest() method
    const closest = el.closest(targetTag);
    if (closest) return closest;

    // If not found and we're in a shadow root, traverse up through the shadow boundary
    const rootNode = el.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host) {
      return traverseUp(rootNode.host, targetTag, currentDepth + 1);
    }

    return null;
  }

  return traverseUp(element, tagName, depth);
}

/**
 * Checks if an element is contained within another element, respecting shadow DOM boundaries
 * @param element - The element to check
 * @param container - The potential containing element
 * @example
 * // Check if a deeply nested shadow DOM element is within a dropdown
 * const isInside = isContainedInShadowDOM(deepElement, dropdownElement);
 */
export function isContainedInShadowDOM(element: Element, container: Element): boolean {
  let current: Element | null = element;
  let depth = 0;
  const MAX_DEPTH = 20; // Prevent infinite loops

  while (current && depth < MAX_DEPTH) {
    if (current === container) return true;

    const rootNode = current.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host) {
      current = rootNode.host;
    } else if (current.parentElement) {
      current = current.parentElement;
    } else {
      break;
    }
    depth++;
  }

  // Fallback to native contains for regular DOM or if traversal failed
  return container.contains(element);
}

/**
 * Gets the root containing element, traversing shadow DOM boundaries if needed
 * @param element - The element to find the root container for
 * @example
 * // Get the top-level element containing a nested shadow DOM component
 * const rootElement = getRootContainingElement(nestedElement);
 */
export function getRootContainingElement(element: Element): Element {
  let current = element;
  let depth = 0;
  const MAX_DEPTH = 20; // Prevent infinite loops

  while (depth < MAX_DEPTH) {
    const rootNode = current.getRootNode();
    if (rootNode instanceof ShadowRoot && rootNode.host) {
      current = rootNode.host;
      depth++;
    } else {
      break;
    }
  }

  return current;
}