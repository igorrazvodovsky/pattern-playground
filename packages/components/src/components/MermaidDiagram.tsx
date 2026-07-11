import React, { useMemo } from 'react';
import { renderMermaidSVG, THEMES } from 'beautiful-mermaid';
import { siteTheme } from './MermaidDiagram.theme';

interface MermaidDiagramProps {
  chart: string;
  theme?: keyof typeof THEMES;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, theme }) => {
  const svg = useMemo(() => {
    const options = theme ? { ...THEMES[theme], font: siteTheme.font } : siteTheme;
    try {
      return renderMermaidSVG(chart.trim(), options);
    } catch (error) {
      console.error('Failed to render mermaid diagram:', error);
      return `<p>Failed to render diagram.</p>`;
    }
  }, [chart, theme]);

  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};
