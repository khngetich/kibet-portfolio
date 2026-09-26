'use client';

import Link from 'next/link';
import { AnimatePresence, animate, motion, useInView, useReducedMotionConfig } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';

export type AboutTab = { label: string; heading: string; text?: string | null; rows: { value: string; label: string }[] };

const SPRING = { type: 'spring', stiffness: 260, damping: 30 } as const;

/** "3.5M+" → 0 → 3.5, keeping the prefix, suffix and decimals; values without a number stay as they are. */
function CountUp({ value, run }: { value: string; run: boolean }) {
  const m = value.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  const reduce = useReducedMotionConfig();
  const ref = useRef<HTMLSpanElement>(null);
  const target = m ? Number(m[2].replace(',', '.')) : 0;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const pad = m && !decimals && m[2].startsWith('0') ? m[2].length : 0; // "04" keeps its leading zero
  const fmt = (v: number) => (m ? `${m[1]}${v.toFixed(decimals).padStart(pad, '0')}${m[3]}` : value);
  useEffect(() => {
    if (!m || !ref.current || !run || reduce) return;
    const el = ref.current;
    const c = animate(0, target, { duration: 1.6, ease: [0.2, 0, 0, 1], onUpdate: (v) => { el.textContent = fmt(v); } });
    return () => c.stop();
  }, [run, target]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <>{value}</>;
  // renders the final value for no-JS / reduced motion; the effect counts up from 0 on entry
  return <span ref={ref}>{run || reduce ? value : fmt(0)}</span>;
}

/**
 * Editorial about: a monochrome cut-out portrait on the left with the name and role, and on
 * the right a heading, a short bio and a table of figures. The pill tabs on the slider line
 * below swap the right column (cross-fade) while the dot slides to the active tab; the
 * figures count up the first time the section scrolls into view.
 */
export function AboutEditorial({ id, headingId, chapter, name, role, photo, tabs, watermark, link }: {
  id?: string; headingId: string; chapter?: ReactNode; name: string; role?: string | null; photo: unknown;
  tabs: AboutTab[]; watermark: string; link?: { label: string; url: string } | null;
}) {
  const base = useId();
  const reduce = useReducedMotionConfig();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const [tab, setTab] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const t = tabs[tab] ?? tabs[0];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const to = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : null;
    if (to == null) return;
    e.preventDefault();
    setTab(to);
    btns.current[to]?.focus();
  };

  return (
    <section ref={ref} className="about-ed" id={id} aria-labelledby={headingId}>
      <p className="about-ed-watermark" aria-hidden="true">{watermark}</p>
      <div className="wrap about-ed-grid">
        <div className="about-ed-left">
          <div className="about-ed-photo"><Img media={photo} sizes="(max-width: 900px) 90vw, 45vw" /></div>
          <div className="about-ed-name">
            <p className="about-ed-title">{name}</p>
            {role && <p className="about-ed-role">{role}</p>}
          </div>
        </div>

        <div className="about-ed-right">
          {chapter}
          <div className="about-ed-panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${tab}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeOut' } }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <h2 className="about-ed-heading" id={headingId}>{t.heading}</h2>
                {t.text && <p className="about-ed-text">{t.text}</p>}
                {!!t.rows.length && (
                  <dl className="about-ed-table">
                    {t.rows.map((r) => (
                      <div key={r.label} className="about-ed-row">
                        <dt>{r.label}</dt>
                        <dd><CountUp value={r.value} run={seen} /></dd>
                      </div>
                    ))}
                  </dl>
                )}
                {link && tab === 0 && <Link className="link-arrow" href={link.url}>{link.label} <Icon name="arrow" size={15} /></Link>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {tabs.length > 1 && (
        <div className="wrap">
          <div className="about-ed-nav">
            <span className="about-ed-line" aria-hidden="true">
              <motion.span className="about-ed-dot" initial={false} animate={{ left: `${((tab + 0.5) / tabs.length) * 100}%` }} transition={reduce ? { duration: 0 } : SPRING} />
            </span>
            <div className="about-ed-tabs" role="tablist" aria-label="About">
              {tabs.map((x, i) => (
                <button
                  key={x.label}
                  ref={(el) => { btns.current[i] = el; }}
                  type="button" role="tab" id={`${base}-tab-${i}`} aria-controls={`${base}-panel`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1}
                  className={tab === i ? 'is-on' : undefined}
                  onClick={() => setTab(i)} onKeyDown={(e) => onKey(e, i)}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span> {x.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
