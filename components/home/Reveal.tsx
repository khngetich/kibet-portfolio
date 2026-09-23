'use client';

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Fragment, useRef, type ReactNode } from 'react';

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades, lifts and un-blurs its children the first time they scroll into view. */
export function Reveal({ children, delay = 0, y = 28, className }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word blur-in, played once on load. Used for the hero headline. */
export function SplitWords({ text, delay = 0, stagger = 0.06 }: { text: string; delay?: number; stagger?: number }) {
  const reduce = useReducedMotion();
  return (
    <>
      {text.split(/\s+/).map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span
            className="word"
            initial={reduce ? false : { opacity: 0, y: '0.35em', filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: EASE }}
          >
            {word}
          </motion.span>{' '}
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
  const reduce = useReducedMotion();
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
