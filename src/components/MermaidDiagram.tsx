import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

let mermaidInitialized = false;

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true
        }
      });
      mermaidInitialized = true;
    }

    if (elementRef.current) {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      elementRef.current.innerHTML = `<div class="mermaid" id="${id}">${chart}</div>`;
      mermaid.run({ nodes: [elementRef.current.querySelector(`#${id}`) as Element] });
    }
  }, [chart]);

  return <div ref={elementRef} />;
};