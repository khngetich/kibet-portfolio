'use client';

import { useStill } from './useStill';
import { m as motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';

/**
 * “This work is for you if you’re a …” — a pinned section where the list of roles rolls
 * upward with the scroll, the one in the middle lighting up red.
 */
export function RoleWheel({ heading, lead, roles, id, headingId }: { heading: string; lead: string; roles: string[]; id?: string; headingId: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useStill();
  const [active, setActive] = useState(0);
  const last = roles.length - 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // Each row is 1.25em tall; move the list so the active row sits on the centre line.
  const y = useTransform(scrollYProgress, [0.08, 0.92], ['0em', `${-last * 1.25}em`]);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.round(Math.min(Math.max((v - 0.08) / 0.84, 0), 1) * last);
    setActive((prev) => (prev === i ? prev : i));
  });

  return (
    <section ref={ref} className="roles" id={id} aria-labelledby={headingId} style={{ height: reduce ? 'auto' : `${100 + roles.length * 28}vh` }}>
      <div className="roles-pin">
        <div className="roles-head">
          <h2 className="roles-title" id={headingId}>{heading}</h2>
          <p className="roles-if">{lead}</p>
        </div>
        <div className="roles-list-wrap">
          {reduce ? (
            <ul className="roles-list roles-static">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
          ) : (
            <div className="roles-window">
              {/* the full list for screen readers; the turning wheel below is visual only */}
              <ul className="sr-only">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
              <motion.ul className="roles-list" style={{ y }} aria-hidden="true">
                {roles.map((r, i) => (
                  <li key={r} className={i === active ? 'is-active' : undefined} style={{ opacity: Math.max(0.12, 1 - Math.abs(i - active) * 0.32) }}>
                    {r}
                  </li>
                ))}
              </motion.ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
