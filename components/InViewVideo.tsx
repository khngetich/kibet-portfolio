'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A muted, looping clip that only plays while it's on screen (it isn't downloaded and
 * decoded until then). It stays paused on the first frame when the visitor prefers reduced
 * motion or the site's Motion setting is Off. Outside a link or button it gets a small
 * pause/play control, so moving content can always be stopped (WCAG 2.2.2).
 */
export function InViewVideo({ src, label, className, style }: { src: string; label: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [control, setControl] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    setControl(!v.parentElement?.closest('a, button'));
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';
    if (still) { userPaused.current = true; setPaused(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    userPaused.current = !v.paused;
    if (v.paused) v.play().catch(() => {}); else v.pause();
    setPaused(userPaused.current);
  };

  return (
    <>
      <video ref={ref} className={className} src={src} muted loop playsInline preload="metadata" aria-label={label} style={style} />
      {control && (
        <button type="button" className="video-toggle" onClick={toggle} aria-label={paused ? `Play ${label}` : `Pause ${label}`} aria-pressed={paused}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">{paused ? <path d="M8 5.5v13l10.5-6.5z" transform="translate(1 0)" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}</svg>
        </button>
      )}
    </>
  );
}
