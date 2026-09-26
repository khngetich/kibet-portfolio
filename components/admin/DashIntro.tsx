'use client';

import { useLayoutEffect, useRef } from 'react';

/** Module state survives client-side navigation but resets on a full page load. */
let played = false;

/**
 * The dashboard's cards stagger in on first load only. The server always renders the
 * `is-intro` class so the entrance starts with the first paint; when the dashboard is
 * reached again by in-app navigation, the class is removed before paint, so it just appears.
 */
export function DashIntro() {
  const ref = useRef<HTMLSpanElement>(null);
  // decided at render, so Strict Mode's second effect run doesn't mistake itself for a revisit
  const revisit = useRef(played);
  useLayoutEffect(() => {
    if (revisit.current) ref.current?.closest('.cms-dash')?.classList.remove('is-intro');
    played = true;
  }, []);
  return <span ref={ref} hidden />;
}
