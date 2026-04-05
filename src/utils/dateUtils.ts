import dayjs from 'dayjs';

export function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(timestamp: number): string {
  return dayjs(timestamp).format('MMM DD');
}

export function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('hh:mm A');
}

export function formatFullDate(timestamp: number): string {
  return dayjs(timestamp).format('MMMM D, YYYY');
}

export function formatMonoDate(date?: Date): string {
  return dayjs(date).format('MMMM D, YYYY');
}

export function getDayOfWeek(timestamp: number): number {
  // 0 = Monday, 6 = Sunday
  const day = dayjs(timestamp).day();
  return day === 0 ? 6 : day - 1;
}

export function getStartOfWeek(): number {
  const now = dayjs();
  const dayOfWeek = now.day(); // 0=Sun, 1=Mon, ... 6=Sat
  // Calculate days since Monday (Monday = 0 days back)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return now.subtract(daysSinceMonday, 'day').startOf('day').valueOf();
}

export function getStartOfMonth(): number {
  return dayjs().startOf('month').valueOf();
}

export function getDaysAgo(days: number): number {
  return dayjs().subtract(days, 'day').startOf('day').valueOf();
}

export function isToday(timestamp: number): boolean {
  return dayjs(timestamp).isSame(dayjs(), 'day');
}

export function getDailyQuoteIndex(): number {
  const start = dayjs().startOf('year');
  const dayOfYear = dayjs().diff(start, 'day');
  return dayOfYear % 7;
}
