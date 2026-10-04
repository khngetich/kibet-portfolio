'use client';

import { useStill } from './useStill';
import { paletteVars } from '@/lib/paletteVars';
import Link from 'next/link';
import { m as motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { Img } from '@/components/Img';

/**
 * The work under the hero, as a bento: the first project large on the left, the next two stacked
 * beside it. Each tile carries its number, title, client and year and disciplines on a scrim over
 * the cover, so nothing is cut off mid-sentence. The tiles rise in on load (CSS, so they paint
 * before hydration) and lift slightly as the page scrolls. On phones they become a swipe row.
 */
export function HeroCards({ projects }: { projects: ProjectCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end 0.35'] });
  const y = useTransform(scrollYProgress, [0.35, 1], [0, -32]);

  return (
    <motion.div ref={ref} className="hero-cards" data-count={projects.length} style={reduce ? undefined : { y }}>
      {projects.map((p, i) => {
        const meta = [p.client, p.year].filter(Boolean).join(' · ');
        const tags = disciplineList(p.disciplines);
        return (
          <div key={p.id} className={`hero-card intro-card${i === 0 ? ' is-lead' : ''}`} style={{ '--i': i, ...paletteVars(p.palette) } as React.CSSProperties}>
            <Link href={`/work/${p.slug}`} className="hero-card-link" aria-label={`${p.title}. View the case study`}>
              <span className="hero-card-media">
                <Img media={p.cover} sizes={i === 0 ? '(max-width: 700px) 80vw, 60vw' : '(max-width: 700px) 80vw, 36vw'} preload={i === 0} />
              </span>
              <span className="hero-card-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="hero-card-go" aria-hidden="true"><Icon name="arrow" size={16} /></span>
              <span className="hero-card-caption">
                {meta && <span className="hero-card-meta">{meta}</span>}
                <b>{p.title}</b>
                {i === 0 && p.summary ? <span className="hero-card-text">{p.summary}</span> : tags && <span className="hero-card-text">{tags}</span>}
              </span>
            </Link>
          </div>
        );
      })}
    </motion.div>
  );
}
