import { Elena } from '@elenajs/core';
import { siteTheme } from './diagram.theme.js';

/**
 * @summary A diagram an author wrote out, rendered to inline SVG.
 * @status draft
 * @since 0.0.1
 *
 * Prose reaches a point where a picture carries the shape better than a
 * paragraph would — which branch leads where, what follows what. This takes
 * the diagram as the author described it, in Mermaid's text syntax, and draws
 * it. The element owns its subtree: the rendered SVG replaces whatever was
 * written inside the tag.
 *
 * This is the authored side of the picture-drawing territory, and the reason
 * it isn't in the chart family: `pp-bar-chart` and its siblings take *data*
 * and compute a picture from it, while this one takes a description someone
 * composed by hand and lays it out. Nothing here reads a dataset.
 *
 * Rendering is synchronous once the renderer has arrived — there is no
 * simulation or measurement, just a string to a picture. The renderer itself
 * is another matter: it is ~330 KB and registration is sitewide, so a static
 * import would put it on every page that has no diagram at all. It loads on
 * first use instead, shared across every element on the page.
 */

type Renderer = typeof import('beautiful-mermaid');

let rendererPromise: Promise<Renderer> | undefined;
const loadRenderer = (): Promise<Renderer> => (rendererPromise ??= import('beautiful-mermaid'));

export class PpDiagram extends Elena(HTMLElement) {
  static tagName = 'pp-diagram';

  static props = ['source', 'theme'];

  /** The diagram, in Mermaid syntax. Leading and trailing whitespace is trimmed. */
  source = '';

  /** A named `beautiful-mermaid` theme; empty means the site's own. */
  theme = '';

  // What the current subtree stands for. Guards two things: a prop change that
  // doesn't touch either input must not re-render, and a load that resolves
  // after a newer render started must not overwrite it.
  #rendered: string | null = null;

  updated(): void {
    const source = this.source.trim();
    const key = `${this.theme} ${source}`;
    if (key === this.#rendered) return;
    this.#rendered = key;

    if (!source) {
      this.replaceChildren();
      return;
    }
    void this.#render(source, this.theme, key);
  }

  async #render(source: string, theme: string, key: string): Promise<void> {
    try {
      const { renderMermaidSVG, THEMES } = await loadRenderer();
      if (this.#rendered !== key) return;
      const named = theme ? THEMES[theme as keyof typeof THEMES] : undefined;
      this.innerHTML = renderMermaidSVG(source, named ? { ...named, font: siteTheme.font } : siteTheme);
    } catch (error) {
      console.error('Failed to render diagram:', error);
      if (this.#rendered === key) this.textContent = 'Failed to render diagram.';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-diagram': PpDiagram;
  }
}
