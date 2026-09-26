'use client';

import { useState } from 'react';

/** Pause/play glyphs shared by the looping marquee and the carousel. */
export function PauseGlyph({ paused }: { paused: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
      {paused ? <path d="M8.5 5.5v13l10-6.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
    </svg>
  );
}

/**
 * Stops the client marquee beside it (WCAG 2.2.2: moving content can be paused). Toggles
 * `data-paused` on the element just before this button; CSS pauses the animation.
 */
export function MarqueeToggle({ label = 'client names' }: { label?: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      className="loop-toggle"
      aria-pressed={paused}
      aria-label={paused ? `Play scrolling ${label}` : `Pause scrolling ${label}`}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        (e.currentTarget.previousElementSibling as HTMLElement | null)?.toggleAttribute('data-paused', next);
      }}
    >
      <PauseGlyph paused={paused} />
    </button>
  );
}
