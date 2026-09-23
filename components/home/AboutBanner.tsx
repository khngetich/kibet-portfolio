'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { EASE } from './Reveal';

type Stat = { value: string; label: string };

/**
 * “Hi, I’m …” — a red, full-bleed portrait with stat cards that slide in from the sides
 * and the first name rising up out of the bottom edge as the section scrolls past.
 */
export function AboutBanner({ greeting, firstName, headline, photo, stats, linkLabel }: { greeting: string; firstName: string; headline: string; photo: unknown; stats: Stat[]; linkLabel: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const nameY = useTransform(scrollYProgress, [0.25, 1], ['55%', '0%']);
  const nameScale = useTransform(scrollYProgress, [0.25, 1], [0.86, 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], ['12%', '0%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <section ref={ref} className="about-banner" id="about" aria-labelledby="about-title">
      <motion.div className="about-banner-photo" style={reduce ? undefined : { y: photoY, scale: photoScale }} aria-hidden="true">
        <Img media={photo} sizes="(max-width: 800px) 100vw, 60vw" />
      </motion.div>
      <div className="about-banner-shade" aria-hidden="true" />

      <div className="wrap about-banner-head">
        <p className="eyebrow">{greeting}</p>
        <h2 className="h-lg" id="about-title">{headline}</h2>
        <Link className="link-arrow" href="/about">{linkLabel} <Icon name="arrow" size={15} /></Link>
      </div>

      {!!stats.length && (
        <div className="wrap about-stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.value + s.label}
              className="about-stat"
              initial={reduce ? false : { opacity: 0, x: (i - (stats.length - 1) / 2) * 80, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1, delay: i * 0.1, ease: EASE }}
            >
              <b>{s.value}</b>
              <p>{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sized by letter count so any first name spans the width without overflowing. */}
      <motion.p className="about-name" style={{ fontSize: `min(23rem, ${Math.round(158 / Math.max(firstName.length, 4))}vw)`, ...(reduce ? {} : { y: nameY, scale: nameScale }) }} aria-hidden="true">{firstName}</motion.p>
    </section>
  );
}
