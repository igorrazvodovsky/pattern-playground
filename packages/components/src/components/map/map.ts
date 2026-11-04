/**
 * Map (interactive location map) Web Component
 *
 * An Elena host that plots located points on a pannable, zoomable base map.
 * Where the {@link Choropleth} shades whole regions by a quantity, this map
 * answers the *where is it* question — it places named things on tiles the
 * reader can scroll and zoom.
 *
 * It wraps Leaflet. Leaflet reads `document`, injects its own control DOM, and
 * ships a stylesheet that targets `.leaflet-*` in the light tree, so this
 * element lives in the light DOM. Elena supplies props and lifecycle only —
 * there is no template. The map canvas is created imperatively on connect, and
 * Leaflet owns everything inside it; a map moved in the page is rebuilt.
 * Author-provided children are not part of the contract.
 *
 * @example
 * ```html
 * <pp-map .locations="${[{ id: 'a', name: 'Office', lat: 51.5, lng: -0.1 }]}"></pp-map>
 * ```
 */

import { Elena } from '@elenajs/core';
import 'leaflet/dist/leaflet.css';
import type { DivIconOptions } from 'leaflet';
import { escapeHtml, PlacesMap, type MapPlace } from './places-map.js';
import { CARTO_ATTRIBUTION, CARTO_TILE_URL } from './tiles.js';

type ElenaProp = string | { name: string; reflect?: boolean };

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

/** Emitted as `pp-map-select` when the actor picks a location on the map. */
export interface MapSelectDetail {
  location: MapLocation;
}

/**
 * Emitted as `pp-map-focus` on pin hover or keyboard focus, with
 * `location: null` on leaving. The map marks a pin only while `focused-id`
 * names it, so a page that couples views decides what is focused.
 */
export interface MapFocusDetail {
  location: MapLocation | null;
}

type Place = MapPlace & { location: MapLocation };

const toPlace = (location: MapLocation): Place => ({
  id: String(location.id),
  name: location.name,
  lat: location.lat,
  lng: location.lng,
  description: location.description,
  location,
});

const idOf = (id: string | number) => (id === '' ? null : String(id));

/** A design-system pin drawn from CSS rather than Leaflet's bundled PNG. */
const pin: DivIconOptions = {
  className: 'pp-map__pin',
  html: '<span class="pp-map__pin-dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
};

const popup = ({ name, description }: Place) =>
  `<strong>${escapeHtml(name)}</strong>` +
  (description ? `<br><span class="pp-map__popup-desc">${escapeHtml(description)}</span>` : '');

export class MapComponent extends Elena(HTMLElement) {
  static 'tagName' = 'pp-map';

  static 'props': ElenaProp[] = [
    { name: 'locations', reflect: false },
    { name: 'center', reflect: false },
    'zoom',
    'tile-url',
    'attribution',
    'selected-id',
    'focused-id',
    'label',
  ];

  /** The places to plot; each becomes a focusable marker. */
  'locations': MapLocation[] = [];

  /** Initial centre `[lat, lng]`. When omitted, the view fits all markers. */
  'center': [number, number] | undefined = undefined;

  /** Initial zoom level. Ignored when the view is fit to markers. */
  'zoom' = 13;

  'tile-url' = CARTO_TILE_URL;

  /** Attribution HTML for the tile source. Required by most providers. */
  'attribution' = CARTO_ATTRIBUTION;

  /** The active location's id; empty string means no selection. */
  'selected-id': string | number = '';

  /** The focused location's id, marked more lightly than the selection; empty string means none. */
  'focused-id': string | number = '';

  /** Accessible name for the map region. */
  'label' = 'Location map';

  private 'map'?: PlacesMap<Place>;
  private 'canvas'?: HTMLElement;

  // Elena's updated() carries no changed-props map; previous values live here.
  // The PlacesMap keeps its own for places, selection and focus.
  private 'prevLocations'?: MapLocation[];
  private 'places': Place[] = [];
  private 'prevTileUrl'?: string;
  private 'prevAttribution'?: string;

  'connectedCallback'() {
    // Leaflet needs a real container in the document tree before the first
    // render lifecycle runs (firstUpdated fires inside super.connectedCallback).
    if (!this.canvas) {
      this.canvas = document.createElement('div');
      this.canvas.className = 'pp-map__canvas';
      this.canvas.setAttribute('data-map-canvas', '');
      this.append(this.canvas);
    }
    super.connectedCallback();
    // Elena runs firstUpdated once; a map moved in the page is rebuilt here.
    if (!this.map && this.hasAttribute('hydrated')) this.buildMap();
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
  }

  'disconnectedCallback'() {
    super.disconnectedCallback();
    // The canvas goes with the map, which may outlive this call by a running
    // zoom; a reconnect builds both again.
    const canvas = this.canvas;
    this.map?.remove(() => canvas?.remove());
    this.map = undefined;
    this.canvas = undefined;
  }

  private 'init'(): void {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'group');
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.label);
  }

  'firstUpdated'(): void {
    this.buildMap();
  }

  /** Build the Leaflet map once the canvas node exists. */
  private 'buildMap'(): void {
    if (!this.canvas) return;
    this.map = new PlacesMap<Place>(this.canvas, {
      pin,
      popup,
      onPress: (place) => this.select(place.location),
      onFocus: (place) => this.reportFocus(place?.location ?? null),
    });
    this.prevLocations = undefined;
    this.prevTileUrl = CARTO_TILE_URL;
    this.prevAttribution = CARTO_ATTRIBUTION;
    this.updated();
  }

  'updated'(): void {
    if (!this.map) return;
    if (this['tile-url'] !== this.prevTileUrl || this.attribution !== this.prevAttribution) {
      this.prevTileUrl = this['tile-url'];
      this.prevAttribution = this.attribution;
      this.map.setTiles(this['tile-url'], this.attribution);
    }
    if (this.locations !== this.prevLocations) {
      this.prevLocations = this.locations;
      this.places = this.locations.map(toPlace);
    }
    this.map.update({
      places: this.places,
      selected: idOf(this['selected-id']),
      focused: idOf(this['focused-id']),
      center: this.center,
      zoom: this.zoom,
    });
  }

  private 'reportFocus'(loc: MapLocation | null): void {
    this.dispatchEvent(
      new CustomEvent<MapFocusDetail>('pp-map-focus', {
        detail: { location: loc },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Select a location and let the change flow out through `selected-id`. */
  private 'select'(loc: MapLocation): void {
    this['selected-id'] = loc.id;
    this.dispatchEvent(
      new CustomEvent<MapSelectDetail>('pp-map-select', {
        detail: { location: loc },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-map': MapComponent;
  }
}
