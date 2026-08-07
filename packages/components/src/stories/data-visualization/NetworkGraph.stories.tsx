import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef } from "react";
import { action } from 'storybook/actions';

// Import the network graph component (this registers the custom element)
// The pp-network-graph JSX typing lives in src/jsx-types.ts.
import "../../components/charts/network-graph.js";
import type { NetworkGraph } from "../../components/charts/network-graph.js";
import type { NetworkGraphData } from "../../components/charts/base/chart-types.js";
import collaborationNetwork from '../data/collaboration-network.json' with { type: 'json' };

const collaborationData = collaborationNetwork as NetworkGraphData;

// Category home regions in the component's 900×600 layout space — one corner
// per discipline, so the families settle into recognisable neighbourhoods.
const disciplineAnchors: Record<string, [number, number]> = {
  Design: [230, 170],
  Engineering: [670, 170],
  Research: [230, 430],
  Editorial: [670, 430],
};

interface NetworkGraphWrapperProps {
  data: NetworkGraphData;
  trailLength?: number;
  anchors?: Record<string, [number, number]>;
  title?: string;
}

function NetworkGraphWrapper({
  data,
  trailLength = 8,
  anchors,
  title = ''
}: NetworkGraphWrapperProps) {
  const chartRef = useRef<NetworkGraph | null>(null);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.data = data;
      chartElement['trail-length'] = trailLength;
      if (anchors) chartElement.anchors = anchors;
      chartElement.title = title;

      const handleNodeClick = (e: CustomEvent) => {
        action('pp-node-click')(e.detail.node);
      };

      chartElement.addEventListener('pp-node-click', handleNodeClick as EventListener);
      return () => {
        chartElement.removeEventListener('pp-node-click', handleNodeClick as EventListener);
      };
    }
  }, [data, trailLength, anchors, title]);

  return (
    <pp-network-graph ref={chartRef} />
  );
}

const meta = {
  title: "Data visualisation/Network graph",
  component: NetworkGraphWrapper,
  argTypes: {
    trailLength: {
      control: { type: 'range', min: 0, max: 14, step: 1 },
      description: 'How many recently visited nodes the trail keeps (0 disables it)'
    }
  }
} satisfies Meta<NetworkGraphWrapperProps>;

export default meta;
type Story = StoryObj<NetworkGraphWrapperProps>;

export const Default: Story = {
  args: {
    data: collaborationData,
    trailLength: 8,
    title: 'Studio collaboration network',
  }
};

export const Anchored: Story = {
  args: {
    data: collaborationData,
    trailLength: 8,
    anchors: disciplineAnchors,
    title: 'Studio collaboration network, anchored by discipline',
  }
};

export const NoTrail: Story = {
  args: {
    data: collaborationData,
    trailLength: 0,
    title: 'Studio collaboration network',
  }
};
