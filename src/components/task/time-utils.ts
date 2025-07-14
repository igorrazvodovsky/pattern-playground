export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Use relative time for recent events (within 7 days)
  if (diffInDays < 7) {
    const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });
    
    if (diffInMinutes < 1) {
      return rtf.format(0, 'second'); // "now"
    } else if (diffInMinutes < 60) {
      return rtf.format(-diffInMinutes, 'minute');
    } else if (diffInHours < 24) {
      return rtf.format(-diffInHours, 'hour');
    } else {
      return rtf.format(-diffInDays, 'day');
    }
  }

  // Use absolute time for older events
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
};