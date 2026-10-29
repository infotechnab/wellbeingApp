const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Today, 14:05", "Yesterday, 09:30" or "3 Oct, 18:20". */
export function formatWhen(at: number, now: number = Date.now()): string {
  const date = new Date(at);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  if (at >= startOfToday.getTime()) return `Today, ${time}`;
  if (at >= startOfToday.getTime() - dayMs) return `Yesterday, ${time}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${time}`;
}

/** "1.0.0 (build 12)", or just "1.0.0" when there's no build number, as on the web. */
export function formatVersion(version: string | null | undefined, build?: string | null): string | null {
  if (!version) return null;
  return build ? `${version} (build ${build})` : version;
}

/** A length of time as "m:ss", such as "4:05". */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
