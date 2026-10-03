'use client';

import Link from 'next/link';
import { m as motion, useReducedMotionConfig, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { Img } from '@/components/Img';

export type Step = { title: string; description?: string | null; points?: string[] | null; image?: unknown };

function Card({ step, i, total, progress, ctaLabel, ctaUrl }: { step: Step; i: number; total: number; progress: MotionValue<number>; ctaLabel: string; ctaUrl: string }) {
  const reduce = useReducedMotionConfig();
  // Once the next card starts covering this one, shrink and dim it slightly.
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - i) * 0.05]);
  // dimmed with a black overlay's opacity (composited) rather than a brightness filter (repaints)
  const dim = useTransform(progress, [start, 1], [0, (total - 1 - i) * 0.12]);
  const n = String(i + 1).padStart(2, '0');

  return (
    <div className="stack-slot" style={{ top: `calc(12vh + ${i * 22}px)` }}>
      <motion.article className="stack-card" style={reduce ? undefined : { scale }}>
        {!reduce && <motion.span className="stack-dim" style={{ opacity: dim }} aria-hidden="true" />}
        <div className="stack-text">
          <span className="pill-tag">Step {n}</span>
          <h3>{step.title}</h3>
          {step.description && <p className="stack-desc">{step.description}</p>}
          {!!step.points?.length && (
            <ul className="stack-points">{step.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          )}
          <Link className="btn btn-dark stack-cta" href={ctaUrl}>{ctaLabel}</Link>
          <span className="stack-num" aria-hidden="true">{n}</span>
        </div>
        <div className="stack-media">
          <Img media={step.image} sizes="(max-width: 800px) 90vw, 40vw" />
        </div>
      </motion.article>
    </div>
  );
}

/** Process steps as sticky cards that pile on top of one another while scrolling. */
export function StackCards({ steps, ctaLabel, ctaUrl }: { steps: Step[]; ctaLabel: string; ctaUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  return (
    <div ref={ref} className="stack">
      {steps.map((s, i) => <Card key={s.title} step={s} i={i} total={steps.length} progress={scrollYProgress} ctaLabel={ctaLabel} ctaUrl={ctaUrl} />)}
    </div>
  );
}
