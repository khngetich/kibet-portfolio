'use client';

/**
 * The current year. Pages are built ahead of time, so a year baked in at build would go stale on
 * 1 January; the browser fills in today's (the server's year shows until then, no layout shift).
 */
export function Year() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
