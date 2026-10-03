'use client';

export type { ViewItem } from '@/lib/media';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ViewItem } from '@/lib/media';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';

/**
 * The full-screen viewer: images at full size, PDFs in the browser's own viewer (with open and
 * download links for phones, which only show the first page inline), videos with controls, and
 * YouTube/Vimeo embeds. Previous/next buttons, ← → keys and a counter; Esc or the backdrop closes.
 */
export function Viewer({ items, index, onIndex, onClose }: { items: ViewItem[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index != null;
  const item = open ? items[index] : null;
  const n = items.length;
  const go = useCallback((d: number) => { if (index != null && n > 1) onIndex((index + d + n) % n); }, [index, n, onIndex]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  return (
    <dialog
      ref={ref}
      className="viewer"
      aria-label={item?.title ?? 'Sample'}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {item && (
        <div className="viewer-frame">
          <div className="viewer-bar">
            <p className="viewer-title">{item.title}{n > 1 && <span> {index! + 1} / {n}</span>}</p>
            <div className="viewer-actions">
              {item.kind === 'pdf' && (
                <>
                  <a className="viewer-btn" href={item.url} target="_blank" rel="noopener noreferrer">Open PDF <Icon name="external" size={14} /></a>
                  <a className="viewer-btn" href={item.url} download>Download <Icon name="download" size={14} /></a>
                </>
              )}
              <button type="button" className="viewer-close" onClick={onClose} aria-label="Close" autoFocus><Icon name="close" size={18} /></button>
            </div>
          </div>
          <div className="viewer-stage" key={item.url}>
            {item.kind === 'image' && item.media && (
              <Image src={item.url} alt={item.media.alt} width={item.media.width || 1600} height={item.media.height || 1000} sizes="100vw" className="viewer-img" />
            )}
            {item.kind === 'pdf' && <iframe className="viewer-doc" src={`${item.url}#view=FitH`} title={item.title ?? 'PDF'} />}
            {item.kind === 'video' && <video className="viewer-media" src={item.url} controls autoPlay playsInline />}
            {item.kind === 'embed' && <iframe className="viewer-embed" src={`${item.url}?autoplay=1`} title={item.title ?? 'Video'} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />}
          </div>
          {item.note && <p className="viewer-note">{item.note}</p>}
          {n > 1 && (
            <>
              <button type="button" className="viewer-nav is-prev" onClick={() => go(-1)} aria-label="Previous sample"><Icon name="left" size={20} /></button>
              <button type="button" className="viewer-nav is-next" onClick={() => go(1)} aria-label="Next sample"><Icon name="right" size={20} /></button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}

/** The samples grid on a case study; every tile opens the viewer at that sample. */
export function SampleGrid({ items }: { items: ViewItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <ul className="samples-grid">
        {items.map((it, i) => (
          <li key={it.url + i}>
            <button type="button" className={`sample-tile is-${it.kind}`} onClick={() => setIndex(i)} aria-label={`Open ${it.title ?? 'sample'}${it.kind === 'pdf' ? ' (PDF)' : it.kind === 'video' ? ' (video)' : ''}`}>
              <span className="sample-media">
                {it.kind === 'image' && <Img media={it.media} sizes="(max-width: 700px) 50vw, 33vw" />}
                {it.kind === 'video' && <video src={it.url} muted playsInline preload="metadata" aria-hidden="true" />}
                {it.kind === 'pdf' && <span className="sample-doc" aria-hidden="true"><b>PDF</b><span>{it.media?.filename}</span></span>}
                {it.kind !== 'image' && <span className="sample-badge" aria-hidden="true"><Icon name={it.kind === 'pdf' ? 'external' : 'right'} size={16} /></span>}
              </span>
              {(it.title || it.note) && <span className="sample-caption"><b>{it.title}</b>{it.note && <small>{it.note}</small>}</span>}
            </button>
          </li>
        ))}
      </ul>
      <Viewer items={items} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}

/** A button that opens the viewer at the first of `items`: the "+" on a lead image, "Explore all (N)". */
export function ViewerButton({ items, className, label, children }: { items: ViewItem[]; className?: string; label?: string; children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  if (!items.length) return null;
  return (
    <>
      <button type="button" className={className} aria-label={label} onClick={() => setIndex(0)}>{children}</button>
      <Viewer items={items} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}

/** "Watch the video": opens a YouTube/Vimeo link in the same viewer instead of leaving the page. */
export function WatchButton({ embed, title, children }: { embed: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-light" onClick={() => setOpen(true)}>{children}</button>
      <Viewer items={[{ kind: 'embed', url: embed, title }]} index={open ? 0 : null} onIndex={() => {}} onClose={() => setOpen(false)} />
    </>
  );
}
