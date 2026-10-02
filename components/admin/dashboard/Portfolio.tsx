import Link from 'next/link';
import { Img } from '@/components/Img';
import { Icon } from '@/components/ui/Icon';
import { DocLink } from '../DocModal';
import { StatusBadge } from './Workflow';
import { QuickProject } from './QuickProject';
import type { Status } from './data';

/**
 * The portfolio's own view of itself, beside the generic CMS cards:
 *   Folders      quick capture for a new project, then the work grouped by discipline, each
 *                folder with its newest cover peeking out
 *   CaseStudies  how complete each project's story is, the least complete first
 *   Availability the "open for work" line from Site settings, shown in the dashboard header
 */

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;

type Folder = { value: string; label: string; count: number; live: number; latest: string | null; cover: unknown };

export function Folders({ folders, admin, disciplines }: { folders: Folder[]; admin: string; disciplines: { label: string; value: string }[] }) {
  const used = folders.filter((f) => f.count > 0).sort((a, b) => b.count - a.count);
  const empty = folders.filter((f) => f.count === 0);
  const href = (value: string) => `${admin}/collections/projects?${new URLSearchParams({ 'where[disciplines][in][0]': value })}`;
  return (
    <section className="cms-folders cms-anim" aria-labelledby="dash-folders">
      <div className="cms-section-head">
        <div>
          <h2 id="dash-folders">Your work <span className="cms-count is-strong">{used.length}</span></h2>
          <p className="cms-muted">By discipline{empty.length ? ` · nothing yet in ${empty.map((f) => f.label).join(', ')}` : ''}</p>
        </div>
        <Link className="cms-link" href={`${admin}/collections/projects`}>All projects →</Link>
      </div>
      <QuickProject disciplines={disciplines} />
      {used.length > 0 && <ul className="cms-folder-grid">
        {used.map((f) => (
          <li key={f.value}>
            <Link className="cms-folder" href={href(f.value)} aria-label={`${f.label}: ${plural(f.count, 'project')}`}>
              <span className="cms-folder-art" aria-hidden="true">
                <span className="cms-folder-back" />
                {/* the newest project's cover, tucked into the folder */}
                <span className="cms-folder-sheet">{f.cover ? <Img media={f.cover} sizes="180px" /> : <Icon name="image" size={18} />}</span>
                <span className="cms-folder-front" />
              </span>
              <span className="cms-folder-text">
                <b>{f.label} <span className="cms-tab-n">{f.count}</span></b>
                <small>{f.live === f.count ? 'All live' : `${f.live} live · ${f.count - f.live} draft`}{f.latest ? ` · latest ${f.latest}` : ''}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>}
    </section>
  );
}

type CaseStudy = { id: number; title: string; client: string | null; status: Status; score: number; missing: string[] };

/** A small progress ring, the value as text beside it (the ring itself is decoration). */
function Ring({ value }: { value: number }) {
  const size = 40, stroke = 4, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <span className={`cms-cs-ring${value >= 100 ? ' is-done' : ''}`} aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="cms-cs-track" />
        {value > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className="cms-cs-arc" strokeDasharray={`${(c * value) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />}
      </svg>
      {value >= 100 ? <Icon name="check" size={14} weight="semibold" /> : <i>{value}</i>}
    </span>
  );
}

export function CaseStudies({ items, admin }: { items: CaseStudy[]; admin: string }) {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => a.score - b.score || Number(a.status === 'draft') - Number(b.status === 'draft'));
  const average = Math.round(items.reduce((a, i) => a + i.score, 0) / items.length);
  const complete = items.filter((i) => i.score >= 100).length;
  return (
    <section className="cms-card cms-anim" aria-labelledby="dash-casestudies">
      <div className="cms-card-head">
        <div>
          <h2 id="dash-casestudies">Case studies <span className="cms-count is-strong">{items.length}</span></h2>
          <p className="cms-muted">How much of each project’s story is told: brief, approach, outcome, samples, tools and timeline</p>
        </div>
        <div className="cms-cs-summary">
          <span><b>{average}%</b> complete on average</span>
          <span className="cms-cs-meter" role="img" aria-label={`${average}% complete on average`}><i style={{ width: `${average}%` }} /></span>
          <small>{complete} of {items.length} complete</small>
        </div>
      </div>
      <ul className="cms-cs-list">
        {sorted.map((p) => (
          <li key={p.id}>
            <DocLink className="cms-cs-row" collection="projects" id={p.id} href={`${admin}/collections/projects/${p.id}`}>
              <Ring value={p.score} />
              <span className="cms-cs-main">
                <b>{p.title}</b>
                <small>{p.missing.length ? `Missing ${p.missing.join(', ')}` : `Complete${p.client ? ` · ${p.client}` : ''}`}</small>
              </span>
              <span className="cms-sr">{p.score}% complete.</span>
              <StatusBadge status={p.status} />
            </DocLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The "open for work" line from Site settings, as a pill in the dashboard header. */
export function Availability({ text, admin }: { text: string | null; admin: string }) {
  return (
    <Link className={`cms-avail${text ? '' : ' is-empty'}`} href={`${admin}/globals/site`} title={text ? 'Edit your availability in Site settings' : undefined}>
      <i aria-hidden="true" />
      <span>{text ?? 'Add your availability'}</span>
      <Icon name="pen" size={13} />
    </Link>
  );
}
