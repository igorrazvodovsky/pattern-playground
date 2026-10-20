import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { CARTO_ATTRIBUTION, CARTO_TILE_URL } from '../../components/map/tiles';

// Leaflet's own stylesheet is not imported here. pp-map imports it, and every
// page that registers the library has it; an import from this lazily loaded
// registry would put a second copy in every page's head.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export interface Place {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string | null;
}

const pin = L.divIcon({
  className: 'group',
  html: '<span class="block size-full rounded-full border-2 border-background bg-primary shadow-md transition-transform group-aria-[current=true]:scale-140 group-aria-[current=true]:ring-2 group-aria-[current=true]:ring-ring group-data-[focused=true]:scale-125 group-data-[focused=true]:ring-2 group-data-[focused=true]:ring-ring/50"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const text = (value: string) => {
  const el = document.createElement('span');
  el.textContent = value;
  return el.innerHTML;
};

const popup = (location: Place) =>
  `<span class="block text-sm font-medium">${text(location.name)}</span>` +
  (location.description ? `<span class="block text-xs text-muted-foreground">${text(location.description)}</span>` : '');

const pinLabel = (location: Place) =>
  location.description ? `${location.name} — ${location.description}` : location.name;

export const LocationMap = ({
  label,
  locations,
  selected,
  onSelect,
  focused,
  onFocusChange,
}: {
  label: string;
  locations: Place[];
  selected: string | null;
  onSelect: (id: string) => void;
  focused: string | null;
  onFocusChange: (id: string | null) => void;
}) => {
  const canvas = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  // A pin the actor pressed is already in view, and the places just framed
  // are all in view; only a selection set from state later moves the map.
  const pressed = useRef<string | null>(null);
  const framed = useRef<Place[] | null>(null);
  const latest = useRef({ selected, onSelect, onFocusChange });
  latest.current = { selected, onSelect, onFocusChange };
  const select = useRef((id: string) => {
    if (id === latest.current.selected) return;
    pressed.current = id;
    latest.current.onSelect(id);
  });

  useEffect(() => {
    if (!canvas.current) return;
    const instance = L.map(canvas.current, { zoomControl: true, attributionControl: true });
    L.tileLayer(CARTO_TILE_URL, { attribution: CARTO_ATTRIBUTION, maxZoom: 19 }).addTo(instance);
    let zooming = false;
    instance.on('zoomanim', () => (zooming = true)).on('zoomend', () => (zooming = false));
    map.current = instance;
    // Leaflet has to be told when its container is laid out or resized, or
    // the tiles misalign.
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(canvas.current);
    return () => {
      observer.disconnect();
      // A zoom animation finishes on a timer that remove() does not cancel,
      // and the timer then reads the removed panes. Wait for it.
      if (zooming) instance.once('zoomend', () => instance.remove());
      else instance.remove();
      map.current = null;
    };
  }, []);

  // The view is set before the pins are added: Leaflet creates a pin's
  // element only once the map has a view. Framing is not animated, so that a
  // library switch straight after mounting does not interrupt a zoom.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (locations.length > 0) {
      instance.fitBounds(L.latLngBounds(locations.map(l => [l.lat, l.lng] as [number, number])), {
        padding: [32, 32],
        maxZoom: 16,
        animate: false,
      });
    } else {
      instance.setView([20, 0], 2, { animate: false });
    }
    for (const marker of markers.current.values()) marker.remove();
    markers.current.clear();
    for (const location of locations) {
      const marker = L.marker([location.lat, location.lng], { icon: pin, title: location.name })
        .bindPopup(popup(location))
        .on('click', () => select.current(location.id))
        .on('mouseover', () => latest.current.onFocusChange(location.id))
        .on('mouseout', () => latest.current.onFocusChange(null))
        .addTo(instance);
      const el = marker.getElement();
      el?.setAttribute('aria-label', pinLabel(location));
      el?.addEventListener('focus', () => latest.current.onFocusChange(location.id));
      el?.addEventListener('blur', () => latest.current.onFocusChange(null));
      el?.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        select.current(location.id);
      });
      markers.current.set(location.id, marker);
    }
  }, [locations]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const el = marker.getElement();
      if (id === selected) el?.setAttribute('aria-current', 'true');
      else el?.removeAttribute('aria-current');
      marker.setZIndexOffset(id === selected ? 1000 : 0);
    }
    const marker = selected ? markers.current.get(selected) : undefined;
    if (!marker) {
      map.current?.closePopup();
      return;
    }
    const placesChanged = framed.current !== locations;
    framed.current = locations;
    if (!placesChanged && pressed.current !== selected) map.current?.panTo(marker.getLatLng());
    pressed.current = null;
    marker.openPopup();
  }, [selected, locations]);

  useEffect(() => {
    for (const [id, marker] of markers.current) {
      const el = marker.getElement();
      if (id === focused) el?.setAttribute('data-focused', 'true');
      else el?.removeAttribute('data-focused');
    }
  }, [focused, locations]);

  return (
    <div role="group" aria-label={label} className="h-80 overflow-hidden rounded-xl border">
      <div ref={canvas} className="size-full" />
    </div>
  );
};
