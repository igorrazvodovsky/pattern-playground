import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';

// Import the map component (this registers the custom element via register-all).
// The pp-choropleth JSX typing lives in src/jsx-types.ts.
import "../../components/charts/choropleth.js";
import type { Choropleth } from "../../components/charts/choropleth.js";
import type { ChoroplethData, ChoroplethDataPoint } from "../../components/charts/base/chart-types.js";

import worldGeometry from '@shared/data/world-countries.geo.json' with { type: 'json' };
import worldPopulation from '@shared/data/world-population.json' with { type: 'json' };

const geometry = worldGeometry as unknown as ChoroplethData['geometry'];
const population = worldPopulation as ChoroplethDataPoint[];

// A handful of countries only, to show the no-data (unshaded) state.
const sparseValues: ChoroplethDataPoint[] = population.filter((d) =>
  ['840', '156', '356', '076', '036'].includes(String(d.id)),
);

interface ChoroplethWrapperProps {
  data: ChoroplethData;
  projection?: Choropleth['projection'];
  colorSteps?: number;
  showLegend?: boolean;
  title?: string;
  height?: number;
}

function ChoroplethWrapper({
  data,
  projection = 'naturalEarth',
  colorSteps = 5,
  showLegend = true,
  title = '',
  height = 380,
}: ChoroplethWrapperProps) {
  const mapRef = useRef<Choropleth | null>(null);

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;

    el.data = data;
    el.projection = projection;
    el.colorSteps = colorSteps;
    el.showLegend = showLegend;
    el.title = title;

    const onHover = (e: Event) => action('pp-choropleth-hover')((e as CustomEvent).detail.data);
    const onClick = (e: Event) => action('pp-choropleth-click')((e as CustomEvent).detail.data);
    el.addEventListener('pp-choropleth-hover', onHover);
    el.addEventListener('pp-choropleth-click', onClick);
    return () => {
      el.removeEventListener('pp-choropleth-hover', onHover);
      el.removeEventListener('pp-choropleth-click', onClick);
    };
  }, [data, projection, colorSteps, showLegend, title]);

  return (
    <div style={{ width: '100%', height }}>
      <pp-choropleth ref={mapRef} />
    </div>
  );
}

const meta = {
  title: "Data visualisation/Choropleth",
  component: ChoroplethWrapper,
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
} satisfies Meta<ChoroplethWrapperProps>;

export default meta;
type Story = StoryObj<ChoroplethWrapperProps>;

const worldData: ChoroplethData = {
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
