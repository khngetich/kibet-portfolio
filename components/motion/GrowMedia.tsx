'use client';

import { m as motion, useReducedMotionConfig, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Img } from '@/components/Img';

/** A media panel that starts inset and grows to full size as it scrolls up to the centre. */
export function GrowMedia({ media, full }: { media: unknown; full?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionConfig();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [40, full ? 0 : 20]);
  const inner = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  return (
    <motion.div ref={ref} className={`grow${full ? ' grow-full' : ''}`} style={reduce ? undefined : { scale, borderRadius: radius }}>
      <motion.div className="grow-inner" style={reduce ? undefined : { scale: inner }}>
        <Img media={media} sizes={full ? '100vw' : '(max-width: 1240px) 100vw, 1200px'} />
      </motion.div>
    </motion.div>
  );
}
