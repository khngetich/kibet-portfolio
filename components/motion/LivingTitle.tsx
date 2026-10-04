'use client';

import { useReducedMotionConfig } from 'motion/react';
import { Fragment, useEffect, useRef } from 'react';
import { SelectionMarks } from '@/components/Highlight';

/**
 * The hero headline as living type: each letter's ink spreads as the cursor comes near and
 * dries back as it leaves, like wet ink on paper. The spread is a text stroke, not a heavier
 * weight, so glyph widths never change and the headline never reflows. On touch screens one
 * ink wave runs across the line after the intro. Off with reduced motion or Styles → Motion off.
 *
 * Words keep the `.word` spans and `--i` of the CSS entrance (sections.css), so the first paint
 * is unchanged; screen readers get the plain sentence.
 *
 * Marker: words wrapped in asterisks (`I craft *experiences*`) are "selected", as in a design
 * tool: a tinted box with a caret and handle at each end and a few sparkles, dragged across once
 * the words land. The asterisks never show, in the title or to screen readers.
 */

/**
 * "a *b c*. d" → [{ words: ['a'] }, { words: ['b', 'c'], marked: true, space: true }, { words: ['.'] }, …]
 * `space`: the text had a space before this group (so "*word*." keeps its full stop attached).
 */
function parse(text: string) {
  const parts = text.split(/(\*[^*]+\*)/);
  return parts.map((p, i) => {
    const marked = p.startsWith('*') && p.endsWith('*') && p.length > 2;
    const space = i > 0 && (/^\s/.test(p) || /\s$/.test(parts[i - 1]));
    return { marked, space, words: (marked ? p.slice(1, -1) : p).trim().split(/\s+/).filter(Boolean) };
  }).filter((g) => g.words.length);
}

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

  const groups = parse(text);
  const plain = groups.map((g, i) => `${i > 0 && g.space ? ' ' : ''}${g.words.join(' ')}`).join('');
  let n = 0; // word index across groups, for the staggered entrance
  const word = (w: string) => {
    const i = n++;
    return <span className="word" style={{ '--i': i } as React.CSSProperties}>{Array.from(w).map((ch, j) => <span key={j} className="ch">{ch}</span>)}</span>;
  };
  return (
    <>
      <span className="sr-only">{plain}</span>
      <span ref={root} className="living" aria-hidden="true">
        {groups.map((g, gi) => (
          <Fragment key={gi}>
            {gi > 0 && g.space && ' '}
            {g.marked ? (
              <span className="marker hl" style={{ '--mi': n + g.words.length } as React.CSSProperties}>
                {g.words.map((w, wi) => <Fragment key={wi}>{wi > 0 && ' '}{word(w)}</Fragment>)}
                <SelectionMarks />
              </span>
            ) : g.words.map((w, wi) => <Fragment key={wi}>{wi > 0 && ' '}{word(w)}</Fragment>)}
          </Fragment>
        ))}
      </span>
    </>
  );
}
