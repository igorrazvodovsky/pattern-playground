// Check for Intl support with fallbacks
const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat 
  ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  : null;

const dateFormatter = typeof Intl !== 'undefined' && Intl.DateTimeFormat
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })
  : null;

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

  // Fallback formatting when Intl is not available
  const formatFallback = (val: number, timeUnit: string) => {
    const absVal = Math.abs(val);
    if (absVal === 1) {
      return `1 ${timeUnit} ago`;
    }
    return `${absVal} ${timeUnit}s ago`;
  };

  // Use relative format for recent events (within 7 days)
  if (Math.abs(value) <= 7 && unit === 'day') {
    return rtf ? rtf.format(value, unit) : formatFallback(value, 'day');
  }
  if (['hour', 'minute'].includes(unit)) {
    return rtf ? rtf.format(value, unit) : formatFallback(value, unit);
  }

  // Use absolute date format for older events, with fallback
  if (dateFormatter) {
    return dateFormatter.format(date);
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
};