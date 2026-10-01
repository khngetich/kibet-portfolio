'use client';

import { animate, useInView, useReducedMotionConfig } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Sketch → final: two images stacked, the earlier one wiped away by a handle. Drag anywhere on
 * the image (mouse, pen or touch) or use the arrow keys on the slider underneath. The first time
 * it scrolls into view the handle sweeps once across and back, so it reads as something to touch;
 * any interaction stops the sweep, and reduced motion skips it.
 */
export function BeforeAfter({ before, after, beforeLabel, afterLabel }: { before: ReactNode; after: ReactNode; beforeLabel?: string | null; afterLabel?: string | null }) {
  const [pos, setPos] = useState(50);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const sweep = useRef<ReturnType<typeof animate> | null>(null);
  const seen = useInView(root, { once: true, amount: 0.6 });
  const reduce = useReducedMotionConfig();
  const a = beforeLabel?.trim() || 'Before';
  const b = afterLabel?.trim() || 'After';

  useEffect(() => {
    if (!seen || reduce || touched.current) return;
    sweep.current = animate(50, [50, 78, 22, 50], { duration: 2.2, ease: 'easeInOut', delay: 0.3, onUpdate: (v) => setPos(v) });
    return () => sweep.current?.stop();
  }, [seen, reduce]);

  const take = () => { touched.current = true; sweep.current?.stop(); };
  const fromPointer = (x: number) => {
    const r = root.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={root}
      className="ba"
      style={{ '--pos': `${pos}%` } as React.CSSProperties}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        take();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => { if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) fromPointer(e.clientX); }}
    >
      <div className="ba-layer">{after}</div>
      <div className="ba-layer ba-before">{before}</div>
      <span className="ba-tag ba-tag-l" style={{ opacity: pos < 12 ? 0 : 1 }}>{a}</span>
      <span className="ba-tag ba-tag-r" style={{ opacity: pos > 88 ? 0 : 1 }}>{b}</span>
      <input
        className="ba-range" type="range" min={0} max={100} step={1} value={Math.round(pos)}
        onChange={(e) => { take(); setPos(Number(e.target.value)); }}
        aria-label={`Compare ${a.toLowerCase()} and ${b.toLowerCase()}`}
        aria-valuetext={`${Math.round(pos)}% ${a.toLowerCase()}`}
      />
      <span className="ba-handle" aria-hidden="true">
        <span className="ba-knob">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" /></svg>
        </span>
      </span>
    </div>
  );
}
