'use client';

import Link from 'next/link';
import { motion, useInView, useReducedMotionConfig } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { PauseGlyph } from './PauseButton';

const INTERVAL = 3800;

/**
 * Centre-stage carousel: the active project sits large in the middle, neighbours fan out
 * smaller behind it. Auto-advances while on screen (pausing for keyboard focus and drags),
 * and can be dragged, swiped, clicked or driven with the arrow keys.
 */
export function CoverFlow({ projects }: { projects: ProjectCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20% 0px' });
  const reduce = useReducedMotionConfig();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Stopped with the pause button (WCAG 2.2.2); stays stopped until played again.
  const [stopped, setStopped] = useState(false);
  // A drag that ends over the centre card must not also count as a click on its link.
  const dragged = useRef(false);
  const n = projects.length;

  const go = useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);

  useEffect(() => {
    if (!inView || paused || stopped || reduce || n < 2) return;
    const t = setTimeout(() => go(1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, inView, paused, stopped, reduce, n, go]);
  const rotating = !paused && !stopped && !reduce && n > 1;

  if (!n) return null;
  const current = projects[index % n];

  return (
    <div
      ref={ref}
      className="flow"
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects"
      tabIndex={0}
      // Not paused on hover: the carousel often scrolls under a resting cursor, which
      // would stop it before anyone sees it move. Manual navigation restarts the timer.
      onFocus={(e) => { if (e.target.matches(':focus-visible')) setPaused(true); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false); }}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); }}
    >
      <motion.div
        className="flow-stage"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragStart={() => { dragged.current = true; setPaused(true); }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 ? 1 : -1);
          setTimeout(() => { dragged.current = false; }, 0);
          setPaused(false);
        }}
      >
        {projects.map((p, i) => {
          // Shortest signed distance from the active card, so the ring wraps both ways.
          let d = i - index;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const abs = Math.abs(d);
          const hidden = abs > 2;
          return (
            <motion.div
              key={p.id}
              className={`flow-card${d === 0 ? ' is-active' : ''}`}
              initial={false}
              animate={{ x: `${d * 62}%`, scale: 1 - abs * 0.16, rotateY: d * -18, opacity: hidden ? 0 : 1 - abs * 0.22, zIndex: 10 - abs }}
              transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.9 }}
              style={{ pointerEvents: hidden ? 'none' : 'auto' }}
              aria-hidden={d !== 0}
            >
              {d === 0 ? (
                <Link href={`/work/${p.slug}`} className="flow-link" draggable={false} onClick={(e) => { if (dragged.current) e.preventDefault(); }}>
                  <Img media={p.cover} sizes="(max-width: 700px) 80vw, 46vw" />
                  <span className="flow-open">View case study <Icon name="arrow" size={14} /></span>
                </Link>
              ) : (
                <button type="button" className="flow-link" tabIndex={-1} onClick={() => { if (!dragged.current) go(d); }} aria-label={`Show ${p.title}`}>
                  <Img media={p.cover} sizes="(max-width: 700px) 60vw, 30vw" />
                </button>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* announced only when the visitor changes slides, not on every automatic turn */}
      <div className="flow-meta" aria-live={rotating ? 'off' : 'polite'}>
        <motion.div key={current.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <b>{current.title}</b>
          <span>{current.client}{current.disciplines?.length ? ` · ${disciplineList(current.disciplines)}` : ''}</span>
        </motion.div>
      </div>

      <div className="flow-controls">
        <button type="button" className="flow-btn" onClick={() => go(-1)} aria-label="Previous project"><Icon name="left" size={16} /></button>
        <div className="flow-dots">
          {projects.map((p, i) => (
            <button key={p.id} type="button" className={i === index ? 'is-active' : undefined} onClick={() => setIndex(i)} aria-label={`Go to ${p.title}`} aria-current={i === index} />
          ))}
        </div>
        <button type="button" className="flow-btn" onClick={() => go(1)} aria-label="Next project"><Icon name="right" size={16} /></button>
        {!reduce && n > 1 && (
          <button type="button" className="flow-btn flow-pause" onClick={() => setStopped((v) => !v)} aria-pressed={stopped} aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}>
            <PauseGlyph paused={stopped} />
          </button>
        )}
      </div>
    </div>
  );
}
