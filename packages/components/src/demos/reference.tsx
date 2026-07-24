import { ReferenceEditor } from '../components/reference';
import { referenceCategories, basicReferenceCategories, getReferenceContentById } from '@shared/data';

const fallbackDoc = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});

/** Inline @mention references across users, documents, projects and quote objects, escalating to detail on demand. */
export function ReferenceDemo() {
  return (
    <ReferenceEditor
      data={referenceCategories}
      placeholder="Type @ to open reference picker (includes users, documents, projects & quotes)..."
      content={getReferenceContentById('sustainability-meeting-content')?.content ||
        fallbackDoc('Enhanced reference system with Quote Objects! Try @reshaping, @habitats, or @coral to reference specific quote objects across documents. Also supports @elena, @climate, @circular for traditional references.')}
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
