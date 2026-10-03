'use client';

import { useStill } from './useStill';
import { paletteVars } from '@/lib/paletteVars';
import Link from 'next/link';
import { m as motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Img } from '@/components/Img';

/**
 * The three cards under the hero. They rise in on load (CSS, so they paint before hydration),
 * widen on hover, and as the page
 * scrolls they lift and grow while their captions fade in underneath.
 */
export function HeroCards({ projects }: { projects: ProjectCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 0.35'] });
  const scale = useTransform(scrollYProgress, [0.35, 1], [0.92, 1.04]);
  const y = useTransform(scrollYProgress, [0.35, 1], [0, -40]);
  const captions = useTransform(scrollYProgress, [0.55, 0.9], [0, 1]);

  return (
    <motion.div ref={ref} className="hero-cards" style={reduce ? undefined : { scale, y }}>
      {projects.map((p, i) => (
        <div key={p.id} className="hero-card intro-card" style={{ '--i': i, ...paletteVars(p.palette) } as React.CSSProperties}>
          <Link href={`/work/${p.slug}`} className="hero-card-link">
            <div className="hero-card-media">
              <Img media={p.cover} sizes="(max-width: 700px) 70vw, 28vw" preload={i === 0} />
            </div>
            <motion.div className="hero-card-caption" style={reduce ? undefined : { opacity: captions }}>
              <b>{p.title}</b>
              <span>{p.summary || disciplineList(p.disciplines)}</span>
            </motion.div>
          </Link>
        </div>
      ))}
    </motion.div>
  );
}
