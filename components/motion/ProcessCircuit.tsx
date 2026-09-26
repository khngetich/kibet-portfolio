'use client';

import { AnimatePresence, motion, useInView, useReducedMotionConfig } from 'motion/react';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/Icon';

export type CircuitStep = { title: string; icon?: string | null; description?: string | null; points?: string[] | null; duration?: string | null };

const DEFAULT_ICONS: IconName[] = ['bulb', 'chart', 'sliders', 'checkCircle'];
const BRANCH_H = 120;
const R = 14;
const WIDE = '(min-width: 761px)';
const subscribe = (cb: () => void) => { const mq = window.matchMedia(WIDE); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); };

/** One circuit trace from the badge (top centre) down, along the bus and into card `i`. */
function branch(w: number, n: number, i: number) {
  const mid = w / 2;
  const x = (w * (i + 0.5)) / n;
  const bus = 50;
  if (Math.abs(x - mid) < 1) return `M${mid} 0V${BRANCH_H}`;
  const dir = x < mid ? -1 : 1;
  return `M${mid} 0V${bus - R}Q${mid} ${bus} ${mid + dir * R} ${bus}H${x - dir * R}Q${x} ${bus} ${x} ${bus + R}V${BRANCH_H}`;
}

/**
 * The process as a circuit: a glowing badge feeds a trace network that branches into one card
 * per phase. On scroll entry the traces draw, then the cards pop in left to right. Hovering a
 * card sends a beam of light down its trace and brightens its glow; clicking opens a summary
 * underneath with that phase's deliverables and timing. Below 761px the flow runs vertically.
 */
export function ProcessCircuit({ badge, badgeId, steps, footer }: { badge: ReactNode; badgeId: string; steps: CircuitStep[]; footer?: ReactNode }) {
  const base = useId();
  const reduce = useReducedMotionConfig();
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);
  const root = useRef<HTMLDivElement>(null);
  const shown = useInView(root, { once: true, margin: '0px 0px -15% 0px' }) || !!reduce;
  const svgBox = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const n = steps.length;

  useEffect(() => {
    const el = svgBox.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  const lit = hover ?? open;
  const step = open != null ? steps[open] : null;
  const pop = (i: number) => ({
    initial: reduce ? false : { opacity: 0, scale: 0.86, y: 12 },
    animate: shown ? { opacity: 1, scale: 1, y: 0 } : undefined,
    transition: { type: 'spring' as const, stiffness: 260, damping: 16, delay: reduce ? 0 : (wide ? 0.95 : 0.35) + i * 0.12 },
  });

  return (
    <div ref={root} className={`circuit${wide ? ' is-wide' : ' is-tall'}${shown ? ' is-shown' : ''}`}>
      <div className="circuit-badge-wrap">
        <motion.h2 id={badgeId} className="circuit-badge" initial={reduce ? false : { opacity: 0, y: 8 }} animate={shown ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, ease: 'easeOut' }}>
          {badge}
        </motion.h2>
      </div>

      {wide && (
        <div ref={svgBox} className="circuit-traces" aria-hidden="true">
          {w > 0 && (
            <svg width={w} height={BRANCH_H} viewBox={`0 0 ${w} ${BRANCH_H}`}>
              {steps.map((_, i) => (
                <g key={i} className={lit === i ? 'is-lit' : undefined}>
                  <motion.path className="trace" d={branch(w, n, i)} initial={reduce ? false : { pathLength: 0 }} animate={shown ? { pathLength: 1 } : undefined} transition={{ duration: 1.1, ease: [0.2, 0, 0, 1], delay: 0.15 }} />
                  <path className="trace-beam" d={branch(w, n, i)} pathLength={1} />
                </g>
              ))}
              <motion.circle className="trace-node" cx={w / 2} cy={50} r={4} initial={reduce ? false : { scale: 0 }} animate={shown ? { scale: 1 } : undefined} transition={{ delay: 0.55 }} />
              {steps.map((_, i) => <motion.circle key={i} className="trace-node" cx={(w * (i + 0.5)) / n} cy={BRANCH_H - 2} r={3} initial={reduce ? false : { scale: 0 }} animate={shown ? { scale: 1 } : undefined} transition={{ delay: 1 + i * 0.12 }} />)}
            </svg>
          )}
        </div>
      )}

      <ol className="circuit-steps" style={{ '--n': n } as React.CSSProperties}>
        {steps.map((s, i) => {
          const on = open === i;
          return (
            <li key={s.title} className={`circuit-step${lit === i ? ' is-lit' : ''}${on ? ' is-open' : ''}`}>
              <motion.button
                type="button"
                className="circuit-card-btn"
                aria-expanded={on}
                aria-controls={`${base}-detail`}
                onClick={() => setOpen(on ? null : i)}
                onHoverStart={() => setHover(i)}
                onHoverEnd={() => setHover((h) => (h === i ? null : h))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                {...pop(i)}
              >
                <span className="circuit-card">
                  <span className="circuit-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="circuit-icon"><Icon name={(s.icon as IconName) || DEFAULT_ICONS[i % 4]} size={30} /></span>
                </span>
                <span className="circuit-label">{s.title}</span>
              </motion.button>
            </li>
          );
        })}
      </ol>

      <div id={`${base}-detail`} className="circuit-detail-slot" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {step ? (
            <motion.div
              key={open}
              className="circuit-detail"
              style={{ '--at': `${((open! + 0.5) / n) * 100}%` } as React.CSSProperties}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, height: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
              transition={{ type: 'spring', stiffness: 220, damping: 26, opacity: { duration: 0.2 } }}
            >
              <div className="circuit-detail-inner">
                <div className="circuit-detail-head">
                  <p className="circuit-detail-kicker">Phase {String(open! + 1).padStart(2, '0')}</p>
                  <h3>{step.title}</h3>
                  {step.description && <p className="circuit-detail-desc">{step.description}</p>}
                </div>
                {!!step.points?.length && (
                  <div>
                    <p className="circuit-detail-kicker">Deliverables</p>
                    <ul className="circuit-detail-list">{step.points.map((p) => <li key={p}><Icon name="check" size={14} />{p}</li>)}</ul>
                  </div>
                )}
                {step.duration && (
                  <div>
                    <p className="circuit-detail-kicker">Typical timeline</p>
                    <p className="circuit-detail-time">{step.duration}</p>
                  </div>
                )}
                <button type="button" className="circuit-detail-close" onClick={() => setOpen(null)} aria-label={`Close ${step.title}`}><Icon name="close" size={16} /></button>
              </div>
            </motion.div>
          ) : (
            <motion.p key="hint" className="circuit-hint" initial={{ opacity: 0 }} animate={{ opacity: shown ? 1 : 0, transition: { delay: reduce ? 0 : 1.6 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              Select a step to see its deliverables and timeline.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      {footer}
    </div>
  );
}
