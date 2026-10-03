'use client';

import { useSyncExternalStore } from 'react';

/**
 * Light / dark switch in the header. The choice is stored per browser; the boot script in
 * app/(frontend)/layout.tsx applies it before first paint. Switching cross-fades the colours
 * once (the `theme-switching` class) unless the visitor prefers reduced motion.
 */

type Theme = 'light' | 'dark';
const EVENT = 'site:theme';
const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb); };

function apply(next: Theme) {
  const root = document.documentElement;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm) root.classList.add('theme-switching');
  root.dataset.theme = next;
  root.style.colorScheme = next;
  try { localStorage.setItem('theme', next); } catch { /* private mode: this visit only */ }
  window.dispatchEvent(new Event(EVENT));
  if (!calm) window.setTimeout(() => root.classList.remove('theme-switching'), 350);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      onClick={() => apply(dark ? 'light' : 'dark')}
    >
      <svg className="theme-sun" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>
      <span className="theme-track" aria-hidden="true"><span className="theme-knob" /></span>
      <svg className="theme-moon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
    </button>
  );
}
