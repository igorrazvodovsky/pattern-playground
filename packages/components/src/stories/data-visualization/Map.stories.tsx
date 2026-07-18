import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';

// Import the map component (this registers the custom element via register-all).
// The pp-map JSX typing lives in src/jsx-types.ts.
import "../../components/map/map.js";
import type { MapComponent, MapLocation } from "../../components/map/map.js";

import locationData from '../data/map-locations.json' with { type: 'json' };

const locations = locationData as MapLocation[];

interface MapWrapperProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
  showList?: boolean;
  selectedId?: string;
  label?: string;
  height?: number;
}

function MapWrapper({
  locations,
  center,
  zoom = 5,
  showList = true,
  selectedId,
  label = 'Location map',
  height = 460,
}: MapWrapperProps) {
  const mapRef = useRef<MapComponent | null>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    el.locations = locations;
    el.center = center;
    el.zoom = zoom;
    el.showList = showList;
    el.label = label;
    if (selectedId !== undefined) el.selectedId = selectedId;

    const onSelect = (e: Event) => action('pp-map-select')((e as CustomEvent).detail);
    el.addEventListener('pp-map-select', onSelect);
    return () => el.removeEventListener('pp-map-select', onSelect);
  }, [locations, center, zoom, showList, selectedId, label]);

  return (
    <div style={{ width: '100%', height }}>
      <pp-map ref={mapRef} />
    </div>
  );
}

const meta = {
  title: "Components/Map",
  component: MapWrapper,
  argTypes: {
    showList: {
      control: { type: 'boolean' },
      description: 'Show the companion location list beside the map',
    },
    selectedId: {
      control: { type: 'select' },
      options: [undefined, ...locations.map((l) => l.id)],
      description: 'The active location',
    },
    zoom: {
      control: { type: 'range', min: 1, max: 18, step: 1 },
      description: 'Initial zoom (used when a centre is given)',
    },
    height: {
      control: { type: 'range', min: 240, max: 720, step: 20 },
      description: 'Container height (px)',
    },
  },
} satisfies Meta<MapWrapperProps>;

export default meta;
type Story = StoryObj<MapWrapperProps>;

export const Default: Story = {
  args: {
    locations,
    showList: true,
    label: 'European offices',
  },
};

export const Preselected: Story = {
  args: {
    locations,
    showList: true,
    selectedId: 'berlin',
    label: 'European offices',
  },
};

export const MapOnly: Story = {
  args: {
    locations,
    showList: false,
    label: 'European offices',
  },
};

export const SingleLocation: Story = {
  args: {
    locations: locations.filter((l) => l.id === 'amsterdam'),
    center: [52.3676, 4.9041],
    zoom: 13,
    showList: false,
    label: 'Amsterdam office',
  },
};
