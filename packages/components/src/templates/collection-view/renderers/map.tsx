import { useEffect, useMemo, useRef } from 'react';
import type { BoundEntity } from '@shared/data/bindings';
import type { MapComponent, MapSelectDetail } from '../../../components/map/map.js';
import { toMapLocations } from '../data';
import type { RendererProps } from './shared';

export function MapRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, binding, selectedId, onItemSelect } = props;
  const ref = useRef<MapComponent | null>(null);
  const locations = useMemo(() => toMapLocations(items, binding), [items, binding]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.locations = locations;
    el['selected-id'] = selectedId ?? '';
  }, [locations, selectedId]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onItemSelect) return;
    const handleSelect = (event: Event) => {
      const detail = (event as CustomEvent<MapSelectDetail>).detail;
      const item = items.find((candidate) => candidate.id === detail.location.id);
      if (item) onItemSelect(item);
    };
    el.addEventListener('pp-map-select', handleSelect);
    return () => el.removeEventListener('pp-map-select', handleSelect);
  }, [items, onItemSelect]);

  return (
    <div className="view-family__map">
      <pp-map ref={ref} />
    </div>
  );
}
