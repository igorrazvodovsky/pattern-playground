/**
 * Map (interactive location map) Web Component
 *
 * A Lit component that plots located points on a pannable, zoomable base map.
 * Where the {@link Choropleth} shades whole regions by a quantity, this map
 * answers the *where is it* question — it places named things on tiles the
 * reader can scroll and zoom.
 *
 * It wraps Leaflet. Leaflet reads `document`, injects its own control DOM, and
 * ships a stylesheet that targets `.leaflet-*` in the light tree, so this
 * element renders in the light DOM (decision-ladder rung 3): it owns and
 * renders its own subtree, and author-provided children are clobbered. The map
 * canvas is a static node in the template — Lit never re-touches it, leaving
 * Leaflet free to own everything inside it.
 *
 * @example
 * ```html
 * <pp-map .locations="${[{ id: 'a', name: 'Office', lat: 51.5, lng: -0.1 }]}"></pp-map>
 * ```
 */

import { LitElement, html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/** One plotted place. `id` identifies its marker for selection. */
export interface MapLocation {
  id: string | number;
  name: string;
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
  /** Optional second line, shown in the popup and the pin's accessible name. */
  description?: string;
}

/** Emitted as `pp-map-select` when the active location changes. */
export interface MapSelectDetail {
  location: MapLocation;
  /** What drove the selection. */
  source: 'marker' | 'api';
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
  /** The places to plot; each becomes a focusable marker. */
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

  /** The active location's id. Reflected so it can be set from markup. */
  @property({ type: String, reflect: true, attribute: 'selected-id' })
  selectedId?: string | number;

  /** Accessible name for the map region. */
  @property({ type: String })
  label = 'Location map';

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
      });
      marker.bindPopup(this.popupHtml(loc));
      marker.on('click', () => this.select(loc, 'marker'));
      marker.addTo(this.map);
      this.markersById.set(String(loc.id), marker);

      // Leaflet's keyboard option (on by default) makes each pin a focusable
      // role="button". Give it an accessible name, reflect the selected state,
      // and wire Enter/Space to selection ourselves — Leaflet doesn't activate
      // divIcon markers from the keyboard — so a keyboard or screen-reader user
      // can reach and choose places without a pointer.
      const el = marker.getElement();
      if (el) {
        el.setAttribute('aria-label', this.markerLabel(loc));
        if (selected) el.setAttribute('aria-current', 'true');
        el.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.select(loc, 'marker');
          }
        });
      }
    }
  }

  /** Accessible name for a pin: the place name, plus its detail line if any. */
  private markerLabel(loc: MapLocation): string {
    return loc.description ? `${loc.name} — ${loc.description}` : loc.name;
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

  /** Reflect the current `selectedId` onto the markers and the map view. */
  private syncSelection(source: MapSelectDetail['source']): void {
    const loc = this.locations.find((l) => this.isSelected(l));

    // Repaint pin states.
    for (const [id, marker] of this.markersById) {
      const el = marker.getElement();
      if (!el) continue;
      const isSelected = id === String(this.selectedId);
      el.classList.toggle('pp-map__pin--selected', isSelected);
      if (isSelected) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    }

    if (loc && this.map) {
      const marker = this.markersById.get(String(loc.id));
      // Don't wrench the view when the user clicked a marker already in frame.
      if (source !== 'marker') this.map.panTo([loc.lat, loc.lng]);
      marker?.openPopup();
    }
  }

  render() {
    return html`<div class="pp-map__canvas" data-map-canvas></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-map': MapComponent;
  }
}
