'use client';

import { useEffect, useRef } from 'react';

/**
 * Marks the page while the footer's last row is on screen (html.near-footer), so the floating
 * WhatsApp button and availability badge step aside instead of covering the policy links.
 */
export function FooterWatch() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const row = ref.current?.parentElement;
    if (!row) return;
    const io = new IntersectionObserver(([e]) => document.documentElement.classList.toggle('near-footer', e.isIntersecting), { rootMargin: '0px 0px 40px 0px' });
    io.observe(row);
    return () => { io.disconnect(); document.documentElement.classList.remove('near-footer'); };
  }, []);
  return <span ref={ref} hidden />;
}
