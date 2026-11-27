import { useEffect, useMemo } from 'react';
import { getDocumentContentRich, referenceCategories } from '@shared/data';
import { PluginEditor } from '../components/editor/PluginEditor';
import { formattingPlugin } from '../components/editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../components/editor-plugins/commenting/CommentingPlugin';
import { CommentingIntegration } from '../components/editor-plugins/commenting/components/CommentingIntegration';

// Commenting on a document: selecting a passage offers a comment on it in the
// bubble menu. Consumed by the commenting pattern page and
// BubbleMenu.stories.tsx.

const currentUser = 'user-1';

const content = getDocumentContentRich('doc-climate-change') || '';

export function CommentingDemo() {
  const plugins = useMemo(
    () => [
      // The toolbar row carries only the commenting control.
      formattingPlugin({ toolbar: false }),
      commentingPlugin({
        documentId: 'doc-climate-change',
        currentUser,
        bubbleMenu: true,
        toolbar: true,
        referenceCategories,
      }),
    ],
    [],
  );

  useEffect(() => {
    import('../services/commenting/mock-data/initialize-mock-comments').then(
      ({ initializeMockComments }) => initializeMockComments(),
    );
  }, []);

  return (
    <PluginEditor
      plugins={plugins}
      content={content}
      className="rich-editor"
      toolbar
      frame={(layout) => (
        <CommentingIntegration config={{ currentUser }}>{layout}</CommentingIntegration>
      )}
    />
  );
}
