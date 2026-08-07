import React from 'react';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatTime,
  formatUnit,
  isoDateTime,
} from '@shared/format';
import '../../jsx-types';

/**
 * The Figures entry's example tables, rendered rather than transcribed.
 *
 * Every cell comes out of `@shared/format` — the same module the components
 * use — so the documented rendering and the shipped rendering cannot drift.
 * These are the one place a locale is passed explicitly: the point of the
 * table is to show the variation a single actor would otherwise never see, and
 * the page is documentation, not a product surface.
 */

/** A fixed instant, so the tables read the same on every visit. */
const SAMPLE = new Date('1952-09-26T16:29:00Z');
const LOCALES = ['en-GB', 'en-US', 'de-DE', 'ja-JP', 'fr-FR', 'ar-EG'];

const Table: React.FC<{ columns: string[]; rows: (string | React.ReactNode)[][] }> = ({
  columns,
  rows,
}) => (
  <pp-table>
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{j === 0 ? <code>{cell}</code> : cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </pp-table>
);

export const DateLengths: React.FC = () => (
  <Table
    columns={['locale', 'date', 'short date', 'time']}
    rows={LOCALES.map((locale) => [
      locale,
      formatDate(SAMPLE, { dateStyle: 'medium' }, locale),
      formatDate(SAMPLE, { dateStyle: 'short' }, locale),
      formatTime(SAMPLE, { timeStyle: 'short' }, locale),
    ])}
  />
);

export const Currency: React.FC = () => (
  <Table
    columns={['locale', 'a sum', 'a round sum', 'as a code']}
    rows={LOCALES.map((locale) => [
      locale,
      formatCurrency(1204338.5, 'GBP', undefined, locale),
      formatCurrency(75, 'GBP', undefined, locale),
      formatCurrency(75, 'GBP', { currencyDisplay: 'code' }, locale),
    ])}
  />
);

export const Numbers: React.FC = () => (
  <Table
    columns={['locale', 'a figure', 'compact', 'a unit']}
    rows={LOCALES.map((locale) => [
      locale,
      formatNumber(1234567.5, undefined, locale),
      formatNumber(1247, { notation: 'compact' }, locale),
      formatUnit(5.5, 'kilometer', { unitDisplay: 'long' }, locale),
    ])}
  />
);

/**
 * Relative time as it actually ships: the phrase, the machine-readable value,
 * and the absolute value that stays reachable underneath it.
 */
export const RelativeTime: React.FC = () => {
  const now = Date.now();
  const samples: [string, Date][] = [
    ['40 seconds', new Date(now - 40 * 1000)],
    ['20 minutes', new Date(now - 20 * 60 * 1000)],
    ['5 hours', new Date(now - 5 * 60 * 60 * 1000)],
    ['3 days', new Date(now - 3 * 24 * 60 * 60 * 1000)],
    ['8 days — past the threshold', new Date(now - 8 * 24 * 60 * 60 * 1000)],
    ['9 months', new Date(now - 273 * 24 * 60 * 60 * 1000)],
  ];

  return (
    <Table
      columns={['elapsed', 'rendered — hover or read it out', 'datetime attribute']}
      rows={samples.map(([label, date]) => [
        label,
        <pp-timestamp key="t" value={isoDateTime(date)}>
          <time dateTime={isoDateTime(date)}>{formatDateTime(date)}</time>
        </pp-timestamp>,
        <code key="d">{date.toISOString()}</code>,
      ])}
    />
  );
};
