'use client';

import { AnimatePresence, motion, useReducedMotionConfig } from 'motion/react';
import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { Icon } from '@/components/Icon';
import { ServiceLink } from './ServiceLink';

export type DeckService = { title: string; description?: string | null; deliverables?: string[] | null };

const SPRING = { type: 'spring', stiffness: 170, damping: 22, mass: 0.9 } as const;
const WIDE = '(min-width: 900px)';
const subscribe = (cb: () => void) => { const mq = window.matchMedia(WIDE); mq.addEventListener('change', cb); return () => mq.removeEventListener('change', cb); };

/**
 * Services as an isometric deck of glass cards. At rest they stand in a staggered, tilted
 * stack; hovering one lifts it 15px out of the deck; clicking brings it to the front at 0°
 * tilt and opens its deliverables and an "Inquire" button while the rest sink back, dimmed.
 * Escape, the close button or a click beside the cards puts it back. Below 900px the deck
 * becomes a plain list of the same cards, each opening in place.
 */
export function ServiceDeck({ services, ctaLabel }: { services: DeckService[]; ctaLabel: string }) {
  const base = useId();
  const reduce = useReducedMotionConfig();
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const n = services.length;

  useEffect(() => {
    if (active == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const place = (i: number) => {
    const mid = (n - 1) / 2;
    const rest = { x: (i - mid) * 118, y: (i - mid) * -62, z: -i * 70, rotateY: -32, rotateX: 10, rotateZ: -3, scale: 1, opacity: 1 };
    if (active === i) return { x: 0, y: 12, z: 150, rotateY: 0, rotateX: 0, rotateZ: 0, scale: 1, opacity: 1 };
    if (active != null) return { ...rest, x: rest.x + 70, y: rest.y - 30, z: rest.z - 180, opacity: 0.3 };
    if (hover === i) return { ...rest, y: rest.y - 6, z: rest.z + 15 };
    return rest;
  };

  return (
    <div className={`deck${wide ? ' is-3d' : ' is-list'}${active != null ? ' has-active' : ''}`} onClick={(e) => { if (wide && e.target === e.currentTarget) setActive(null); }}>
      <ul className="deck-stage" onClick={(e) => { if (wide && e.target === e.currentTarget) setActive(null); }}>
        {services.map((s, i) => {
          const on = active === i;
          const id = `${base}-${i}`;
          const card = (
            <motion.article
              className={`deck-card${on ? ' is-active' : ''}${hover === i && active == null ? ' is-hover' : ''}`}
              aria-labelledby={`${id}-title`}
              animate={wide ? { width: on ? 380 : 288, height: on ? 452 : 304 } : undefined}
              transition={SPRING}
            >
              {!on && (
                <button type="button" className="deck-hit" aria-expanded={false} aria-controls={`${id}-more`} onClick={() => setActive(i)}
                  onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                  <span className="sr-only">Open {s.title}</span>
                </button>
              )}
              <h3 className="deck-title" id={`${id}-title`}>{s.title}</h3>
              {s.description && <p className="deck-sub">{s.description}</p>}
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    key="more"
                    id={`${id}-more`}
                    className="deck-more"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, ...(wide ? {} : { height: 0 }) }}
                    animate={{ opacity: 1, y: 0, ...(wide ? {} : { height: 'auto' }) }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6, ...(wide ? {} : { height: 0 }), transition: { duration: 0.15, ease: 'easeOut' } }}
                    transition={{ ...SPRING, opacity: { duration: 0.25, delay: wide ? 0.12 : 0 } }}
                  >
                    {!!s.deliverables?.length && <ul className="deck-list">{s.deliverables.map((d) => <li key={d}><Icon name="check" size={14} />{d}</li>)}</ul>}
                    <ServiceLink className="btn btn-light deck-cta" service={s.title}>{ctaLabel} <Icon name="arrow" size={15} /></ServiceLink>
                  </motion.div>
                )}
              </AnimatePresence>
              {on && <button type="button" className="deck-close" onClick={() => setActive(null)} aria-label={`Close ${s.title}`} aria-expanded={true} aria-controls={`${id}-more`}><Icon name="close" size={16} /></button>}
              <span className="deck-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            </motion.article>
          );
          return (
            <motion.li
              key={s.title}
              className="deck-slot"
              style={{ zIndex: on ? 20 : n - i }}
              initial={false}
              animate={wide ? place(i) : { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, opacity: 1 }}
              transition={SPRING}
              onHoverStart={() => setHover(i)}
              onHoverEnd={() => setHover((h) => (h === i ? null : h))}
            >
              {card}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
