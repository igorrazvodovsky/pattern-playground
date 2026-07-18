/**
 * Map (interactive location map) Web Component
 *
 * A Lit component that plots located points on a pannable, zoomable base map.
 * Where the {@link Choropleth} shades whole regions by a quantity, this map
 * answers the *where is it* question — it places named things on tiles the
 * reader can scroll and zoom, and pairs the picture with a list so the same
 * geography is reachable without sight.
 *
 * It wraps Leaflet. Leaflet reads `document`, injects its own control DOM, and
 * ships a stylesheet that targets `.leaflet-*` in the light tree, so this
 * element renders in the light DOM (decision-ladder rung 3): it owns and
 * renders its own subtree, and author-provided children are clobbered. The map
 * canvas is a static node in the template — Lit never re-touches it, leaving
 * Leaflet free to own everything inside it; only the companion list updates
 * reactively.
 *
 * @example
 * ```html
 * <pp-map .locations="${[{ id: 'a', name: 'Office', lat: 51.5, lng: -0.1 }]}"></pp-map>
 * ```
 */

import { LitElement, html, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** One plotted place. `id` joins a marker to its list entry. */
export interface MapLocation {
  id: string | number;
  name: string;
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
  /** Optional second line, shown in the popup and the list. */
  description?: string;
}

/** Emitted as `pp-map-select` when the active location changes. */
export interface MapSelectDetail {
  location: MapLocation;
  /** What drove the selection. */
  source: 'marker' | 'list' | 'api';
}

/** OpenStreetMap raster tiles — free, attribution required, network-dependent. */
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** A design-system pin drawn from CSS rather than Leaflet's bundled PNG. */
function pinIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: `pp-map__pin${selected ? ' pp-map__pin--selected' : ''}`,
    html: '<span class="pp-map__pin-dot"></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

export class MapComponent extends LitElement {
  /** The places to plot; each becomes a marker and a list entry. */
  @property({ type: Array })
  locations: MapLocation[] = [];

  /** Initial centre `[lat, lng]`. When omitted, the view fits all markers. */
  @property({ type: Array })
  center?: [number, number];

  /** Initial zoom level. Ignored when the view is fit to markers. */
  @property({ type: Number })
  zoom = 13;

  /** Raster tile template URL. Defaults to OpenStreetMap. */
  @property({ type: String, attribute: 'tile-url' })
  tileUrl = OSM_TILE_URL;

  /** Attribution HTML for the tile source. Required by most providers. */
  @property({ type: String })
  attribution = OSM_ATTRIBUTION;

  /** Show the companion location list beside the map. */
  @property({ type: Boolean, reflect: true, attribute: 'show-list' })
  showList = true;

  /** The active location's id. Reflected so it can be set from markup. */
  @property({ type: String, reflect: true, attribute: 'selected-id' })
  selectedId?: string | number;

  /** Accessible name for the map region. */
  @property({ type: String })
  label = 'Location map';

  /** Roving-tabindex cursor into `locations` for the listbox. */
  @state()
  private activeIndex = 0;

  private map?: L.Map;
  private tileLayer?: L.TileLayer;
  private markersById = new Map<string, L.Marker>();
  private resizeObserver?: ResizeObserver;
  private rafHandle = 0;

  /** Light DOM: Leaflet needs a real container in the document tree. */
  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    if (this.rafHandle) cancelAnimationFrame(this.rafHandle);
    this.map?.remove();
    this.map = undefined;
  }

  private init(): void {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.label);
  }

  /** Build the Leaflet map once the canvas node exists. */
  protected firstUpdated(): void {
    const canvas = this.querySelector<HTMLElement>('[data-map-canvas]');
    if (!canvas) return;

    this.map = L.map(canvas, { zoomControl: true, attributionControl: true });
    this.tileLayer = L.tileLayer(this.tileUrl, {
      attribution: this.attribution,
      maxZoom: 19,
    }).addTo(this.map);

    this.renderMarkers();
    this.fitView();

    // The container is often laid out (or resized) after init — in a Storybook
    // panel, a tab, or a flex parent. Leaflet must be told, or tiles misalign.
    this.rafHandle = requestAnimationFrame(() => this.map?.invalidateSize());
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(canvas);
  }

  protected updated(changed: PropertyValues<this>): void {
    if (!this.map) return;
    if (changed.has('locations')) {
      this.renderMarkers();
      this.fitView();
    }
    if (changed.has('tileUrl') || changed.has('attribution')) {
      this.tileLayer?.remove();
      this.tileLayer = L.tileLayer(this.tileUrl, { attribution: this.attribution, maxZoom: 19 })
        .addTo(this.map);
    }
    if (changed.has('selectedId')) {
      this.syncSelection('api');
    }
  }

  /** Rebuild every marker from `locations`. */
  private renderMarkers(): void {
    if (!this.map) return;
    for (const marker of this.markersById.values()) marker.remove();
    this.markersById.clear();

    for (const loc of this.locations) {
      const selected = this.isSelected(loc);
      const marker = L.marker([loc.lat, loc.lng], {
        icon: pinIcon(selected),
        title: loc.name,
        keyboard: false, // the companion list carries keyboard selection
      });
      marker.bindPopup(this.popupHtml(loc));
      marker.on('click', () => this.select(loc, 'marker'));
      marker.addTo(this.map);
      this.markersById.set(String(loc.id), marker);
    }

    const index = this.locations.findIndex((l) => this.isSelected(l));
    if (index >= 0) this.activeIndex = index;
  }

  private popupHtml(loc: MapLocation): string {
    const name = this.escape(loc.name);
    const desc = loc.description ? `<br><span class="pp-map__popup-desc">${this.escape(loc.description)}</span>` : '';
    return `<strong>${name}</strong>${desc}`;
  }

  private escape(value: string): string {
    const el = document.createElement('div');
    el.textContent = value;
    return el.innerHTML;
  }

  /** Frame the view: all markers if any, else the given centre, else the world. */
  private fitView(): void {
    if (!this.map) return;
    if (this.center) {
      this.map.setView(this.center, this.zoom);
    } else if (this.locations.length > 0) {
      const bounds = L.latLngBounds(this.locations.map((l) => [l.lat, l.lng] as [number, number]));
      this.map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
    } else {
      this.map.setView([20, 0], 2);
    }
  }

  private isSelected(loc: MapLocation): boolean {
    return this.selectedId != null && String(loc.id) === String(this.selectedId);
  }

  /** Select a location and let the change flow out through `selectedId`. */
  private select(loc: MapLocation, source: MapSelectDetail['source']): void {
    if (this.isSelected(loc)) return;
    this.selectedId = loc.id;
    this.syncSelection(source);
    this.dispatchEvent(
      new CustomEvent<MapSelectDetail>('pp-map-select', {
        detail: { location: loc, source },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Reflect the current `selectedId` onto markers, the map view, and the list. */
  private syncSelection(source: MapSelectDetail['source']): void {
    const loc = this.locations.find((l) => this.isSelected(l));

    // Repaint pin states.
    for (const [id, marker] of this.markersById) {
      const el = marker.getElement();
      if (el) el.classList.toggle('pp-map__pin--selected', id === String(this.selectedId));
    }

    if (loc && this.map) {
      const marker = this.markersById.get(String(loc.id));
      // Don't wrench the view when the user clicked a marker already in frame.
      if (source !== 'marker') this.map.panTo([loc.lat, loc.lng]);
      marker?.openPopup();
      const index = this.locations.indexOf(loc);
      if (index >= 0) this.activeIndex = index;
    }
  }

  // ---- Companion listbox --------------------------------------------------

  private onListKeydown = (event: KeyboardEvent): void => {
    const count = this.locations.length;
    if (count === 0) return;
    let next = this.activeIndex;
    switch (event.key) {
      case 'ArrowDown': next = Math.min(this.activeIndex + 1, count - 1); break;
      case 'ArrowUp': next = Math.max(this.activeIndex - 1, 0); break;
      case 'Home': next = 0; break;
      case 'End': next = count - 1; break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const loc = this.locations[this.activeIndex];
        if (loc) this.select(loc, 'list');
        return;
      }
      default: return;
    }
    event.preventDefault();
    this.activeIndex = next;
    this.updateComplete.then(() => {
      this.querySelector<HTMLElement>(`[data-option-index="${next}"]`)?.focus();
    });
  };

  render() {
    return html`
      <div class="pp-map__canvas" data-map-canvas></div>
      ${this.showList ? this.renderList() : null}
    `;
  }

  private renderList() {
    return html`
      <ul
        class="pp-map__list"
        role="listbox"
        aria-label=${`${this.label}: ${this.locations.length} location${this.locations.length === 1 ? '' : 's'}`}
        @keydown=${this.onListKeydown}
      >
        ${this.locations.map((loc, index) => {
          const selected = this.isSelected(loc);
          return html`
            <li
              role="option"
              class="pp-map__option"
              data-option-index=${index}
              data-selected=${selected}
              aria-selected=${selected}
              tabindex=${index === this.activeIndex ? 0 : -1}
              @click=${() => this.select(loc, 'list')}
              @focus=${() => { this.activeIndex = index; }}
            >
              <span class="pp-map__option-name">${loc.name}</span>
              ${loc.description
                ? html`<span class="pp-map__option-desc">${loc.description}</span>`
                : null}
            </li>
          `;
        })}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-map': MapComponent;
  }
}
