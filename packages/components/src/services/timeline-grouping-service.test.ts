import { describe, it, expect } from 'vitest';
import {
  collapseSingletons,
  resolveGrouping,
  spanLength,
  type TimelineGrouping,
  type TimelineRecord,
  type TimelineSpan,
} from './timeline-grouping-service.js';

// `resolveGrouping` is where a model's answer meets the records it claims to
// describe. Every rule it applies is a repair — a boundary that names no
// record, a boundary that runs backwards, a level with nothing to choose
// between — so the tests are written as one case per repair rather than one
// case per happy path.

const records: TimelineRecord[] = Array.from({ length: 6 }, (_, index) => ({
  id: `r${index}`,
  date: `2026-01-0${index + 1}`,
  label: `record ${index}`,
}));

const episode = (title: string, startId: string) => ({
  title,
  summary: `${title} summary`,
  startId,
});

const grouping = (
  ...phases: { title: string; episodes: ReturnType<typeof episode>[] }[]
): TimelineGrouping => ({
  phases: phases.map((phase) => ({ ...phase, summary: `${phase.title} summary` })),
});

describe('spanLength', () => {
  it('counts the records a span stands for, the range being half-open', () => {
    expect(spanLength({ id: 'a', sentence: '', from: 2, to: 5 })).toBe(3);
    expect(spanLength({ id: 'a', sentence: '', from: 2, to: 3 })).toBe(1);
  });
});

describe('collapseSingletons', () => {
  const leaf = (id: string, from: number): TimelineSpan => ({
    id,
    sentence: id,
    from,
    to: from + 1,
  });

  it('replaces a span whose only content is one child with that child', () => {
    const collapsed = collapseSingletons({
      id: 'outer',
      title: 'Outer',
      sentence: 'outer',
      from: 0,
      to: 1,
      children: [leaf('inner', 0)],
    });

    expect(collapsed.id).toBe('inner');
  });

  it('leaves a span with two or more children alone', () => {
    const span: TimelineSpan = {
      id: 'outer',
      sentence: 'outer',
      from: 0,
      to: 2,
      children: [leaf('a', 0), leaf('b', 1)],
    };

    expect(collapseSingletons(span).id).toBe('outer');
    expect(collapseSingletons(span).children).toHaveLength(2);
  });

  it('collapses through a chain, so no singleton level survives at any depth', () => {
    const collapsed = collapseSingletons({
      id: 'run',
      sentence: '',
      from: 0,
      to: 2,
      children: [
        {
          id: 'phase',
          sentence: 'phase',
          from: 0,
          to: 2,
          children: [
            {
              id: 'episode',
              sentence: 'episode',
              from: 0,
              to: 2,
              children: [leaf('a', 0), leaf('b', 1)],
            },
          ],
        },
      ],
    });

    expect(collapsed.id).toBe('episode');
    expect(collapsed.children?.map((child) => child.id)).toEqual(['a', 'b']);
  });

  it('returns a leaf untouched', () => {
    expect(collapseSingletons(leaf('a', 0))).toEqual(leaf('a', 0));
  });
});

describe('resolveGrouping', () => {
  it('covers the run with no gap: each episode ends where the next begins', () => {
    const resolved = resolveGrouping(
      grouping(
        { title: 'First', episodes: [episode('E1', 'r0'), episode('E2', 'r2')] },
        { title: 'Second', episodes: [episode('E3', 'r4')] }
      ),
      records
    )!;

    expect(resolved.from).toBe(0);
    expect(resolved.to).toBe(records.length);

    // The second phase held one episode, so it collapsed into it — the phase
    // level was a grain with nothing to choose between.
    const [first, second] = resolved.children!;
    expect(first.title).toBe('First');
    expect(second.title).toBe('E3');

    const spans = [...first.children!, second];
    expect(spans.map((span) => [span.from, span.to])).toEqual([
      [0, 2],
      [2, 4],
      [4, 6],
    ]);
  });

  it('names the finest grain from the record, not from the model', () => {
    const resolved = resolveGrouping(
      grouping(
        { title: 'First', episodes: [episode('E1', 'r0'), episode('E2', 'r3')] },
        { title: 'Second', episodes: [episode('E3', 'r5')] }
      ),
      records
    )!;

    const leaves = resolved.children![0].children![0].children!;
    expect(leaves.map((leaf) => leaf.sentence)).toEqual([
      'record 0',
      'record 1',
      'record 2',
    ]);
    expect(leaves.every((leaf) => leaf.title === undefined)).toBe(true);
    expect(leaves.map((leaf) => leaf.id)).toEqual(['r0', 'r1', 'r2']);
  });

  it('leaves the root unnamed, because the caller titles the run', () => {
    const resolved = resolveGrouping(
      grouping(
        { title: 'First', episodes: [episode('E1', 'r0')] },
        { title: 'Second', episodes: [episode('E2', 'r2')] },
        { title: 'Third', episodes: [episode('E3', 'r4')] }
      ),
      records
    )!;

    expect(resolved.id).toBe('run');
    expect(resolved.title).toBeUndefined();
    expect(resolved.sentence).toBe('');
  });

  it('discards a boundary naming a record that is not in the run', () => {
    const resolved = resolveGrouping(
      grouping({
        title: 'Only',
        episodes: [episode('E1', 'r0'), episode('Invented', 'r99'), episode('E2', 'r3')],
      }),
      records
    )!;

    expect(resolved.children!.map((span) => span.title)).toEqual(['E1', 'E2']);
  });

  it('discards a boundary that runs backwards, or repeats the one before it', () => {
    const resolved = resolveGrouping(
      grouping({
        title: 'Only',
        episodes: [
          episode('E1', 'r0'),
          episode('E2', 'r2'),
          episode('Backwards', 'r1'),
          episode('Repeat', 'r2'),
          episode('E3', 'r4'),
        ],
      }),
      records
    )!;

    expect(resolved.children!.map((span) => span.title)).toEqual(['E1', 'E2', 'E3']);
  });

  it('reduces an episode covering one record to that record', () => {
    const resolved = resolveGrouping(
      grouping({
        title: 'Only',
        episodes: [episode('E1', 'r0'), episode('E2', 'r4'), episode('Last', 'r5')],
      }),
      records
    )!;

    // `Last` opens on the final record and so stands for it alone. A stretch
    // made of one thing is that thing: the episode gives way to the leaf, which
    // carries no title because a record is named by what it says.
    const last = resolved.children!.at(-1)!;
    expect(last.id).toBe('r5');
    expect(last.title).toBeUndefined();
    expect(last.sentence).toBe('record 5');
  });

  it('pulls the first episode back to the first record', () => {
    const resolved = resolveGrouping(
      grouping({
        title: 'Only',
        episodes: [episode('Late start', 'r2'), episode('E2', 'r4')],
      }),
      records
    )!;

    const [first] = resolved.children!;
    expect(first.title).toBe('Late start');
    expect([first.from, first.to]).toEqual([0, 4]);
  });

  it('merges two adjacent phases the model gave the same name', () => {
    const resolved = resolveGrouping(
      grouping(
        { title: 'Same', episodes: [episode('E1', 'r0')] },
        { title: 'Same', episodes: [episode('E2', 'r3')] }
      ),
      records
    )!;

    // One phase spanning the run, holding both episodes — and with the run
    // reduced to a single phase, the root collapsed into it.
    expect(resolved.title).toBe('Same');
    expect([resolved.from, resolved.to]).toEqual([0, 6]);
    expect(resolved.children!.map((span) => span.title)).toEqual(['E1', 'E2']);
  });

  it('keeps repeated names apart when another phase separates them', () => {
    const resolved = resolveGrouping(
      grouping(
        { title: 'A', episodes: [episode('E1', 'r0')] },
        { title: 'B', episodes: [episode('E2', 'r2')] },
        { title: 'A', episodes: [episode('E3', 'r4')] }
      ),
      records
    )!;

    expect(resolved.children).toHaveLength(3);
  });

  it('refuses a grouping that would leave one level or none', () => {
    expect(
      resolveGrouping(grouping({ title: 'Only', episodes: [episode('E1', 'r0')] }), records)
    ).toBeNull();

    expect(resolveGrouping(grouping({ title: 'Empty', episodes: [] }), records)).toBeNull();

    expect(resolveGrouping({ phases: [] }, records)).toBeNull();

    // Every boundary invented: nothing survives to group by.
    expect(
      resolveGrouping(
        grouping({ title: 'Only', episodes: [episode('E1', 'x'), episode('E2', 'y')] }),
        records
      )
    ).toBeNull();
  });

  it('survives a reply missing the arrays it promised', () => {
    expect(resolveGrouping({} as TimelineGrouping, records)).toBeNull();
    expect(
      resolveGrouping({ phases: [{ title: 'A', summary: 'a' }] } as TimelineGrouping, records)
    ).toBeNull();
  });
});
