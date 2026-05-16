import React, { useEffect, useRef } from 'react';
import { renderMermaid, THEMES } from 'beautiful-mermaid';

interface MermaidDiagramProps {
  chart: string;
  theme?: keyof typeof THEMES;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme = 'zinc-light' }) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (elementRef.current) {
        try {
          const svg = await renderMermaid(chart.trim(), THEMES[theme]);
          elementRef.current.innerHTML = svg;
        } catch (error) {
          console.error('Failed to render mermaid diagram:', error);
          elementRef.current.innerHTML = `<div style="color: red;">Failed to render diagram</div>`;
        }
      }
    };

    renderDiagram();
  }, [chart, theme]);

  return <div ref={elementRef} />;
};