'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * The résumé's “At a glance” menu: follows down the side and marks the part being read.
 * The current part is the last one whose top has passed a line a third of the way down the screen.
 */
export function ResumeNav({ items, children }: { items: { id: string; label: string }[]; children?: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const update = () => {
      const line = window.innerHeight / 3;
      let at: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= line) at = el.id;
      setCurrent(at);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [items]);

  return (
    <nav className="cv-nav" aria-label="Résumé sections">
      <p className="ed-kicker">At a glance</p>
      <ul className="cv-nav-list">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={current === i.id ? 'location' : undefined}>
              {i.label}
              <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" d="M8 16L16 8M9 8h7v7" /></svg>
            </a>
          </li>
        ))}
      </ul>
      {children}
    </nav>
  );
}
