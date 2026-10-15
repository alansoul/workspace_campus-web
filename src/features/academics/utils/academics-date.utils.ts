export function getLiveGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export function getFormattedToday(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  return new Intl.DateTimeFormat('en-US', options).format(new Date());
}

export function getDayName(): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
}

/**
 * Calculates human-readable relative time badges (e.g. "Today", "Tomorrow", "In 3 days", "Overdue by 2d")
 */
export function getRelativeTimeBadge(targetDateStr: string): {
  label: string;
  isUrgent: boolean;
  isOverdue: boolean;
} {
  const target = new Date(targetDateStr);
  const now = new Date();
  
  // Strip hours for date-level precision
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffDays = Math.round((targetMidnight - nowMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)}d`, isUrgent: true, isOverdue: true };
  }
  if (diffDays === 0) {
    return { label: 'Due today', isUrgent: true, isOverdue: false };
  }
  if (diffDays === 1) {
    return { label: 'Tomorrow', isUrgent: true, isOverdue: false };
  }
  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, isUrgent: false, isOverdue: false };
  }
  
  return {
    label: target.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    isUrgent: false,
    isOverdue: false,
  };
}