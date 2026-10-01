'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { Icon } from '@/components/ui/Icon';

const never = () => () => {};

/**
 * Greeting and date from the editor's own clock: the server renders in UTC, so a Nairobi
 * morning would read "Good night" there. Until hydration a neutral "Welcome back" holds the
 * line (same height, no layout shift).
 */
export function Greeting({ name }: { name?: string }) {
  const now = useSyncExternalStore(
    never,
    () => { const d = new Date(); return `${d.getHours()}|${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`; },
    () => null,
  );
  const [h, date] = now ? now.split('|') : [null, null];
  const hour = h == null ? null : Number(h);
  const hello = hour == null ? 'Welcome back' : hour < 5 ? 'Working late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="cms-hero-hello">
      <h1>{hello}{name ? `, ${name}` : ''}</h1>
      <p className="cms-hero-sub">{date ? `${date} · ` : ''}Here’s what needs your attention on the site.</p>
    </div>
  );
}

/**
 * The dashboard header, pinned under Payload's top bar while the page scrolls. A sentinel just
 * above it tells when it has stuck, and only then does it take a surface (blurred page colour
 * and a hairline): its height never changes, so pinning can't nudge the scroll position.
 */
export function StickyHero({ children }: { children: React.ReactNode }) {
  const sentinel = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    // stuck = the sentinel has gone under Payload's (sticky) top bar
    const top = document.querySelector('.app-header')?.getBoundingClientRect().height ?? 0;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: `-${top + 1}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <>
      <span ref={sentinel} className="cms-hero-sentinel" aria-hidden="true" />
      <header className={`cms-hero cms-anim${stuck ? ' is-stuck' : ''}`}>{children}</header>
    </>
  );
}

/**
 * Keeps the numbers fresh without a socket: re-fetches the server-rendered cards every two
 * minutes while the tab is visible and nothing is open on top, and when the editor comes back
 * to a tab that has gone stale. router.refresh() keeps all client state (filters, open rows).
 */
export function LiveStatus() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mins, setMins] = useState(0);
  const age = useRef(0);

  const refresh = useCallback(() => {
    age.current = 0;
    setMins(0);
    start(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const busy = () => !!document.querySelector('dialog[open], [class*="drawer--is-open"]');
    const id = window.setInterval(() => {
      age.current += 1;
      setMins(age.current);
      if (age.current >= 2 && document.visibilityState === 'visible' && !busy()) refresh();
    }, 60000);
    const onShow = () => { if (document.visibilityState === 'visible' && age.current >= 1 && !busy()) refresh(); };
    document.addEventListener('visibilitychange', onShow);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onShow); };
  }, [refresh]);

  return (
    <button type="button" className={`cms-live${pending ? ' is-pending' : ''}`} onClick={refresh} aria-label={`Refresh dashboard (updated ${mins ? `${mins} min ago` : 'just now'})`}>
      <span className="cms-live-dot" aria-hidden="true" />
      <span aria-live="polite">{pending ? 'Updating…' : mins ? `Updated ${mins} min ago` : 'Live'}</span>
      <Icon name="refresh" size={14} />
    </button>
  );
}
