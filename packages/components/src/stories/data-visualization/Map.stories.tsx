import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';

// Import the map component (this registers the custom element via register-all).
import "../../components/charts/map-chart.js";
import type { MapChartData, MapChartDataPoint } from "../../components/charts/base/chart-types.js";

import worldGeometry from '@shared/data/world-countries.geo.json' with { type: 'json' };
import worldPopulation from '@shared/data/world-population.json' with { type: 'json' };

interface MapElement extends HTMLElement {
  data: MapChartData;
  projection: 'naturalEarth' | 'equalEarth' | 'equirectangular' | 'mercator';
  colorSteps: number;
  showLegend: boolean;
  title: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pp-map': React.DetailedHTMLProps<React.HTMLAttributes<MapElement>, MapElement>;
    }
  }
}

const geometry = worldGeometry as unknown as MapChartData['geometry'];
const population = worldPopulation as MapChartDataPoint[];

// A handful of countries only, to show the no-data (unshaded) state.
const sparseValues: MapChartDataPoint[] = population.filter((d) =>
  ['840', '156', '356', '076', '036'].includes(String(d.id)),
);

interface MapWrapperProps {
  data: MapChartData;
  projection?: MapElement['projection'];
  colorSteps?: number;
  showLegend?: boolean;
  title?: string;
  height?: number;
}

function MapWrapper({
  data,
  projection = 'naturalEarth',
  colorSteps = 5,
  showLegend = true,
  title = '',
  height = 380,
}: MapWrapperProps) {
  const mapRef = useRef<MapElement | null>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    el.data = data;
    el.projection = projection;
    el.colorSteps = colorSteps;
    el.showLegend = showLegend;
    el.title = title;

    const onHover = (e: Event) => action('pp-map-hover')((e as CustomEvent).detail.data);
    const onClick = (e: Event) => action('pp-map-click')((e as CustomEvent).detail.data);
    el.addEventListener('pp-map-hover', onHover);
    el.addEventListener('pp-map-click', onClick);
    return () => {
      el.removeEventListener('pp-map-hover', onHover);
      el.removeEventListener('pp-map-click', onClick);
    };
  }, [data, projection, colorSteps, showLegend, title]);

  return (
    <div style={{ width: '100%', height }}>
      <pp-map ref={mapRef} />
    </div>
  );
}

const meta = {
  title: "Data visualisation/Map",
  component: MapWrapper,
  argTypes: {
    projection: {
      control: { type: 'select' },
      options: ['naturalEarth', 'equalEarth', 'equirectangular', 'mercator'],
      description: 'Geographic projection',
    },
    colorSteps: {
      control: { type: 'range', min: 2, max: 9, step: 1 },
      description: 'Number of discrete colour bins',
    },
    showLegend: {
      control: { type: 'boolean' },
      description: 'Show the colour-scale legend',
    },
    height: {
      control: { type: 'range', min: 200, max: 640, step: 20 },
      description: 'Container height (px)',
    },
  },
} satisfies Meta<MapWrapperProps>;

export default meta;
type Story = StoryObj<MapWrapperProps>;

const worldData: MapChartData = {
  geometry,
  values: population,
  valueLabel: 'M people',
};

export const Default: Story = {
  args: {
    data: worldData,
    projection: 'naturalEarth',
    colorSteps: 5,
    showLegend: true,
    title: 'Population by country (millions, 2023)',
  },
};

export const Mercator: Story = {
  args: {
    data: worldData,
    projection: 'mercator',
    colorSteps: 5,
    showLegend: true,
    title: 'Population — Mercator projection',
  },
};

export const FineGrainedBins: Story = {
  args: {
    data: worldData,
    projection: 'naturalEarth',
    colorSteps: 9,
    showLegend: true,
    title: 'Population — nine colour bins',
  },
};

export const Sparse: Story = {
  args: {
    data: { geometry, values: sparseValues, valueLabel: 'M people' },
    projection: 'naturalEarth',
    colorSteps: 5,
    showLegend: true,
    title: 'A few countries — the rest read as no-data',
  },
};
