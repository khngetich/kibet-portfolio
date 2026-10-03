'use client';

import { m as motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';

function ScrollWord({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <><motion.span className="word" style={{ opacity }}>{word}</motion.span>{' '}</>;
}

/**
 * A heading whose words light up one after another as it scrolls through the viewport.
 * The same markup renders on the server and in the browser; reduced motion (the visitor's
 * setting or Styles → Motion off) is handled in CSS (`.scroll-words`), so nothing mismatches.
 */
export function ScrollWords({ text, className, as: Tag = 'h2', id }: { text: string; className?: string; as?: 'h2' | 'p'; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.45'] });
  const words = text.split(/\s+/);
  return (
    <Tag ref={ref as never} className={`scroll-words${className ? ` ${className}` : ''}`} id={id} aria-label={text}>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <ScrollWord key={`${w}-${i}`} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </Tag>
  );
}
