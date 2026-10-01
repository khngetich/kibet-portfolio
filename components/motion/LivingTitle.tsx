'use client';

import { useReducedMotionConfig } from 'motion/react';
import { Fragment, useEffect, useRef } from 'react';

/**
 * The hero headline as living type: each letter's ink spreads as the cursor comes near and
 * dries back as it leaves, like wet ink on paper. The spread is a text stroke, not a heavier
 * weight, so glyph widths never change and the headline never reflows. On touch screens one
 * ink wave runs across the line after the intro. Off with reduced motion or Styles → Motion off.
 *
 * Words keep the `.word` spans and `--i` of the CSS entrance (sections.css), so the first paint
 * is unchanged; screen readers get the plain sentence.
 */

const RADIUS = 140; // px of influence around the pointer
const MAX = 0.055; // em of stroke at the centre

export function LivingTitle({ text }: { text: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotionConfig();

  useEffect(() => {
    const el = root.current;
    if (!el || reduce || document.documentElement.dataset.motion === 'off') return;
    const letters = Array.from(el.querySelectorAll<HTMLElement>('.ch'));
    const hero = el.closest('section') ?? el;
    let centres: { x: number; y: number }[] = [];
    let frame = 0;
    let target: { x: number; y: number } | null = null;
    const ink = letters.map(() => 0);

    const measure = () => { centres = letters.map((l) => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
    const tick = () => {
      frame = 0;
      let moving = false;
      letters.forEach((l, i) => {
        const c = centres[i];
        const goal = target && c ? Math.exp(-((c.x - target.x) ** 2 + (c.y - target.y) ** 2) / (2 * (RADIUS / 2) ** 2)) : 0;
        // ink spreads fast and dries slowly
        ink[i] += (goal - ink[i]) * (goal > ink[i] ? 0.35 : 0.08);
        if (Math.abs(goal - ink[i]) > 0.002) moving = true;
        l.style.setProperty('--ink', (ink[i] * MAX).toFixed(4));
      });
      if (moving) frame = requestAnimationFrame(tick);
    };
    const kick = () => { if (!frame) frame = requestAnimationFrame(tick); };

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onMove = (e: PointerEvent) => { if (!centres.length) measure(); target = { x: e.clientX, y: e.clientY }; kick(); };
    const onLeave = () => { target = null; kick(); };
    const reset = () => { centres = []; };

    let wave: number | undefined;
    if (fine) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      window.addEventListener('scroll', reset, { passive: true });
      window.addEventListener('resize', reset);
    } else {
      // touch: one wave from left to right once the words have landed
      wave = window.setTimeout(() => {
        measure();
        const r = el.getBoundingClientRect();
        const start = performance.now();
        const run = (t: number) => {
          const p = Math.min(1, (t - start) / 1600);
          target = p < 1 ? { x: r.left + p * r.width, y: r.top + r.height / 2 } : null;
          kick();
          if (p < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
      }, 1400);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wave);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', reset);
      window.removeEventListener('resize', reset);
    };
  }, [reduce, text]);

  const words = text.split(/\s+/);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span ref={root} className="living" aria-hidden="true">
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span className="word" style={{ '--i': i } as React.CSSProperties}>
              {Array.from(word).map((ch, j) => <span key={j} className="ch">{ch}</span>)}
            </span>{' '}
          </Fragment>
        ))}
      </span>
    </>
  );
}
