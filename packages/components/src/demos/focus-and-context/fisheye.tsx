import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { lifecycleEvents } from '@shared/data';
import {
  collapseSingletons,
  groupTimeline,
  resolveGrouping,
  spanLength,
  type TimelineSpan,
} from '../../services/timeline-grouping-service';
import '../../jsx-types';

/**
 * A fisheye over the life of one e-bike, as a lifecycle assessment counted it:
 * fifteen years of flows from smelter to shredder, each with its kilograms of
 * CO₂e. The whole life is one span made of phases, each made of episodes, each
 * made of flows — the same kind of thing at four grains, a stretch of the life
 * said in one sentence, so a single template renders the whole tree and a level
 * is just how coarse a sentence you are being told.
 *
 * The machine is Wattenberger's fisheye for text, taken whole rather than by
 * analogy: the lens is the pointer, and it reaches the bottom of the tree at
 * once. The flow under it is told verbatim — day, site, kilograms — the rest
 * of its episode stands aside for the episode's sentence, the neighbouring
 * episodes say theirs, and the chapters beyond say theirs. Distance from the
 * pointer buys abstraction and nothing else: there is no opening and closing,
 * no state the pointer's position doesn't already carry.
 *
 * Nothing moves. Every flow owns the same fixed slot of the frame in every
 * state, so the lens changes what a stretch says, never where it sits. A
 * record's line is taller than its slot, so the focused flow is a card raised
 * over the terrain rather than a row in it — magnification spills over the
 * neighbours' slots instead of pushing them away, which is what makes the
 * lens safe to drive with the pointer: the terrain cannot slide out from
 * under it, because the terrain never changes shape at all.
 *
 * The sentences above the flow level are asked of a model
 * (`/api/timeline/group`), because where one episode ends and the next begins
 * is a judgement about what happened — a cell batch failing and its aftermath,
 * a second life — and neither the calendar nor the stage column gets it right:
 * the recall spans two stages and four weeks, and is a chapter in neither. The
 * finest grain needs no model: a line in the assessment already says what it is.
 *
 * Until the grouping arrives — and if the local API isn't running at all — the
 * same view falls back to what the calendar can do on its own, which is the
 * comparison worth having on screen: the shape survives, the meaning doesn't.
 */

const mass = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

/* No days at a distance: over fifteen years the day of the month is noise,
   and the reader is placing a stretch in the life, not in the week. Under the
   lens the flow is being read as a record, and the record gets its day. */
const dayMonthYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const monthYearShort = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });
const monthShort = new Intl.DateTimeFormat('en-GB', { month: 'short' });

/** The extent of a span, said as shortly as the span allows. */
function rangeOf(span: TimelineSpan): string {
  const first = new Date(lifecycleEvents[span.from].date);
  const last = new Date(lifecycleEvents[span.to - 1].date);

  if (spanLength(span) === 1) return monthYearShort.format(first);
  if (first.getFullYear() !== last.getFullYear()) {
    return `${monthShort.format(first)} ${first.getFullYear()} – ${monthShort.format(last)} ${last.getFullYear()}`;
  }
  if (first.getMonth() === last.getMonth()) return monthYear.format(first);
  return `${monthShort.format(first)}–${monthShort.format(last)} ${first.getFullYear()}`;
}

const flows = (count: number) => `${count} ${count === 1 ? 'flow' : 'flows'}`;

/**
 * The calendar's own answer: runs of years, then single years, then the flows
 * themselves. It has to bin — a year of an object's life is not a comparable
 * unit of anything, and half the years here hold one entry — so it bins on the
 * only thing it can see, which is how many. It can group and it can count, but
 * it cannot say what a stretch of the life was about, which is the whole reason
 * the sentences are asked of a model.
 */
function calendarSpans(): TimelineSpan {
  const leaf = (index: number): TimelineSpan => ({
    id: lifecycleEvents[index].id,
    sentence: lifecycleEvents[index].description,
    from: index,
    to: index + 1,
  });

  const byYear = new Map<number, number[]>();
  lifecycleEvents.forEach((event, index) => {
    const year = new Date(event.date).getFullYear();
    byYear.set(year, [...(byYear.get(year) ?? []), index]);
  });

  const years: TimelineSpan[] = [...byYear.entries()].map(([year, indices]) => ({
    id: `y${year}`,
    title: String(year),
    sentence: `${flows(indices.length)} recorded in the year.`,
    from: indices[0],
    to: indices.at(-1)! + 1,
    children: indices.map(leaf),
  }));

  /* Years gathered until a run is worth a band of its own. Purely mechanical:
     the calendar can count to eight, and that is all this is. */
  const runs: TimelineSpan[][] = [];
  years.forEach((year) => {
    const last = runs.at(-1);
    const short = last && last.reduce((sum, span) => sum + spanLength(span), 0) < 8;
    if (short) last.push(year);
    else runs.push([year]);
  });
  if (runs.length > 1 && runs.at(-1)!.reduce((sum, span) => sum + spanLength(span), 0) < 8) {
    runs.at(-2)!.push(...runs.pop()!);
  }

  const phases = runs.map((children, index) => {
    const first = children[0].title!;
    const last = children.at(-1)!.title!;
    return {
      id: `r${index}`,
      title: first === last ? first : `${first}–${last}`,
      sentence: `${flows(children.reduce((sum, child) => sum + spanLength(child), 0))} across ${children.length === 1 ? 'the year' : `${children.length} years`}.`,
      from: children[0].from,
      to: children.at(-1)!.to,
      children,
    };
  });

  return collapseSingletons({
    id: 'run',
    sentence: '',
    from: 0,
    to: lifecycleEvents.length,
    children: phases,
  });
}

const contains = (span: TimelineSpan, index: number) => index >= span.from && index < span.to;

/** How many levels sit between a span and the record the lens is on. */
function depthBelow(span: TimelineSpan, index: number): number {
  let depth = 0;
  let node = span;
  while (node.children) {
    node = node.children.find((child) => contains(child, index))!;
    depth += 1;
  }
  return depth;
}

/**
 * A stretch the lens is not inside, saying itself at the grain its ring
 * allows: title, extent, sentence for a chapter or an episode; the bare line
 * for a lone flow. Its height is its share of the record — fixed, whatever
 * the lens does.
 */
function Zone({ span, ring }: { span: TimelineSpan; ring: number }) {
  const flow = spanLength(span) === 1 ? lifecycleEvents[span.from] : null;

  return (
    <div
      className="fisheye__zone"
      data-ring={ring}
      style={{ ['--len' as string]: spanLength(span) }}
    >
      {flow ? (
        <span className="fisheye__line">
          <time className="fisheye__when" dateTime={flow.date}>
            {monthYearShort.format(new Date(flow.date))}
          </time>
          <span className="fisheye__what">{flow.description}</span>
        </span>
      ) : (
        <span className="fisheye__body">
          <span className="fisheye__heading">
            <span className="fisheye__title">{span.title}</span>
            <span className="fisheye__range">{rangeOf(span)}</span>
          </span>
          <span className="fisheye__sentence">{span.sentence}</span>
        </span>
      )}
    </div>
  );
}

/**
 * The slots an episode's other flows own while one of them is being read.
 * They keep their dots and their room, and what fills the room is the
 * episode's own sentence — the stretch re-told one grain coarser, so the
 * record on the card is never floating free of what it belongs to. The
 * sentence is said once, in whichever flanking gap has more room, rather
 * than mirrored on both sides.
 */
function Gap({ parent, length, body }: { parent: TimelineSpan; length: number; body: boolean }) {
  return (
    <div className="fisheye__gap" data-ring={0} style={{ ['--len' as string]: length }}>
      {body && (
        <span className="fisheye__body">
          <span className="fisheye__heading">
            <span className="fisheye__title">{parent.title}</span>
            <span className="fisheye__range">{rangeOf(parent)}</span>
          </span>
          <span className="fisheye__sentence">{parent.sentence}</span>
        </span>
      )}
    </div>
  );
}

/**
 * The record under the lens, told in full. A line does not fit the slot a
 * flow owns, so the card rides over the terrain instead of asking the
 * neighbours for room, with its own dot on the rail where the slot's would be.
 */
function FocusFlow({ span }: { span: TimelineSpan }) {
  const flow = lifecycleEvents[span.from];

  return (
    <div className="fisheye__slot" style={{ ['--len' as string]: 1 }}>
      <div className="fisheye__card">
        <span className="fisheye__line">
          <time className="fisheye__when" dateTime={flow.date}>
            {dayMonthYear.format(new Date(flow.date))}
          </time>
          <span className="fisheye__what">{flow.description}</span>
          <span className="fisheye__site">{flow.site}</span>
          {/* A recovered flow gives mass back, so the sign is the reading. */}
          <span className="fisheye__amount">{mass.format(flow.co2e)} kg</span>
        </span>
      </div>
    </div>
  );
}

/**
 * The children of the span whose own children hold the lens: runs of flows
 * become gaps, the focused flow becomes the card, and — where a one-flow
 * episode was collapsed away and a whole episode sits beside bare flows —
 * the episodes stay zones. Stable keys on the gaps flanking the card let
 * their heights animate as the lens walks the episode.
 */
function TipChildren({ span, kids, focus }: { span: TimelineSpan; kids: TimelineSpan[]; focus: number }) {
  const focusIndex = kids.findIndex((kid) => contains(kid, focus));

  /* The sentence goes to the roomier of the two gaps flanking the card: said
     once, and where it has the best chance of fitting under its heading. */
  let above = 0;
  for (let i = focusIndex - 1; i >= 0 && !kids[i].children; i--) above += 1;
  let below = 0;
  for (let i = focusIndex + 1; i < kids.length && !kids[i].children; i++) below += 1;
  const bodyAt = above === 0 && below === 0 ? -1 : above >= below ? focusIndex - 1 : focusIndex + 1;

  const parts: ReactNode[] = [];
  let start = -1;
  const flush = (end: number) => {
    if (start < 0) return;
    const run = kids.slice(start, end);
    const key = end === focusIndex ? 'above' : start === focusIndex + 1 ? 'below' : run[0].id;
    parts.push(
      <Gap
        key={key}
        parent={span}
        length={run.reduce((sum, kid) => sum + spanLength(kid), 0)}
        body={bodyAt >= start && bodyAt < end}
      />
    );
    start = -1;
  };

  kids.forEach((kid, index) => {
    if (index === focusIndex) {
      flush(index);
      parts.push(<FocusFlow key="slot" span={kid} />);
    } else if (kid.children) {
      flush(index);
      parts.push(<Zone key={kid.id} span={kid} ring={0} />);
    } else if (start < 0) {
      start = index;
    }
  });
  flush(kids.length);

  return <>{parts}</>;
}

/**
 * One template, four grains: a span holding the lens renders its
 * constituents; every other span is a zone at the grain its distance allows.
 */
function Node({ span, focus, ring }: { span: TimelineSpan; focus: number; ring: number }) {
  if (!contains(span, focus)) return <Zone span={span} ring={ring} />;
  if (!span.children) return <FocusFlow span={span} />;

  const kids = span.children;
  const focusChild = kids.find((child) => contains(child, focus))!;
  const childRing = depthBelow(focusChild, focus);
  const tip = !focusChild.children;

  return (
    <div
      className="fisheye__band"
      data-tip={tip ? '' : undefined}
      style={{ ['--len' as string]: spanLength(span) }}
    >
      {tip ? (
        <TipChildren span={span} kids={kids} focus={focus} />
      ) : (
        kids.map((kid) => <Node key={kid.id} span={kid} focus={focus} ring={childRing} />)
      )}
    </div>
  );
}

type Source = 'loading' | 'model' | 'calendar';

export function FisheyeTimelineDemo() {
  const [root, setRoot] = useState<TimelineSpan | null>(null);
  const [source, setSource] = useState<Source>('loading');
  const [focus, setFocus] = useState<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const records = lifecycleEvents.map((event) => ({
      id: event.id,
      date: event.date,
      label: event.description,
      amount: event.co2e,
      category: event.stage,
    }));

    groupTimeline(records, {
      subject:
        'A cradle-to-grave lifecycle assessment of one urban commuter e-bike, ' +
        'from 2010 to 2026. Amounts are kilograms of CO2e; a negative amount is ' +
        'a burden avoided by recovery or reuse.',
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        const resolved = resolveGrouping(result, records);
        if (!resolved) throw new Error('unusable grouping');
        setRoot(resolved);
        setSource('model');
      })
      .catch(() => {
        if (!controller.signal.aborted) setSource('calendar');
      });

    return () => controller.abort();
  }, []);

  const spans = useMemo(() => root ?? calendarSpans(), [root]);
  const total = spanLength(spans);

  /* The pointer's height in the frame IS the lens: every flow owns the same
     share of the block, so the record meant is arithmetic, not hit-testing —
     the card riding over neighbouring slots can never steal their hover. */
  const lensAt = (clientY: number) => {
    const rect = frame.current!.getBoundingClientRect();
    const index = Math.floor(((clientY - rect.top) / rect.height) * total);
    setFocus(Math.max(0, Math.min(total - 1, index)));
  };

  const step = (delta: number) =>
    setFocus((current) => {
      const next = current === null ? (delta > 0 ? 0 : total - 1) : current + delta;
      return Math.max(0, Math.min(total - 1, next));
    });

  const focused = focus === null ? null : lifecycleEvents[focus];
  const ringAtTop = focus === null ? 2 : depthBelow(spans.children!.find((child) => contains(child, focus))!, focus);

  return (
    <div className="flow">
      <div
        className="fisheye"
        ref={frame}
        style={{ ['--flows' as string]: total }}
        tabIndex={0}
        aria-label="Fisheye timeline. Arrow keys move the lens flow by flow; Escape rests it."
        onMouseMove={(event) => lensAt(event.clientY)}
        onMouseLeave={() => setFocus(null)}
        onClick={(event) => lensAt(event.clientY)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') step(1);
          else if (event.key === 'ArrowUp') step(-1);
          else if (event.key === 'Home') setFocus(0);
          else if (event.key === 'End') setFocus(total - 1);
          else if (event.key === 'Escape' && focus !== null) {
            event.stopPropagation();
            setFocus(null);
            return;
          } else return;
          event.preventDefault();
        }}
      >
        {focus === null
          ? spans.children!.map((child) => <Zone key={child.id} span={child} ring={2} />)
          : spans.children!.map((child) => (
              <Node key={child.id} span={child} focus={focus} ring={ringAtTop} />
            ))}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {focused &&
          `${dayMonthYear.format(new Date(focused.date))}: ${focused.description}, ${mass.format(focused.co2e)} kilograms.`}
      </p>

      <p className="fisheye__provenance" aria-live="polite">
        {source === 'loading' && (
          <>
            <pp-spinner></pp-spinner> Analyzing...
          </>
        )}
      </p>
    </div>
  );
}
