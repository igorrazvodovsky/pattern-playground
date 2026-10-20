import type { Spec } from '@json-render/core';
import { feedActions, describeAction, provenanceOf } from '@shared/data';
import { formatDateTime } from '@shared/format';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './activity-log.json' with { type: 'json' };

// The window ends at the log's latest system reaction rather than at its end:
// a system entry can say why it happened, and the most recent day holds none.

interface Entry {
  id: string;
  /** The system has nowhere to go; a person links to their record. */
  by: string | { name: string; href: string };
  title: string;
  time: string;
  expandable: boolean;
  rule: string | null;
  trigger: string | null;
  open: boolean;
}

const latestReaction = feedActions.findLastIndex((action) => action.viaRule !== undefined) + 1;

const entries: Entry[] = feedActions
  .slice(Math.max(0, latestReaction - 6), latestReaction)
  .reverse()
  .map((action) => {
    const { actorName, phrase } = describeAction(action);
    const provenance = provenanceOf(action);
    const causes = provenance?.causes
      .map((cause) => {
        const described = describeAction(cause);
        return `${described.actorName} ${described.phrase}`;
      })
      .join(', and ');
    return {
      id: action.id,
      // No route shows a person yet, so the link is an anchor a route can replace.
      by:
        action.actor === 'system'
          ? actorName
          : { name: actorName, href: `#person-${action.actor}` },
      title: `${phrase}.`,
      time: formatDateTime(action.timestamp),
      expandable: provenance !== undefined,
      rule: provenance?.rule.description ?? null,
      trigger: causes ? `Triggered by ${causes}.` : null,
      open: false,
    };
  });

export default {
  spec: spec as Spec,
  setup: { initialState: { entries } } satisfies SpecSetup,
};
