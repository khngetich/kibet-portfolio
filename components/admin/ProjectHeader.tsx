'use client';

import { useFormFields } from '@payloadcms/ui';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { thumbURL } from '@/lib/media';

/**
 * The top of the project editor: the cover as a banner, the facts at a glance (client, year,
 * timeline, disciplines) and how complete the case study is. It reads the form as you type, so
 * the score and the "missing" list move while you fill the fields in. A `ui` field: nothing is
 * stored, and the Studio's schema skips it.
 */

const PARTS = [
  { key: 'brief', label: 'Brief' },
  { key: 'approach', label: 'Approach' },
  { key: 'outcome', label: 'Outcome' },
  { key: 'samples', label: 'Samples' },
  { key: 'tools', label: 'Tools' },
  { key: 'timeline', label: 'Timeline' },
] as const;
const DISCIPLINE: Record<string, string> = { social: 'Social media', brand: 'Brand identity', web: 'Web design', print: 'Print', packaging: 'Packaging', illustration: 'Illustration', motion: 'Motion' };

const filled = (v: unknown) => (Array.isArray(v) ? v.length > 0 : typeof v === 'number' ? v > 0 : typeof v === 'string' ? v.trim().length > 0 : v != null && v !== false);

export function ProjectHeader() {
  const f = useFormFields(([fields]) => ({
    title: fields.title?.value as string | undefined,
    client: fields.client?.value as string | undefined,
    year: fields.year?.value as string | undefined,
    timeline: fields.timeline?.value as string | undefined,
    cover: fields.cover?.value as number | { id: number } | null | undefined,
    disciplines: fields.disciplines?.value as string[] | undefined,
    brief: fields.brief?.value, approach: fields.approach?.value, outcome: fields.outcome?.value,
    // an array field's value is its row count
    samples: fields.samples?.value, tools: fields.tools?.value, deliverables: fields.deliverables?.value,
  }));
  const coverId = typeof f.cover === 'object' && f.cover ? f.cover.id : f.cover ?? null;
  const [cover, setCover] = useState<{ id: number; url: string } | null>(null);

  useEffect(() => {
    if (coverId == null) return;
    let live = true;
    fetch(`/api/media/${coverId}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => { const url = thumbURL(m, 384); if (live && url) setCover({ id: coverId, url }); })
      .catch(() => {});
    return () => { live = false; };
  }, [coverId]);

  const has: Record<(typeof PARTS)[number]['key'], boolean> = {
    brief: filled(f.brief), approach: filled(f.approach), outcome: filled(f.outcome), samples: filled(f.samples),
    tools: filled(f.tools) || filled(f.deliverables), timeline: filled(f.timeline),
  };
  const done = PARTS.filter((p) => has[p.key]).length;
  const score = Math.round((done / PARTS.length) * 100);
  const src = coverId != null && cover?.id === coverId ? cover.url : null;

  return (
    <div className="cms-ph">
      <div className="cms-ph-banner" aria-hidden="true">
        {src ? <><img className="cms-ph-blur" src={src} alt="" /><img className="cms-ph-cover" src={src} alt="" /></> : <span className="cms-ph-empty"><Icon name="image" size={20} /> Add a cover below</span>}
      </div>
      <div className="cms-ph-body">
        <div className="cms-ph-title">
          <p className="cms-ph-eyebrow">Case study</p>
          <h2>{f.title || 'Untitled project'}</h2>
          {!!f.disciplines?.length && <p className="cms-ph-tags">{f.disciplines.map((d) => <span key={d}>{DISCIPLINE[d] ?? d}</span>)}</p>}
        </div>
        <dl className="cms-ph-facts">
          <div><dt>Client</dt><dd>{f.client || '—'}</dd></div>
          <div><dt>Year</dt><dd>{f.year || '—'}</dd></div>
          <div><dt>Timeline</dt><dd>{f.timeline || '—'}</dd></div>
          <div className="cms-ph-score">
            <dt>Story</dt>
            <dd><b>{score}%</b> <span className="cms-ph-meter" aria-hidden="true"><i style={{ width: `${score}%` }} className={score >= 100 ? 'is-done' : undefined} /></span></dd>
          </div>
        </dl>
        <ul className="cms-ph-parts" aria-label="Case study parts">
          {PARTS.map((p) => (
            <li key={p.key} className={has[p.key] ? 'is-done' : undefined}>
              {has[p.key] ? <Icon name="check" size={12} weight="semibold" /> : <i aria-hidden="true" />}
              {p.label}<span className="cms-sr">{has[p.key] ? ' (done)' : ' (missing)'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
