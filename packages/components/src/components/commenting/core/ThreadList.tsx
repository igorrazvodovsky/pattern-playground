import React, { useEffect, useState } from 'react';
import { CommentThread } from './CommentThread';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';
import { getCommentService } from '../../../services/commenting/core/comment-service-instance';
import { getUserById } from '@shared/data';

/** One commented thing a surface reports: a marked passage, a quote, a shape. */
export interface ThreadListEntry {
  /** Stable within the surface; names the entry for selection. */
  key: string;
  pointer: CommentPointer;
  /** What kind of thing this is, in a word: "Passage", "Quote". */
  kind: string;
  excerpt: string;
}

interface ThreadListProps {
  /** In the order the surface presents them, usually document order. */
  entries: ThreadListEntry[];
  currentUser: string;
  /** Called when the actor opens an entry, so the surface can bring it into view. */
  onSelect?: (entry: ThreadListEntry) => void;
}

const EXCERPT_LENGTH = 120;

function shorten(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length > EXCERPT_LENGTH ? `${trimmed.slice(0, EXCERPT_LENGTH - 1)}…` : trimmed;
}

// Every thread on a surface, whatever the surface is. The surface reports the
// entries and brings a selected one into view; the list owns showing threads,
// replies, and which entries have any comments at all.
export const ThreadList: React.FC<ThreadListProps> = ({ entries, currentUser, onSelect }) => {
  const user = getUserById(currentUser);
  const counts = useCommentCounts(entries);
  const commented = entries.filter(entry => (counts.get(entry.key) ?? 0) > 0);

  if (!user) return null;

  if (commented.length === 0) {
    return <p>No comments yet. Select text and choose Comment to start a thread.</p>;
  }

  return (
    <div className="flow">
      {commented.map(entry => {
        const count = counts.get(entry.key) ?? 0;
        return (
          <details
            key={entry.key}
            name="comment-threads"
            onToggle={(event) => {
              if (event.currentTarget.open) onSelect?.(entry);
            }}
          >
            <summary>
              <span>
                {entry.kind}: “{shorten(entry.excerpt)}”{' '}
                <small>{count === 1 ? '1 comment' : `${count} comments`}</small>
              </span>
            </summary>
            <CommentThread
              pointer={entry.pointer}
              currentUser={user}
              placeholder="Reply..."
            />
          </details>
        );
      })}
    </div>
  );
};

// Comment counts per entry, kept current as comments are added, removed or moved.
function useCommentCounts(entries: ThreadListEntry[]): Map<string, number> {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const service = getCommentService();
    let cancelled = false;

    const load = async () => {
      const next = new Map<string, number>();
      for (const entry of entries) {
        next.set(entry.key, (await service.getComments(entry.pointer)).length);
      }
      if (!cancelled) setCounts(next);
    };

    load();
    const events = ['comment:created', 'comment:deleted', 'thread:reanchored'];
    const unsubscribers = events.map(event => service.on(event, load));
    return () => {
      cancelled = true;
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [entries]);

  return counts;
}
