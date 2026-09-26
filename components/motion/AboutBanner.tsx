'use client';

import Link from 'next/link';
import { motion, useReducedMotionConfig, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { EASE } from './Reveal';
import { ServiceLink } from './ServiceLink';

type Stat = { value: string; label: string };
type Service = { title: string; description?: string | null };

/**
 * About & services on the red backdrop. The cut-out portrait stands in the middle; the intro
 * and expertise sit in a column on the left and the services (each opening the contact form
 * with that service chosen) on the right, above the stats and the first name rising out of
 * the bottom edge as the section scrolls past. The bottom fades back into the page so the
 * next chapter follows on.
 */
export function AboutBanner(props: {
  id?: string; headingId: string; chapter?: ReactNode;
  greeting: string; name: string; bigName: string; headline: string; photo: unknown;
  intro: string; expertise: string[]; servicesHeading: string; services: Service[];
  stats: Stat[]; cta?: { label: string; url: string; className: string } | null; link?: { label: string; url: string } | null;
}) {
  const { id, headingId, chapter, greeting, name, bigName, headline, photo, intro, expertise, servicesHeading, services, stats, cta, link } = props;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionConfig();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const nameY = useTransform(scrollYProgress, [0.25, 1], ['55%', '0%']);
  const nameScale = useTransform(scrollYProgress, [0.25, 1], [0.86, 1]);
  const photoY = useTransform(scrollYProgress, [0, 1], ['12%', '0%']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const hasColumns = !!(intro || expertise.length || services.length);
  const rise = (i: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '0px 0px -10% 0px' }, transition: { duration: 0.9, delay: i * 0.1, ease: EASE } });

  return (
    <section ref={ref} className={`about-banner${hasColumns ? ' has-columns' : ''}`} id={id} {...(headline ? { 'aria-labelledby': headingId } : { 'aria-label': 'About' })}>
      <motion.div className="about-banner-photo" style={reduce ? undefined : { y: photoY, scale: photoScale }} aria-hidden="true">
        <Img media={photo} sizes="(max-width: 800px) 100vw, 60vw" />
      </motion.div>
      <div className="about-banner-shade" aria-hidden="true" />

      <div className="wrap about-banner-head">
        {chapter}
        {headline && <h2 className="h-lg" id={headingId}>{headline}</h2>}
      </div>

      {hasColumns && (
        <div className="wrap about-columns">
          <motion.div className="about-panel about-bio" {...rise(0)}>
            <p className="about-lead"><b>{greeting ? `${greeting} ${name},` : `${name},`}</b> {intro}</p>
            {!!expertise.length && <ul className="about-expertise">{expertise.map((e) => <li key={e}><Icon name="check" size={15} />{e}</li>)}</ul>}
            <div className="about-actions">
              {cta && <Link className={cta.className} href={cta.url}>{cta.label} <Icon name="arrow" size={15} /></Link>}
              {link && <Link className="link-arrow" href={link.url}>{link.label} <Icon name="arrow" size={15} /></Link>}
            </div>
          </motion.div>
          {!!services.length && (
            <motion.div className="about-panel about-services" {...rise(1)}>
              {servicesHeading && <h3 className="about-panel-title">{servicesHeading}</h3>}
              <ul>
                {services.map((s) => (
                  <li key={s.title}>
                    <ServiceLink className="about-service" service={s.title}>
                      <span><b>{s.title}</b>{s.description && <small>{s.description}</small>}</span>
                      <Icon name="arrow" size={16} />
                    </ServiceLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}

      {!!stats.length && (
        <div className="wrap about-stats">
          {stats.map((s, i) => (
            <motion.div
              key={s.value + s.label}
              className="about-stat"
              initial={reduce ? false : { opacity: 0, x: (i - (stats.length - 1) / 2) * 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 1, delay: i * 0.1, ease: EASE }}
            >
              <b>{s.value}</b>
              <p>{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sized by letter count so any name spans the width without overflowing. */}
      <motion.p className="about-name" style={{ fontSize: `min(23rem, ${Math.round(158 / Math.max(bigName.length, 4))}vw)`, ...(reduce ? {} : { y: nameY, scale: nameScale }) }} aria-hidden="true">{bigName}</motion.p>
    </section>
  );
}
