'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Img } from '@/components/Img';
import { EASE } from './Reveal';

/**
 * The three cards under the hero. They rise in on load, widen on hover, and as the page
 * scrolls they lift and grow while their captions fade in underneath.
 */
export function HeroCards({ projects }: { projects: ProjectCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 0.35'] });
  const scale = useTransform(scrollYProgress, [0.35, 1], [0.92, 1.04]);
  const y = useTransform(scrollYProgress, [0.35, 1], [0, -40]);
  const captions = useTransform(scrollYProgress, [0.55, 0.9], [0, 1]);

  return (
    <motion.div ref={ref} className="hero-cards" style={reduce ? undefined : { scale, y }}>
      {projects.map((p, i) => (
        <motion.div
          key={p.id}
          className="hero-card"
          initial={reduce ? false : { opacity: 0, y: 60, rotate: (i - 1) * 4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.1, delay: 0.55 + i * 0.12, ease: EASE }}
        >
          <Link href={`/work/${p.slug}`} className="hero-card-link">
            <div className="hero-card-media">
              <Img media={p.cover} sizes="(max-width: 700px) 70vw, 28vw" preload={i < 3} />
            </div>
            <motion.div className="hero-card-caption" style={reduce ? undefined : { opacity: captions }}>
              <b>{p.title}</b>
              <span>{p.summary || disciplineList(p.disciplines)}</span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
