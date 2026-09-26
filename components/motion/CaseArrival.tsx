'use client';

import { useLayoutEffect } from 'react';

/**
 * Opening a project card pins the case study's header in view for the morph (sections.css),
 * which also stops Next from scrolling the new page to the top. This does that scroll itself,
 * before the new page is captured, and only while that transition is running.
 */
export function CaseArrival() {
  useLayoutEffect(() => {
    let opening = false;
    try { opening = document.documentElement.matches(':active-view-transition-type(case-open)'); } catch { /* selector unsupported */ }
    if (opening && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return null;
}
