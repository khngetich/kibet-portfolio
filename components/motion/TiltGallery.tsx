'use client';

import { m as motion, useReducedMotionConfig, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { Img } from '@/components/Img';
import type { Media } from '@/payload-types';

function Row({ images, progress, dir }: { images: Media[]; progress: MotionValue<number>; dir: 1 | -1 }) {
  const reduce = useReducedMotionConfig();
  const x = useTransform(progress, [0, 1], dir === 1 ? ['-18%', '4%'] : ['4%', '-18%']);
  return (
    <motion.div className="tilt-row" style={reduce ? { x: '-7%' } : { x }}>
      {images.map((m, i) => (
        <div className="tilt-tile" key={`${m.id}-${i}`}>
          <Img media={m} sizes="(max-width: 700px) 50vw, 26vw" />
        </div>
      ))}
    </motion.div>
  );
}

/** A tilted, perspective wall of work whose rows slide past each other and flatten out as it scrolls. */
export function TiltGallery({ images }: { images: Media[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionConfig();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const rotateX = useTransform(scrollYProgress, [0, 0.6], [32, 8]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.6], [-14, -6]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.25, 1.05]);
  const opacity = useTransform(scrollYProgress, [0.7, 1], [1, 0.2]);

  if (!images.length) return null;
  // Fill three rows of six by cycling whatever images there are.
  const tile = (offset: number) => Array.from({ length: 6 }, (_, i) => images[(i + offset) % images.length]);

  return (
    <div ref={ref} className="tilt" aria-hidden="true">
      <motion.div className="tilt-plane" style={reduce ? undefined : { rotateX, rotateZ, scale, opacity }}>
        <Row images={tile(0)} progress={scrollYProgress} dir={1} />
        <Row images={tile(2)} progress={scrollYProgress} dir={-1} />
        <Row images={tile(4)} progress={scrollYProgress} dir={1} />
      </motion.div>
    </div>
  );
}
