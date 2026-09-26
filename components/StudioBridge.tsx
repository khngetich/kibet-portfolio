'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Runs inside the Studio's canvas iframe (draft mode entered with ?studio=1). Draws hover
 * and selection outlines around sections, turns clicks into "select this section"
 * messages instead of navigation, and re-renders when the Studio saves a draft.
 * Messages are only accepted from, and only sent to, this same origin.
 */

type Box = { top: number; left: number; width: number; height: number; label: string; hidden: boolean } | null;

/** "aboutBanner" → "About banner" */
const human = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const sectionAt = (el: EventTarget | null) => (el instanceof Element ? (el.closest('[data-section]') as HTMLElement | null) : null);
const same = (a: Box, b: Box) => a === b || (!!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height && a.label === b.label && a.hidden === b.hidden);
const boxOf = (el: HTMLElement | null): Box => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height, label: human(el.dataset.sectionType ?? 'section'), hidden: el.classList.contains('is-studio-hidden') };
};

export function StudioBridge() {
  const router = useRouter();
  const [hover, setHover] = useState<Box>(null);
  const [selected, setSelected] = useState<Box>(null);
  const selectedIndex = useRef<number | null>(null);
  const hoverEl = useRef<HTMLElement | null>(null);
  const themeKeys = useRef(new Set<string>());

  useEffect(() => {
    if (window.parent === window) return;
    const post = (msg: object) => window.parent.postMessage({ source: 'studio-canvas', ...msg }, location.origin);
    const findSection = (i: number | null) => (i == null ? null : (document.querySelector(`[data-section="${i}"]`) as HTMLElement | null));
    // Measure at most once per frame, and only re-render when a box actually moved.
    let frame = 0;
    const measure = () => {
      frame = 0;
      const sel = boxOf(findSection(selectedIndex.current));
      const hov = boxOf(hoverEl.current);
      setSelected((b) => (same(b, sel) ? b : sel));
      setHover((b) => (same(b, hov) ? b : hov));
    };
    const sync = () => { if (!frame) frame = requestAnimationFrame(measure); };
    // Styles preview: the unsaved theme replaces the saved one (a cleared value falls back to the default).
    const applyTheme = (vars: Record<string, string>) => {
      const saved = document.getElementById('theme-vars') as HTMLStyleElement | null;
      if (saved?.sheet) saved.sheet.disabled = true;
      const root = document.documentElement.style;
      for (const k of themeKeys.current) if (!(k in vars)) root.removeProperty(k);
      themeKeys.current = new Set(Object.keys(vars).filter((k) => k.startsWith('--')));
      for (const k of themeKeys.current) root.setProperty(k, String(vars[k]));
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.source !== 'studio') return;
      if (e.data.type === 'refresh') router.refresh();
      if (e.data.type === 'theme' && e.data.vars && typeof e.data.vars === 'object') applyTheme(e.data.vars as Record<string, string>);
      if (e.data.type === 'select') {
        selectedIndex.current = typeof e.data.index === 'number' ? e.data.index : null;
        const el = findSection(selectedIndex.current);
        if (el && e.data.scroll) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        sync();
      }
    };
    const onOver = (e: MouseEvent) => { const el = sectionAt(e.target); if (el === hoverEl.current) return; hoverEl.current = el; sync(); };
    const onLeave = () => { hoverEl.current = null; setHover(null); };
    const onClick = (e: MouseEvent) => {
      const el = sectionAt(e.target);
      // Links and buttons inside the canvas select their section instead of navigating.
      e.preventDefault();
      e.stopPropagation();
      if (!el) return;
      selectedIndex.current = Number(el.dataset.section);
      sync();
      post({ type: 'select', index: selectedIndex.current });
    };
    const onSubmit = (e: Event) => e.preventDefault();

    window.addEventListener('message', onMessage);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmit, true);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    // Sections change size as images load and entrances play; scroll-linked motion is covered by the scroll listener.
    const resize = new ResizeObserver(sync);
    resize.observe(document.body);
    document.querySelectorAll('[data-section]').forEach((el) => resize.observe(el));
    document.documentElement.classList.add('in-studio');
    post({ type: 'ready', sections: document.querySelectorAll('[data-section]').length });
    return () => {
      window.removeEventListener('message', onMessage);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmit, true);
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [router]);

  const outline = (b: Box, kind: 'hover' | 'selected') =>
    b && (
      <div className={`studio-outline is-${kind}`} style={{ top: b.top, left: b.left, width: b.width, height: b.height }} aria-hidden="true">
        <span>{b.label}{b.hidden ? ' · hidden' : ''}</span>
      </div>
    );

  return (
    <>
      {hover && (!selected || hover.top !== selected.top) && outline(hover, 'hover')}
      {outline(selected, 'selected')}
    </>
  );
}
