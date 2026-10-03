'use client';

import Link from 'next/link';
import { AnimatePresence, animate, m as motion, useInView, useReducedMotionConfig } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { Accent, plain } from '@/components/Accent';

export type AboutTab = { label: string; heading: string; text?: string | null; rows: { value: string; label: string }[] };

/** "3.5M+" → 0 → 3.5, keeping the prefix, suffix and decimals; values without a number stay as they are. */
function CountUp({ value, run }: { value: string; run: boolean }) {
  const m = value.match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/);
  const reduce = useReducedMotionConfig();
  const ref = useRef<HTMLSpanElement>(null);
  const target = m ? Number(m[2].replace(',', '.')) : 0;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const pad = m && !decimals && m[2].startsWith('0') ? m[2].length : 0; // "04" keeps its leading zero
  const fmt = (v: number) => (m ? `${m[1]}${v.toFixed(decimals).padStart(pad, '0')}${m[3]}` : value);
  // The markup always holds the real value (server render, first client render, no-JS, search
  // engines and link previews all see it). Only after hydration, and only with motion allowed,
  // does the effect swap the text to 0 while the figure waits out of view, then count up on entry.
  useEffect(() => {
    const el = ref.current;
    if (!m || !el) return;
    if (reduce) { el.textContent = value; return; }
    if (!run) { el.textContent = fmt(0); return; }
    const c = animate(0, target, { duration: 1.6, ease: [0.2, 0, 0, 1], onUpdate: (v) => { el.textContent = fmt(v); }, onComplete: () => { el.textContent = value; } });
    return () => c.stop();
  }, [run, target, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <>{value}</>;
  return <span ref={ref}>{value}</span>;
}

/**
 * How a tab's rows read best, worked out from the values themselves:
 *  - "01", "02", … in order → a numbered list (the label is the item)
 *  - numbers ("50+", "3.5M+", "100%") → specimen figures that count up
 *  - words ("Live", "Weekly") → a stamped badge beside each note
 */
type Kind = 'list' | 'figures' | 'stamps';
const kindOf = (rows: AboutTab['rows']): Kind => {
  if (rows.length && rows.every((r, i) => /^\d{1,2}$/.test(r.value.trim()) && Number(r.value) === i + 1)) return 'list';
  if (rows.length && rows.every((r) => /\d/.test(r.value))) return 'figures';
  return 'stamps';
};

/** The portrait as a print proof: crop marks, a colour bar and a "Proof" label. `children` sit on the sheet (stickers). */
export function ProofPrint({ photo, moodPhoto, mood = false, name, children }: { photo: unknown; moodPhoto?: unknown; mood?: boolean; name: string; children?: ReactNode }) {
  return (
    <div className="about-proof-sheet">
      <span className="about-proof-crop is-tl" aria-hidden="true" />
      <span className="about-proof-crop is-tr" aria-hidden="true" />
      <span className="about-proof-crop is-bl" aria-hidden="true" />
      <span className="about-proof-crop is-br" aria-hidden="true" />
      <div className="about-proof-photo">
        <span className={`about-proof-layer${mood ? ' is-hidden' : ''}`}><Img media={photo} sizes="(max-width: 900px) 80vw, 40vw" /></span>
        {!!moodPhoto && <span className={`about-proof-layer${mood ? '' : ' is-hidden'}`} aria-hidden={!mood}><Img media={moodPhoto} sizes="(max-width: 900px) 80vw, 40vw" /></span>}
      </div>
      <span className="about-proof-bar" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <span className="about-proof-label" aria-hidden="true">Proof 01 · {plain(name)}</span>
      {children}
    </div>
  );
}

/**
 * The folder: index tabs along its top edge (the active one rises) over a card that swaps its
 * contents, each tab laid out for what it holds. The card's heading is the section's h2 when
 * the folder carries it (`headingId`), otherwise an h3 under the section's own heading.
 */
export function AboutFolder({ tabs, seen, link, headingId }: { tabs: AboutTab[]; seen: boolean; link?: { label: string; url: string } | null; headingId?: string }) {
  const base = useId();
  const reduce = useReducedMotionConfig();
  const [tab, setTab] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const t = tabs[tab] ?? tabs[0];
  if (!t) return null;
  const kind = kindOf(t.rows);
  const H = headingId ? 'h2' : 'h3';

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const to = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (to == null) return;
    e.preventDefault();
    setTab(to);
    btns.current[to]?.focus();
  };

  return (
    <div className="about-folder">
      {tabs.length > 1 && (
        <div className="about-folder-tabs" role="tablist" aria-label="About">
          {tabs.map((x, i) => (
            <button
              key={x.label}
              ref={(el) => { btns.current[i] = el; }}
              type="button" role="tab" id={`${base}-tab-${i}`} aria-controls={`${base}-panel`} aria-selected={tab === i} tabIndex={tab === i ? 0 : -1}
              className={tab === i ? 'is-on' : undefined}
              onClick={() => setTab(i)} onKeyDown={(e) => onKey(e, i)}
            >
              <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{x.label}
            </button>
          ))}
        </div>
      )}
      <div className="about-folder-card" role={tabs.length > 1 ? 'tabpanel' : undefined} id={`${base}-panel`} aria-labelledby={tabs.length > 1 ? `${base}-tab-${tab}` : undefined}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <H className={`about-ed-heading${headingId ? '' : ' is-sub'}`} id={headingId}><Accent text={t.heading} /></H>
            {t.text && <p className="about-ed-text">{t.text}</p>}
            {!!t.rows.length && kind === 'figures' && (
              <dl className="about-figures">
                {t.rows.map((r) => (
                  <div key={r.label} className="about-figure">
                    {/* label first for the definition list; the number is shown above it (CSS) */}
                    <dt>{r.label}</dt>
                    <dd><CountUp value={r.value} run={seen} /></dd>
                  </div>
                ))}
              </dl>
            )}
            {!!t.rows.length && kind === 'list' && (
              <ol className="about-list">
                {t.rows.map((r) => <li key={r.label}><span className="about-list-n" aria-hidden="true">{r.value}</span>{r.label}</li>)}
              </ol>
            )}
            {!!t.rows.length && kind === 'stamps' && (
              <dl className="about-stamps">
                {t.rows.map((r, i) => (
                  <div key={r.label} className="about-stamp-row">
                    <dt className="about-stamp" style={{ '--tilt': `${[-6, 4, -3, 5][i % 4]}deg` } as React.CSSProperties}>{r.value}</dt>
                    <dd>{r.label}</dd>
                  </div>
                ))}
              </dl>
            )}
            {link && tab === 0 && <Link className="link-under" href={link.url}>{link.label} <Icon name="arrow" size={14} /></Link>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * About, as a designer's proof sheet: the portrait as a print (ProofPrint) with the name and
 * role beneath, and on the right the folder (AboutFolder) carrying the section's heading. The
 * figures count up the first time the section is seen. Same props as before, so every page
 * using this layout keeps its content.
 */
export function AboutEditorial({ id, headingId, chapter, name, role, photo, tabs, watermark, link }: {
  id?: string; headingId: string; chapter?: ReactNode; name: string; role?: string | null; photo: unknown;
  tabs: AboutTab[]; watermark: string; link?: { label: string; url: string } | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  return (
    <section ref={ref} className={`about-ed${seen ? ' is-seen' : ''}`} id={id} aria-labelledby={headingId}>
      <p className="about-ed-watermark" aria-hidden="true">{watermark}</p>
      <div className="wrap about-ed-grid">
        {/* the label gets its own row, so the print's top edge lines up with the folder tabs */}
        {chapter && <div className="about-ed-label">{chapter}</div>}
        <figure className="about-proof">
          <ProofPrint photo={photo} name={name} />
          <figcaption className="about-proof-caption">
            <span className="about-ed-title">{name}</span>
            {role && <span className="about-ed-role">{role}</span>}
          </figcaption>
        </figure>
        <div className="about-ed-right">
          <AboutFolder tabs={tabs} seen={seen} link={link} headingId={headingId} />
        </div>
      </div>
    </section>
  );
}
