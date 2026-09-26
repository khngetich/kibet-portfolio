'use client';

import { motion, useReducedMotionConfig, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Fragment, useRef, type ReactNode } from 'react';

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotionConfig();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Word-by-word entrance for the hero headline. CSS only (see `.hero-title .word` in
 * sections.css), so the words are in the first paint and don't wait for hydration.
 */
export function SplitWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/\s+/).map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="word" style={{ '--i': i } as React.CSSProperties}>{word}</span>{' '}
        </Fragment>
      ))}
    </>
  );
}

function ScrollWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <><motion.span className="word" style={{ opacity }}>{word}</motion.span>{' '}</>;
}

/** A heading whose words light up one after another as it scrolls through the viewport. */
export function ScrollWords({ text, className, as: Tag = 'h2', id }: { text: string; className?: string; as?: 'h2' | 'p'; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionConfig();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.45'] });
  const words = text.split(/\s+/);
  if (reduce) return <Tag ref={ref as never} className={className} id={id}>{text}</Tag>;
  return (
    <Tag ref={ref as never} className={className} id={id} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <ScrollWord key={`${w}-${i}`} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </Tag>
  );
}
