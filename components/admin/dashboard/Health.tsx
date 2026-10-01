'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * Search & sharing health. The ring and the list use the same rule (passOf), so they always
 * agree. A share image may come from the site default in Site settings (the public site falls
 * back to it, and one image for every link is fine); titles and descriptions should be written
 * per page so search results don't repeat, so their fallbacks are shown but don't pass.
 * Each check is one segment of the ring; clicking a segment or its row lists the pages behind it.
 */

export type HealthPage = { title: string; href: string; state: 'own' | 'fallback' | 'missing' };
export type HealthCheck = { key: string; label: string; fallback: string; fallbackPasses: boolean; pages: HealthPage[]; fix?: { label: string; href: string } };

const SIZE = 148, STROKE = 12, GAP = 10; // gap between segments, in degrees
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const passes = (c: HealthCheck, p: HealthPage) => p.state === 'own' || (p.state === 'fallback' && c.fallbackPasses);
const passOf = (c: HealthCheck) => c.pages.filter((p) => passes(c, p)).length;
const toneOf = (ratio: number) => (ratio >= 1 ? 'ok' : ratio >= 0.5 ? 'warn' : 'bad');

export function Health({ checks }: { checks: HealthCheck[] }) {
  const base = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const total = checks.reduce((a, c) => a + c.pages.length, 0);
  const passed = checks.reduce((a, c) => a + passOf(c), 0);
  const score = total ? Math.round((passed / total) * 100) : 100;
  const seg = 360 / Math.max(checks.length, 1);
  const current = checks.find((c) => c.key === open);
  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));

  return (
    <>
      <div className="cms-card-head">
        <div>
          <h2 id="dash-health">Site health</h2>
          <p className="cms-muted">What search engines and link previews see</p>
        </div>
      </div>
      <div className="cms-health2">
        <span className="cms-ring cms-seg-ring" style={{ width: SIZE, height: SIZE }}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} aria-hidden="true">
            {checks.map((c, i) => {
              const len = (C * (seg - GAP)) / 360;
              const ratio = c.pages.length ? passOf(c) / c.pages.length : 1;
              const start = (C * (i * seg + GAP / 2)) / 360;
              const common = { cx: SIZE / 2, cy: SIZE / 2, r: R, fill: 'none', strokeWidth: STROKE, transform: `rotate(-90 ${SIZE / 2} ${SIZE / 2})` };
              return (
                <g key={c.key} className={`cms-seg tone-${toneOf(ratio)}${open === c.key ? ' is-open' : ''}`} onClick={() => toggle(c.key)}>
                  <circle {...common} className="cms-seg-track" strokeDasharray={`${len} ${C}`} strokeDashoffset={-start} />
                  {ratio > 0 && <circle {...common} className="cms-seg-arc" strokeLinecap="round" strokeDasharray={`${Math.max(len * ratio, 0.01)} ${C}`} strokeDashoffset={-start} />}
                </g>
              );
            })}
          </svg>
          <span className="cms-ring-value"><b>{score}</b><small>SEO score</small></span>
        </span>

        <ul className="cms-checks">
          {checks.map((c) => {
            const pass = passOf(c);
            const own = c.pages.filter((p) => p.state === 'own').length;
            const fb = c.pages.filter((p) => p.state === 'fallback').length;
            const ok = pass === c.pages.length;
            return (
              <li key={c.key}>
                <button type="button" className={`cms-check${ok ? ' is-ok' : ' is-todo'}${open === c.key ? ' is-open' : ''}`} aria-expanded={open === c.key} aria-controls={`${base}-detail`} onClick={() => toggle(c.key)}>
                  <span className="cms-check-mark" aria-hidden="true">{ok ? <Icon name="check" size={13} weight="semibold" /> : '!'}</span>
                  <span className="cms-check-text">
                    <b>{c.label}</b>
                    <small>{ok ? 'Done' : `${c.pages.length - pass} to fix`} · {own}/{c.pages.length} own{fb ? ` · ${fb} ${c.fallback}` : ''}</small>
                  </span>
                  <Icon name="right" size={14} className="cms-check-caret" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={`${base}-detail`} aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {current && (
            <motion.div
              key={current.key}
              className="cms-check-detail"
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="cms-check-detail-inner">
                <p className="cms-check-detail-head">{current.label}: pages without their own</p>
                {current.pages.filter((p) => p.state !== 'own').length ? (
                  <ul>
                    {current.pages.filter((p) => p.state !== 'own').sort((a, b) => Number(passes(current, a)) - Number(passes(current, b))).map((p) => (
                      <li key={p.href}>
                        <Link href={p.href}>
                          <span>{p.title}</span>
                          <em className={passes(current, p) ? undefined : 'is-missing'}>{p.state === 'missing' ? 'Missing' : current.fallback}</em>
                          <Icon name="right" size={14} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="cms-muted">Every page has its own.</p>
                )}
                {current.fix && <Link className="cms-link cms-check-fix" href={current.fix.href}>{current.fix.label} →</Link>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
