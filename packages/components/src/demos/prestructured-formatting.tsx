import { useMemo } from 'react';
import { getDocumentContentText } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin';

// Prestructured formatting: selecting text brings up the formatting roles in
// the bubble menu. Consumed by the prestructured-formatting pattern page and
// BubbleMenu.stories.tsx.

const content = `<p>${getDocumentContentText('doc-climate-change', 'ecological-timing')}</p>`;

export function PrestructuredFormattingDemo() {
  const plugins = useMemo(() => [formattingPlugin()], []);
  return <PluginEditor plugins={plugins} content={content} />;
}
