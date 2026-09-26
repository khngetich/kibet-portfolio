'use client';

import { motion, useReducedMotionConfig, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

/** The footer's white card, sliding up from behind the dark CTA card as the footer scrolls in. */
export function FooterRise({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionConfig();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], [110, 0]);
  return <motion.div ref={ref} className={className} style={reduce ? undefined : { y }}>{children}</motion.div>;
}
