/**
 * Timeline grouping service: asks the backend to segment a run of dated
 * records into named episodes, and those into phases, so a zoomable timeline
 * can show a stretch of history as one row that says what happened in it.
 *
 * The grouping is a judgement, not a calculation — where one episode ends and
 * the next begins is exactly the thing a calendar gets wrong — which is why it
 * lives behind the API rather than in the client.
 */

export interface TimelineRecord {
  id: string;
  date: string;
  label: string;
  amount?: number;
  category?: string;
}

export interface TimelineEpisode {
  title: string;
  summary: string;
  /** The record the episode opens on; it runs until the next episode's. */
  startId: string;
}

export interface TimelinePhase {
  title: string;
  summary: string;
  episodes: TimelineEpisode[];
}

/* No run-level title or summary: the outermost grain is the only one the
   view never shows a sentence for — it is always open — and a sentence about
   the whole run says too little to be worth asking for. What the top level
   needs is a label, and that the caller already knows. */
export interface TimelineGrouping {
  phases: TimelinePhase[];
}

function getGroupingEndpoint(): string {
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ) {
    return 'http://localhost:3000/api/timeline/group';
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return `${apiUrl}/api/timeline/group`;

  return '/api/timeline/group';
}

/**
 * The one primitive the view knows: a contiguous stretch of the run, named,
 * said in a sentence, and made of smaller stretches. A single record is a span
 * of one whose sentence is its own label, so the finest grain is written by
 * the data and only the coarser ones are asked of a model. Levels are then the
 * same kind of thing at different grains rather than different kinds of row,
 * which is what lets one template render the whole tree.
 */
export interface TimelineSpan {
  id: string;
  /** Absent on a leaf: a record is named by what it says. */
  title?: string;
  sentence: string;
  /** Half-open range over the records. */
  from: number;
  to: number;
  children?: TimelineSpan[];
}

/**
 * A stretch made of one thing is that thing. A level with a single constituent
 * is a grain the reader can open and learn nothing from — worse than nothing,
 * because opening it costs a caption and the room the caption takes has to come
 * from somewhere, so the band under the pointer moves and the pointer ends up
 * on a different span than the one it was aimed at.
 */
export function collapseSingletons(span: TimelineSpan): TimelineSpan {
  if (!span.children) return span;
  const children = span.children.map(collapseSingletons);
  return children.length === 1 ? children[0] : { ...span, children };
}

/** How many records a span stands for — the view's unit of space. */
export function spanLength(span: TimelineSpan): number {
  return span.to - span.from;
}

function leavesOf(records: TimelineRecord[], from: number, to: number): TimelineSpan[] {
  return records.slice(from, to).map((record, offset) => ({
    id: record.id,
    sentence: record.label,
    from: from + offset,
    to: from + offset + 1,
  }));
}

/**
 * Turn the model's boundaries into spans over the records. Because an episode
 * runs from its start to the next one's, every record lands somewhere by
 * construction — there is nothing to drop and nothing to repair. What can
 * still go wrong is a boundary the model invented or put out of order; those
 * are discarded, and the first episode is pulled back to the first record so
 * the run is covered from the start.
 *
 * Returns null when what is left couldn't carry the view — no episodes, or a
 * single one covering everything, which is not a grouping.
 */
export function resolveGrouping(
  grouping: TimelineGrouping,
  records: TimelineRecord[]
): TimelineSpan | null {
  const position = new Map(records.map((record, index) => [record.id, index]));

  const flat: { phase: number; title: string; summary: string; start: number }[] = [];
  grouping.phases?.forEach((phase, phaseIndex) => {
    phase.episodes?.forEach((episode) => {
      const start = position.get(episode.startId);
      if (start === undefined) return;
      if (flat.length && start <= flat.at(-1)!.start) return;
      flat.push({
        phase: phaseIndex,
        title: episode.title,
        summary: episode.summary,
        start,
      });
    });
  });

  if (flat.length < 2) return null;
  flat[0].start = 0;

  const episodes = flat.map((episode, index) => ({
    phase: episode.phase,
    span: {
      id: `e${index}`,
      title: episode.title,
      sentence: episode.summary,
      from: episode.start,
      to: flat[index + 1]?.start ?? records.length,
    } satisfies TimelineSpan,
  }));

  const phases: TimelineSpan[] = [];
  episodes.forEach(({ phase, span }) => {
    const source = grouping.phases[phase];
    const last = phases.at(-1);

    /* Two phases the model gave the same name are one phase: it named the
       same chapter twice rather than finding a boundary. */
    if (last && last.title === source.title) {
      last.children!.push({ ...span, children: leavesOf(records, span.from, span.to) });
      last.to = span.to;
      return;
    }

    phases.push({
      id: `p${phases.length}`,
      title: source.title,
      sentence: source.summary,
      from: span.from,
      to: span.to,
      children: [{ ...span, children: leavesOf(records, span.from, span.to) }],
    });
  });

  return collapseSingletons({
    id: 'run',
    /* Left unnamed on purpose: the caller titles the root, because what the
       whole run is called is a fact about the subject, not a judgement about
       the records. */
    sentence: '',
    from: 0,
    to: records.length,
    children: phases,
  });
}

/* The grouping of a given run of records doesn't change, so the second visit
   to a page shouldn't wait for it again. Session storage rather than local:
   long enough to cover a reader moving around the site, short enough that a
   changed prompt or model is never stale for long. */
/* Versioned: a cached reply written against an older shape of the prompt is
   not a hit, it is a wrong answer served fast. */
const CACHE_PREFIX = 'timeline-grouping:6:';

function readCache(key: string): TimelineGrouping | null {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + key);
    return cached ? (JSON.parse(cached) as TimelineGrouping) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, grouping: TimelineGrouping): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(grouping));
  } catch {
    /* A full or blocked store is not a reason to fail the view. */
  }
}

export async function groupTimeline(
  records: TimelineRecord[],
  options: { subject?: string; signal?: AbortSignal } = {}
): Promise<TimelineGrouping> {
  const key = `${options.subject ?? ''}|${records.map((r) => r.id).join(',')}`;
  const cached = readCache(key);
  if (cached) return cached;

  const response = await fetch(getGroupingEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records, subject: options.subject }),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Timeline grouping failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: TimelineGrouping | null;
    error: string | null;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error ?? 'Timeline grouping returned no data');
  }

  writeCache(key, payload.data);
  return payload.data;
}
