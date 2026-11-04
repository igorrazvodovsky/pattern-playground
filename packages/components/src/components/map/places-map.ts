// The Leaflet map shared by pp-map and the shadcn registry's LocationMap. Each
// draws its own pin and popup; the map, its framing, the pins' keyboard
// handling and their selected and focused marks are the same. Like tiles.ts it
// imports no stylesheet, so a map built outside pp-map does not pull in
// pp-map's.

import * as L from 'leaflet';
import { CARTO_ATTRIBUTION, CARTO_TILE_URL } from './tiles.js';

// Longer than any Leaflet zoom animation.
const RETIRE_AFTER_MS = 1000;

export interface MapPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string | null;
}

export interface PlacesMapOptions<P extends MapPlace> {
  /** The pin's icon. The map marks its element with `aria-current` and `data-focused`. */
  pin: L.DivIconOptions;
  /** The popup's HTML; escape the place's text with {@link escapeHtml}. */
  popup: (place: P) => string;
  /** A pin pressed, or chosen with Enter or Space, that is not already selected. */
  onPress: (place: P) => void;
  /** A pin hovered or focused, and `null` on leaving it. */
  onFocus: (place: P | null) => void;
}

export interface PlacesMapState<P extends MapPlace> {
  places: P[];
  selected: string | null;
  focused: string | null;
  /** Where to frame when the places change. When omitted, the view fits all places. */
  center?: [number, number];
  zoom?: number;
}

export const escapeHtml = (value: string): string => {
  const el = document.createElement('span');
  el.textContent = value;
  return el.innerHTML;
};

const pinLabel = (place: MapPlace) =>
  place.description ? `${place.name} — ${place.description}` : place.name;

export class PlacesMap<P extends MapPlace> {
  private map: L.Map;
  private tiles?: L.TileLayer;
  private pin: L.DivIcon;
  private markers = new Map<string, L.Marker>();
  private observer: ResizeObserver;
  private frame: number;
  private zooming = false;
  private last?: PlacesMapState<P>;
  // The selection as last given, or as pressed since, so a second press on
  // the same pin before the host updates does nothing.
  private selected: string | null = null;
  // A pin the actor pressed is already in view; only a selection set from
  // state moves the map.
  private pressed: string | null = null;

  constructor(
    canvas: HTMLElement,
    private options: PlacesMapOptions<P>,
  ) {
    this.pin = L.divIcon(options.pin);
    this.map = L.map(canvas, { zoomControl: true, attributionControl: true });
    this.map
      .on('zoomanim', () => (this.zooming = true))
      .on('zoomend', () => (this.zooming = false));
    this.setTiles(CARTO_TILE_URL, CARTO_ATTRIBUTION);
    // The container is often laid out or resized after the map is built.
    // Leaflet has to be told, or the tiles misalign.
    this.frame = requestAnimationFrame(() => this.map.invalidateSize());
    this.observer = new ResizeObserver(() => this.map.invalidateSize());
    this.observer.observe(canvas);
  }

  setTiles(url: string, attribution: string): void {
    this.tiles?.remove();
    this.tiles = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(this.map);
  }

  /** Bring the map to `state`. New places are framed and keep the view; a
      selection that changes later moves the map to it. The selected pin's
      popup opens only when the selection changes, since a popup at the edge
      shifts the view away from the frame. */
  update(state: PlacesMapState<P>): void {
    const last = this.last;
    this.last = state;
    this.selected = state.selected;
    const selectionChanged = state.selected !== last?.selected;
    if (state.places !== last?.places) {
      this.framePlaces(state);
      this.addPins(state.places);
      this.markSelected(state.selected, { pan: false, open: selectionChanged });
    } else if (selectionChanged) {
      this.markSelected(state.selected, { pan: state.selected !== this.pressed, open: true });
    }
    this.pressed = null;
    this.markFocused(state.focused);
  }

  /** Remove the map, waiting for a running zoom to end. `then` runs once it is
      gone. */
  remove(then?: () => void): void {
    this.observer.disconnect();
    cancelAnimationFrame(this.frame);
    // remove() does not cancel a zoom animation's timer, which then reads the
    // removed panes.
    if (!this.zooming) {
      this.map.remove();
      then?.();
      return;
    }
    const retire = () => {
      clearTimeout(fallback);
      this.map.remove();
      then?.();
    };
    const fallback = setTimeout(retire, RETIRE_AFTER_MS);
    this.map.once('zoomend', retire);
  }

  // The view is set before the pins are added: Leaflet creates a pin's element
  // only once the map has a view. Framing is never animated, since a zoom left
  // running when the map is removed throws.
  private framePlaces({ places, center, zoom }: PlacesMapState<P>): void {
    if (center) {
      this.map.setView(center, zoom ?? 13, { animate: false });
    } else if (places.length > 0) {
      this.map.fitBounds(L.latLngBounds(places.map((p) => [p.lat, p.lng] as [number, number])), {
        padding: [32, 32],
        maxZoom: 16,
        animate: false,
      });
    } else {
      this.map.setView([20, 0], 2, { animate: false });
    }
  }

  private addPins(places: P[]): void {
    for (const marker of this.markers.values()) marker.remove();
    this.markers.clear();
    for (const place of places) {
      const marker = L.marker([place.lat, place.lng], { icon: this.pin, title: place.name })
        .bindPopup(this.options.popup(place))
        .on('click', () => this.press(place))
        .on('mouseover', () => this.options.onFocus(place))
        .on('mouseout', () => this.options.onFocus(null))
        .addTo(this.map);
      // Leaflet makes each pin a focusable role="button" but does not
      // activate a divIcon pin from the keyboard.
      const el = marker.getElement();
      el?.setAttribute('aria-label', pinLabel(place));
      el?.addEventListener('focus', () => this.options.onFocus(place));
      el?.addEventListener('blur', () => this.options.onFocus(null));
      el?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        this.press(place);
      });
      this.markers.set(place.id, marker);
    }
  }

  private press(place: P): void {
    if (place.id === this.selected) return;
    this.selected = place.id;
    this.pressed = place.id;
    this.options.onPress(place);
  }

  private markSelected(
    selected: string | null,
    { pan, open }: { pan: boolean; open: boolean },
  ): void {
    for (const [id, marker] of this.markers) {
      const el = marker.getElement();
      if (id === selected) el?.setAttribute('aria-current', 'true');
      else el?.removeAttribute('aria-current');
      marker.setZIndexOffset(id === selected ? 1000 : 0);
    }
    const marker = selected ? this.markers.get(selected) : undefined;
    if (!marker) {
      this.map.closePopup();
      return;
    }
    if (pan) this.map.panTo(marker.getLatLng());
    if (open) marker.openPopup();
  }

  private markFocused(focused: string | null): void {
    for (const [id, marker] of this.markers) {
      const el = marker.getElement();
      if (id === focused) el?.setAttribute('data-focused', 'true');
      else el?.removeAttribute('data-focused');
    }
  }
}
