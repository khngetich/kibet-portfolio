'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { disciplineLabel } from '@/lib/format';
import { Img } from './Img';

/**
 * The work index: a discipline filter and two ways to look at the same projects.
 *   Grid        the project "file" cards, rendered on the server and passed in.
 *   Proof sheet a printer's contact sheet: paper ground, colour bar, crop marks, frame numbers
 *               and project codes, and featured work circled in grease pencil.
 * Filtering only toggles visibility (no refetch). The chosen view is remembered per browser.
 */

export type ProofFrame = { title: string; slug: string; client?: string | null; year?: number | string | null; cover: unknown; featured?: boolean | null };
type Item = { disciplines: string[]; node: ReactNode; proof?: ProofFrame };
type View = 'grid' | 'proof';

const STORE = 'work-view';
const never = () => () => {};
const code = (f: ProofFrame, n: number) => `${(f.client || f.title).replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'PRJ'}-${f.year ?? '—'}-${String(n + 1).padStart(2, '0')}`;
const BAR = ['#00AEEF', '#EC008C', '#FFF200', '#111111', '#3D3D3D', '#7A7A7A', '#B5B5B5', '#E6E6E6', '#ED1C24', '#00A651', '#2E3192'];

export function WorkGrid({ items, studio }: { items: Item[]; studio?: string }) {
  const all = Array.from(new Set(items.flatMap((i) => i.disciplines)));
  const [filter, setFilter] = useState<string | null>(null);
  const shown = items.filter((i) => !filter || i.disciplines.includes(filter));
  const canProof = items.every((i) => i.proof);
  const stored = useSyncExternalStore(never, () => { try { return localStorage.getItem(STORE); } catch { return null; } }, () => null);
  const [picked, setPicked] = useState<View | null>(null);
  const view: View = canProof ? (picked ?? (stored === 'proof' ? 'proof' : 'grid')) : 'grid';

  useEffect(() => { if (picked) { try { localStorage.setItem(STORE, picked); } catch { /* private mode */ } } }, [picked]);

  const choose = (v: View) => {
    const go = () => setPicked(v);
    // cross-fade between the two layouts where the browser can
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    if (doc.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // a hidden tab aborts the animation (the switch still happens): nothing to report
      const t = doc.startViewTransition(go);
      t.ready.catch(() => {});
      t.finished.catch(() => {});
    } else go();
  };

  return (
    <>
      <div className="work-tools">
        {all.length > 1 ? (
          <div className="filters" role="group" aria-label="Filter by discipline">
            <button type="button" aria-pressed={!filter} onClick={() => setFilter(null)}>All <span>{items.length}</span></button>
            {all.map((d) => (
              <button type="button" key={d} aria-pressed={filter === d} onClick={() => setFilter(d)}>
                {disciplineLabel(d)} <span>{items.filter((i) => i.disciplines.includes(d)).length}</span>
              </button>
            ))}
          </div>
        ) : <span />}
        {canProof && (
          <div className="view-switch" role="group" aria-label="View">
            <button type="button" aria-pressed={view === 'grid'} onClick={() => choose('grid')}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>
              Grid
            </button>
            <button type="button" aria-pressed={view === 'proof'} onClick={() => choose('proof')}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3.5" y="4.5" width="17" height="15" rx="1" /><path d="M3.5 8.5h17M3.5 15.5h17M8 4.5v15M16 4.5v15" /></svg>
              Proof sheet
            </button>
          </div>
        )}
      </div>

      {view === 'proof' ? (
        <section className="proof" aria-label="Proof sheet">
          <header className="proof-head" aria-hidden="true">
            <span>Contact sheet{studio ? ` · ${studio}` : ''}</span>
            <span>{shown.length} frames</span>
            <span>{filter ? disciplineLabel(filter) : 'All work'}</span>
          </header>
          <div className="proof-bar" aria-hidden="true">{BAR.map((c) => <i key={c} style={{ background: c }} />)}</div>
          <ol className="proof-grid">
            {shown.map((i, n) => {
              const f = i.proof!;
              // a pick means something only if it's rare: the first three featured frames get the circle
              const pick = !!f.featured && shown.slice(0, n).filter((x) => x.proof?.featured).length < 3;
              return (
                <li key={f.slug} className={`proof-frame${pick ? ' is-pick' : ''}`}>
                  <Link href={`/work/${f.slug}`} className="proof-link">
                    <span className="proof-shot">
                      <Img media={f.cover} sizes="(max-width: 640px) 50vw, 25vw" />
                      <i className="crop tl" /><i className="crop tr" /><i className="crop bl" /><i className="crop br" />
                      {pick && (
                        <svg className="proof-circle" viewBox="0 0 200 130" preserveAspectRatio="none" aria-hidden="true">
                          <path d="M28 70c-4-30 40-52 84-54 46-2 78 18 76 44-2 30-46 52-96 52-44 0-74-14-72-40 2-18 22-32 48-38" />
                        </svg>
                      )}
                    </span>
                    <span className="proof-meta">
                      <b>{String(n + 1).padStart(2, '0')}A</b>
                      <span>{f.title}</span>
                      <code>{code(f, n)}</code>
                    </span>
                    {pick && <span className="sr-only"> (top pick)</span>}
                  </Link>
                </li>
              );
            })}
          </ol>
          <footer className="proof-foot" aria-hidden="true"><span>Circled: top picks</span><span>Select a frame to open its case study</span></footer>
        </section>
      ) : (
        <div className="grid-work">{shown.map((i, n) => <div key={n} className="grid-cell">{i.node}</div>)}</div>
      )}
    </>
  );
}
