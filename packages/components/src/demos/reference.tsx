import { ReferenceEditor } from '../components/reference';
import { referenceCategories, basicReferenceCategories, getReferenceContentById } from '@shared/data';

const fallbackDoc = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

/** Inline @mention references across users, documents, projects, quotes and products, escalating to detail on demand. */
export function ReferenceDemo() {
  return (
    <ReferenceEditor
      data={referenceCategories}
      placeholder="Type @ to open reference picker (users, documents, projects, quotes & products)..."
      content={getReferenceContentById('sustainability-meeting-content')?.content ||
        fallbackDoc('Type @ to reference an entity — users, documents, projects, quotes or products.')}
    />
  );
}

/** Single-category user mentions; skips category selection since only users are referenceable. */
export function BasicReferenceDemo() {
  return (
    <div className="layer">
      <ReferenceEditor
        data={basicReferenceCategories}
        placeholder="Type @ to mention a user..."
        content={getReferenceContentById('sustainability-team-meeting-content')?.content ||
          fallbackDoc('Basic user references for team collaboration. In the full system, quote objects would also be available here for cross-document referencing and discussions.')}
      />
    </div>
  );
}
