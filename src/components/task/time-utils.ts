const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });

const getTimeDifference = (date: Date, now: Date) => {
  const diffInMs = now.getTime() - date.getTime();

  const units = [
    { unit: 'year' as Intl.RelativeTimeFormatUnit, ms: 31536000000 },
    { unit: 'month' as Intl.RelativeTimeFormatUnit, ms: 2628000000 },
    { unit: 'week' as Intl.RelativeTimeFormatUnit, ms: 604800000 },
    { unit: 'day' as Intl.RelativeTimeFormatUnit, ms: 86400000 },
    { unit: 'hour' as Intl.RelativeTimeFormatUnit, ms: 3600000 },
    { unit: 'minute' as Intl.RelativeTimeFormatUnit, ms: 60000 }
  ];

  for (const { unit, ms } of units) {
    const value = Math.round(diffInMs / ms);
    if (Math.abs(value) >= 1) {
      return { value: -value, unit };
    }
  }

  return { value: 0, unit: 'second' as Intl.RelativeTimeFormatUnit };
};

export const formatTimestamp = (timestamp: Date | string | number): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const { value, unit } = getTimeDifference(date, now);

  // For very recent events, always return "now"
  if (unit === 'second') {
    return 'now';
  }

  // Use relative format for recent events (within 7 days)
  if (Math.abs(value) <= 7 && unit === 'day') {
    return rtf.format(value, unit);
  }
  if (['hour', 'minute'].includes(unit)) {
    return rtf.format(value, unit);
  }

  // Use absolute date format for older events
  return dateFormatter.format(date);
};