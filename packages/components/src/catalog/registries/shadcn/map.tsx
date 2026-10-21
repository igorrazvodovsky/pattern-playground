import { useEffect, useRef } from 'react';
import type { DivIconOptions } from 'leaflet';
import { escapeHtml, PlacesMap } from '../../../components/map/places-map';

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

const pin: DivIconOptions = {
  className: 'group',
  html: '<span class="block size-full rounded-full border-2 border-background bg-primary shadow-md transition-transform group-aria-[current=true]:scale-140 group-aria-[current=true]:ring-2 group-aria-[current=true]:ring-ring group-data-[focused=true]:scale-125 group-data-[focused=true]:ring-2 group-data-[focused=true]:ring-ring/50"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
};

const popup = (location: Place) =>
  `<span class="block text-sm font-medium">${escapeHtml(location.name)}</span>` +
  (location.description
    ? `<span class="block text-xs text-muted-foreground">${escapeHtml(location.description)}</span>`
    : '');

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
  const map = useRef<PlacesMap<Place> | null>(null);
  const latest = useRef({ onSelect, onFocusChange });
  latest.current = { onSelect, onFocusChange };

  useEffect(() => {
    if (!canvas.current) return;
    const instance = new PlacesMap<Place>(canvas.current, {
      pin,
      popup,
      onPress: (place) => latest.current.onSelect(place.id),
      onFocus: (place) => latest.current.onFocusChange(place?.id ?? null),
    });
    map.current = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.update({ places: locations, selected, focused });
  }, [locations, selected, focused]);

  return (
    <div role="group" aria-label={label} className="h-80 overflow-hidden rounded-xl border">
      <div ref={canvas} className="size-full" />
    </div>
  );
};
