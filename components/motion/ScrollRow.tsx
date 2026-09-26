'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';

/**
 * A light horizontal scroll of cards (native scrolling with snap points, so touch, trackpad
 * and keyboard all work), with previous / next buttons that appear only when there is more
 * to see in that direction.
 */
export function ScrollRow({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener('scroll', measure); };
  }, [measure]);
  const by = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: d * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <div className={`scroll-row ${className}`}>
      <ul ref={ref} className="scroll-row-track" role="region" aria-label={label} tabIndex={0}>{children}</ul>
      {!(edges.start && edges.end) && (
        <div className="scroll-row-nav">
          <button type="button" className="flow-btn" onClick={() => by(-1)} disabled={edges.start} aria-label="Previous"><Icon name="left" size={16} /></button>
          <button type="button" className="flow-btn" onClick={() => by(1)} disabled={edges.end} aria-label="Next"><Icon name="right" size={16} /></button>
        </div>
      )}
    </div>
  );
}
