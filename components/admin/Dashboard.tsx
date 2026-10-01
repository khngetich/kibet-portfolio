import Link from 'next/link';
import type { Payload, TypedUser } from 'payload';
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres';
import { pagePath } from '@/collections/Pages';
import { SectionIcon } from './SectionIcon';
import { EnquiryChart, Greeting, Scroller } from './DashboardCharts';
import { OpenInModal, QuickCreate } from './Crud';
import { DashIntro } from './DashIntro';

/**
 * The CMS home screen: the site's pages as cards, enquiries over time, how many sections
 * are live on each page, content stats and an SEO health score. Everything is computed
 * from the CMS on each visit.
 *
 * Drafts: saving a draft only writes a new version, so a document's own `_status` says
 * whether it has ever gone live, and its latest version (`draft: true`) says whether there
 * are changes waiting to be published. Both are shown, for pages and projects alike. Colours follow the reference dashboard: a light surface,
 * blue for active states and purple / coral / amber / blue for data (every coloured mark
 * also carries a text label). New pages, projects and uploads open in pop-up forms.
 */

type Props = { payload: Payload; user?: TypedUser | null };
type Sec = { blockType: string; hidden?: boolean | null };
type PageDoc = { id: number; title: string; slug?: string | null; updatedAt: string; _status?: string | null; sections?: Sec[] | null; meta?: { title?: string | null; description?: string | null; image?: unknown } | null };

const when = (iso?: string | null) => {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  if (mins < 60 * 24 * 7) return `${Math.round(mins / 1440)} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

const TONES = ['purple', 'coral', 'amber', 'blue'] as const;
type Tone = (typeof TONES)[number] | 'health';

/** A progress ring: coloured arc over a grey track, the value in the middle. */
function Ring({ value, size = 76, stroke = 7, tone = 'purple', children }: { value: number; size?: number; stroke?: number; tone?: Tone; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={`cms-ring tone-${tone}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {tone === 'health' && (
          <defs>
            <linearGradient id="ring-health" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E5484D" /><stop offset="1" stopColor="#D98B0B" /></linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} className="cms-ring-track" strokeWidth={stroke} fill="none" />
        {value > 0 && <circle cx={size / 2} cy={size / 2} r={r} className="cms-ring-arc" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />}
      </svg>
      <span className="cms-ring-value">{children}</span>
    </span>
  );
}

export async function Dashboard({ payload, user }: Props) {
  const admin = payload.config.routes.admin;
  // a server component rendered per request, so reading the clock here is intended
  // eslint-disable-next-line react-hooks/purity
  const yearAgo = new Date(Date.now() - 366 * 86400000).toISOString();
  const [pagesRes, livePagesRes, projects, latestProjects, featured, media, lightMedia, enquiryHours, replied, archived, recent, site, enquiryCount] = await Promise.all([
    payload.find({ collection: 'pages', limit: 100, sort: '-updatedAt', depth: 0, draft: true, select: { title: true, slug: true, sections: true, updatedAt: true, _status: true, meta: true } }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, pagination: false, where: { _status: { equals: 'published' } }, select: { _status: true } }),
    payload.count({ collection: 'projects' }),
    payload.find({ collection: 'projects', limit: 500, depth: 0, pagination: false, draft: true, select: { _status: true } }),
    payload.count({ collection: 'projects', where: { featured: { equals: true } } }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'media', where: { filesize: { less_than: 1024 * 1024 } } }),
    // Hourly counts, not one row per enquiry: no cap on volume, and the browser still groups
    // them into days in the editor's own time zone.
    (payload.db as unknown as PostgresAdapter).drizzle.execute(sql`
      SELECT extract(epoch FROM date_trunc('hour', created_at)) * 1000 AS t, count(*)::int AS n
      FROM inquiries WHERE created_at > ${yearAgo} GROUP BY 1`),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'replied' } } }),
    payload.count({ collection: 'inquiries', where: { status: { equals: 'archived' } } }),
    payload.find({ collection: 'inquiries', limit: 4, sort: '-createdAt', depth: 0 }),
    payload.findGlobal({ slug: 'site', depth: 0 }),
    payload.count({ collection: 'inquiries' }),
  ]);
  const pages = pagesRes.docs as unknown as PageDoc[];
  const isLive = new Set(livePagesRes.docs.map((p) => p.id));
  const hasChanges = (p: PageDoc) => p._status === 'draft';
  const livePages = pages.filter((p) => isLive.has(p.id)).length;
  const changedPages = pages.filter(hasChanges).length;
  const changedProjects = latestProjects.docs.filter((p) => p._status === 'draft').length;
  const totalEnquiries = enquiryCount.totalDocs;
  // archived messages are set aside, not answered: they leave the "replied" ratio entirely
  const openEnquiries = totalEnquiries - archived.totalDocs;
  const hours = (enquiryHours.rows as { t: string | number; n: string | number }[]).map((r) => ({ t: Number(r.t), n: Number(r.n) }));
  // a page without its own share image falls back to the site default, so either counts
  const hasImage = (p: PageDoc) => !!p.meta?.image || !!site.ogImage;
  const seoChecks = pages.flatMap((p) => [!!p.meta?.title, !!p.meta?.description, hasImage(p)]);
  const seoScore = pct(seoChecks.filter(Boolean).length, seoChecks.length);
  const hiddenSections = pages.reduce((a, p) => a + (p.sections ?? []).filter((s) => s.hidden).length, 0);
  const firstName = (user as { name?: string } | null)?.name?.split(' ')[0];
  const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || '/';
  const barMax = Math.max(1, ...pages.map((p) => (p.sections ?? []).length));

  const tiles = [
    { label: 'Pages', value: pages.length, ring: pct(livePages, pages.length), note: 'live', href: `${admin}/collections/pages` },
    { label: 'Projects', value: projects.totalDocs, ring: pct(featured.totalDocs, projects.totalDocs), note: 'featured', href: `${admin}/collections/projects` },
    { label: 'Media', value: media.totalDocs, ring: pct(lightMedia.totalDocs, media.totalDocs), note: 'under 1 MB', href: `${admin}/collections/media` },
    { label: 'Enquiries', value: totalEnquiries, ring: pct(replied.totalDocs, openEnquiries), note: 'replied', href: `${admin}/collections/inquiries` },
  ];

  const health = [
    { label: 'Search titles', ok: pages.every((p) => p.meta?.title), detail: `${pages.filter((p) => p.meta?.title).length}/${pages.length} pages` },
    { label: 'Descriptions', ok: pages.every((p) => p.meta?.description), detail: `${pages.filter((p) => p.meta?.description).length}/${pages.length} pages` },
    { label: 'Share images', ok: pages.every(hasImage), detail: site.ogImage ? `${pages.filter((p) => p.meta?.image).length}/${pages.length} own · site default for the rest` : `${pages.filter((p) => p.meta?.image).length}/${pages.length} pages · no site default` },
    { label: 'Unpublished changes', ok: changedPages + changedProjects === 0, detail: `${changedPages} pages · ${changedProjects} projects` },
  ];

  return (
    <div className="cms-dash is-intro">
      <DashIntro />
      <header className="cms-dash-head">
        <div>
          <p className="cms-eyebrow">{site.name} · Content studio</p>
          <h1><Greeting name={firstName} /></h1>
        </div>
        <div className="cms-dash-actions">
          <a className="cms-btn" href={siteURL} target="_blank" rel="noopener noreferrer">View site ↗</a>
          <QuickCreate collection="pages" label="+ New page" then="open" className="cms-btn" />
          {/* the Studio is a separate app shell (its own root layout): a full page load, not a <Link> */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="cms-btn cms-btn-primary" href="/studio">Open Studio</a>
        </div>
      </header>

      {/* ── Pages ── */}
      <section className="cms-card cms-card-flush" aria-labelledby="dash-pages">
        <div className="cms-card-head">
          <h2 id="dash-pages">Pages</h2>
          <Link className="cms-link" href={`${admin}/collections/pages`}>All pages →</Link>
        </div>
        <Scroller label="Pages">
          {pages.map((p, n) => {
            const sections = p.sections ?? [];
            const hidden = sections.filter((s) => s.hidden).length;
            return (
              <Link key={p.id} className="cms-page" href={`${admin}/collections/pages/${p.id}`}>
                <span className="cms-page-top">
                  <span className={`cms-tile tint-${n % 4}`} aria-hidden="true"><SectionIcon type={sections[0]?.blockType ?? 'richText'} size={18} /></span>
                  <b>{p.title}</b>
                </span>
                <span className="cms-page-strip" role="img" aria-label={`${sections.length} sections`}>
                  {sections.slice(0, 8).map((s, i) => <span key={i} className={s.hidden ? 'is-hidden' : undefined}><SectionIcon type={s.blockType} size={14} /></span>)}
                  {sections.length > 8 && <span className="cms-more">+{sections.length - 8}</span>}
                </span>
                <span className="cms-chips">
                  <span>{when(p.updatedAt)}</span>
                  <span>{pagePath(p.slug)}</span>
                  <span>{sections.length} sections{hidden ? ` · ${hidden} hidden` : ''}</span>
                  {!isLive.has(p.id) ? <span className="is-warn">Not live</span> : hasChanges(p) && <span className="is-warn">Unpublished changes</span>}
                </span>
              </Link>
            );
          })}
          <QuickCreate collection="pages" label="New page" then="open" className="cms-page cms-page-new">
            <span className="cms-tile tint-0" aria-hidden="true">+</span>
            <b>New page</b>
            <span className="cms-muted">Name it here; add sections on the next screen</span>
          </QuickCreate>
        </Scroller>
      </section>

      {/* ── Charts ── */}
      <div className="cms-row">
        <section className="cms-card cms-span-2"><EnquiryChart hours={hours} /></section>

        <section className="cms-card" aria-labelledby="dash-sections">
          <div className="cms-card-head">
            <div>
              <h2 id="dash-sections">Sections</h2>
              <p className="cms-muted">Visible and hidden, per page</p>
            </div>
          </div>
          <div className="cms-bars">
            {pages.map((p) => {
              const total = (p.sections ?? []).length;
              const hidden = (p.sections ?? []).filter((s) => s.hidden).length;
              const visible = total - hidden;
              return (
                <div key={p.id} className="cms-bar" tabIndex={0}>
                  <span className="cms-bar-col" style={{ height: `${(total / barMax) * 100}%` }}>
                    {hidden > 0 && <span className="cms-bar-hidden" style={{ flexGrow: hidden }} />}
                    <span className="cms-bar-visible" style={{ flexGrow: Math.max(visible, 0.0001) }} />
                  </span>
                  <span className="cms-bar-tip"><b>{p.title}</b>{visible} visible{hidden ? ` · ${hidden} hidden` : ''}</span>
                  <small>{p.title}</small>
                  <em>{pct(visible, total)}%</em>
                </div>
              );
            })}
          </div>
          <ul className="cms-legend">
            <li><span className="is-visible" />Visible · {pages.reduce((a, p) => a + (p.sections ?? []).length, 0) - hiddenSections}</li>
            <li><span className="is-hidden" />Hidden · {hiddenSections}</li>
          </ul>
        </section>
      </div>

      <div className="cms-row">
        <section className="cms-card cms-span-2 cms-tiles" aria-label="Content">
          {tiles.map((t, n) => (
            <div key={t.label} className={`cms-kpi tone-${TONES[n % 4]}`}>
              <div className="cms-kpi-head"><span>{t.label}</span><em>{t.ring}% {t.note}</em></div>
              <Ring value={t.ring} tone={TONES[n % 4]}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg></Ring>
              <b>{t.value.toLocaleString('en-GB')}</b>
              <Link href={t.href}>View all</Link>
            </div>
          ))}
        </section>

        <section className="cms-card" aria-labelledby="dash-health">
          <div className="cms-card-head">
            <div>
              <h2 id="dash-health">Site health</h2>
              <p className="cms-muted">Search and sharing details, per page</p>
            </div>
          </div>
          <div className="cms-health">
            <ul>
              {health.map((h) => (
                <li key={h.label} className={h.ok ? 'is-ok' : 'is-todo'}>
                  <span aria-hidden="true">{h.ok ? '✓' : '!'}</span>
                  <div><b>{h.label}</b><small>{h.ok ? 'Done' : 'To do'} · {h.detail}</small></div>
                </li>
              ))}
            </ul>
            <Ring value={seoScore} size={132} stroke={11} tone="health"><b>{seoScore}</b><small>SEO score</small></Ring>
          </div>
        </section>
      </div>

      <div className="cms-row">
        <section className="cms-card cms-span-2" aria-labelledby="dash-enquiries">
          <div className="cms-card-head">
            <h2 id="dash-enquiries">Latest enquiries</h2>
            <Link className="cms-link" href={`${admin}/collections/inquiries`}>All →</Link>
          </div>
          {recent.docs.length ? (
            <ul className="cms-list">
              {recent.docs.map((e) => (
                <li key={e.id}>
                  <OpenInModal collection="inquiries" id={e.id} className="cms-list-item" label={`Open enquiry from ${e.name}`}>
                    <span className="cms-avatar" aria-hidden="true">{e.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}</span>
                    <span><b>{e.name}</b><small>{e.service || 'General enquiry'} · {when(e.createdAt)}</small></span>
                    <em className={e.status === 'new' ? 'is-new' : undefined}>{e.status === 'new' ? 'New' : e.status === 'replied' ? 'Replied' : 'Archived'}</em>
                  </OpenInModal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cms-muted">No messages yet. They arrive here from the contact form.</p>
          )}
        </section>

        <section className="cms-card" aria-labelledby="dash-site">
          <div className="cms-card-head">
            <h2 id="dash-site">Website</h2>
            <div className="cms-quick">
              <QuickCreate collection="projects" label="+ Project" then="open" className="cms-btn cms-btn-sm" />
              <QuickCreate collection="media" label="Upload" className="cms-btn cms-btn-sm" />
            </div>
          </div>
          <ul className="cms-list">
            <li><Link href={`${admin}/globals/header`}><span className="cms-avatar" aria-hidden="true">H</span><span><b>Header</b><small>Menu links and the quote button</small></span></Link></li>
            <li><Link href={`${admin}/globals/footer`}><span className="cms-avatar" aria-hidden="true">F</span><span><b>Footer</b><small>Columns, contact and copyright</small></span></Link></li>
            <li><Link href={`${admin}/globals/theme`}><span className="cms-avatar" aria-hidden="true">Aa</span><span><b>Styles</b><small>Colours, fonts, buttons and spacing</small></span></Link></li>
            <li><Link href={`${admin}/globals/site`}><span className="cms-avatar" aria-hidden="true">S</span><span><b>Site settings</b><small>Name, contact, socials, default SEO</small></span></Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
