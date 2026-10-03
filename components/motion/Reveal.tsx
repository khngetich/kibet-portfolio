import type { ReactNode } from 'react';

export { ScrollWords } from './ScrollWords';

export const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades and lifts its children as they scroll into view. CSS only (`.reveal` in globals.css, a
 * scroll-driven animation), so the content is in the first paint and never waits for JavaScript;
 * browsers without scroll-driven animations, and visitors who prefer reduced motion, simply see it.
 * `delay` (seconds, as before) staggers siblings by starting a little later in the scroll.
 */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const style = { '--reveal-y': `${y}px`, ...(delay ? { '--reveal-shift': `${Math.round(delay * 40)}%` } : {}) } as React.CSSProperties;
  return <div className={`reveal${className ? ` ${className}` : ''}`} style={style}>{children}</div>;
}
