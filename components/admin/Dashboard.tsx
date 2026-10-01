import Link from 'next/link';
import { Suspense } from 'react';
import type { Payload, TypedUser } from 'payload';
import { Icon, type IconName } from '@/components/ui/Icon';
import { QuickCreate } from './Crud';
import { DocLink, NewDoc } from './DocModal';
import { DashIntro } from './DashIntro';
import { EnquiryChart } from './DashboardCharts';
import { Img } from '@/components/Img';
import { getEnquiryStats, getInbox, getMediaStats, getPages, getProjects, getRecentWork, getSiteDefaults, LARGE_IMAGE } from './dashboard/data';
import { Greeting, LiveStatus, StickyHero } from './dashboard/Hero';
import { Tasks, type Task } from './dashboard/Tasks';
import { Health, type HealthCheck } from './dashboard/Health';
import { Inbox } from './dashboard/Inbox';
import { StatusBadge, Workflow, type WorkItem } from './dashboard/Workflow';

/**
 * The CMS home screen, laid out as a command centre:
 *   hero      greeting and date, live status, quick actions (search is ⌘K, in the sidebar);
 *             pinned under the top bar while the page scrolls
 *   insights  four tiles that each say what needs doing and link straight to it; the first,
 *             the inbox, sits on the dark inverse surface as the headline number
 *   bento     enquiries + content workflow (8 cols) beside to-do, site health and settings (4)
 *   work      the four latest projects, with their covers
 *   inbox     latest enquiries with triage on the row
 *
 * The hero renders at once; every card below is its own Suspense boundary, so each streams in
 * as its queries finish, behind a skeleton of the same size (no layout shift). Shared queries
 * are deduplicated per request (dashboard/data.ts). New pages, projects and uploads open in
 * pop-up forms.
 */

type Props = { payload: Payload; user?: TypedUser | null };

const DAY = 86400000;
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;

function Skeleton({ height, lines = 3, className = '' }: { height: number; lines?: number; className?: string }) {
  return (
    <div className={`cms-card cms-skel ${className}`} style={{ minHeight: height }} aria-busy="true" aria-label="Loading">
      <span className="cms-skel-bar" style={{ width: '32%' }} />
      {Array.from({ length: lines }, (_, i) => <span key={i} className="cms-skel-bar is-thin" style={{ width: `${88 - i * 14}%` }} />)}
    </div>
  );
}

/* ── insight tiles ── */

type Tile = { key: string; icon: IconName; value: string; label: string; note: string; delta?: { pct: number; period: string } | null; warn?: boolean; action: { label: string; href: string; doc?: { collection: string; id: number } } };

async function Insights({ payload, admin }: { payload: Payload; admin: string }) {
  const [inbox, pages, projects, media, enquiries] = await Promise.all([getInbox(payload), getPages(payload), getProjects(payload), getMediaStats(payload), getEnquiryStats(payload)]);
  // rolling 30 days against the 30 before (whole hours, so the editor's time zone doesn't matter)
  // eslint-disable-next-line react-hooks/purity -- a server render per request; the clock is meant to be read
  const now = Date.now();
  const inWindow = (from: number, to: number) => enquiries.hours.reduce((a, h) => (h.t >= now - from * DAY && h.t < now - to * DAY ? a + h.n : a), 0);
  const last30 = inWindow(30, 0);
  const prev30 = inWindow(60, 30);
  const waiting = [...pages, ...projects].filter((d) => d.status !== 'live');
  const edits = waiting.filter((d) => d.status === 'edits').length;
  // live projects first: a case study visitors can already see is the one worth finishing
  const noSamples = projects.filter((p) => !p.samples).sort((a, b) => Number(a.status !== 'live') - Number(b.status !== 'live'));
  const largeHref = `${admin}/collections/media?${new URLSearchParams({ 'where[and][0][mimeType][like]': 'image', 'where[and][1][filesize][greater_than]': String(LARGE_IMAGE) })}`;

  const tiles: Tile[] = [
    {
      key: 'inbox', icon: 'inbox', value: String(inbox.unread), label: 'Unread enquiries',
      note: `${plural(last30, 'enquiry', 'enquiries')} in the last 30 days`, warn: inbox.unread > 0,
      delta: prev30 ? { pct: Math.round(((last30 - prev30) / prev30) * 100), period: 'vs previous 30 days' } : null,
      action: inbox.unread ? { label: 'Triage now', href: '#dash-inbox' } : { label: 'Open inbox', href: `${admin}/collections/inquiries` },
    },
    {
      key: 'publish', icon: 'file', value: String(waiting.length), label: 'Waiting to publish',
      note: waiting.length ? `${edits} with unpublished changes · ${waiting.length - edits} not live` : 'Every page and project is live', warn: waiting.length > 0,
      action: waiting.length ? { label: 'Review', href: '#dash-workflow' } : { label: 'All pages', href: `${admin}/collections/pages` },
    },
    {
      key: 'media', icon: 'image', value: media.total.toLocaleString('en-GB'), label: 'Media files',
      note: media.large ? `${plural(media.large, 'image')} over 1 MB` : 'Every image is under 1 MB', warn: media.large > 0,
      action: media.large ? { label: 'Review large files', href: largeHref } : { label: 'Open library', href: `${admin}/collections/media` },
    },
    {
      key: 'projects', icon: 'portfolio', value: String(projects.length), label: 'Projects',
      note: noSamples.length ? `${noSamples.length} without case-study samples` : `${projects.filter((p) => p.featured).length} featured · all have samples`, warn: noSamples.length > 0,
      action: noSamples[0] ? { label: `Add samples to ${noSamples[0].title}`, href: `${admin}/collections/projects/${noSamples[0].id}`, doc: { collection: 'projects', id: noSamples[0].id } } : { label: 'All projects', href: `${admin}/collections/projects` },
    },
  ];

  return (
    <section className="cms-insights cms-anim" aria-label="What needs doing">
      {tiles.map((t, n) => (
        <div key={t.key} className={`cms-insight${t.warn ? ' is-warn' : ''}${n === 0 ? ' is-feature' : ''}`}>
          <div className="cms-insight-head">
            <p className="cms-insight-label">{t.label}</p>
            <span className="cms-insight-icon" aria-hidden="true"><Icon name={t.icon} size={18} /></span>
          </div>
          <p className="cms-insight-value">{t.value}</p>
          {t.delta && (
            <p className={`cms-delta${t.delta.pct > 0 ? ' is-up' : t.delta.pct < 0 ? ' is-down' : ''}`}>
              {t.delta.pct !== 0 && <Icon name={t.delta.pct > 0 ? 'up' : 'down'} size={13} weight="semibold" />}
              {t.delta.pct > 0 ? '+' : ''}{t.delta.pct}% <span>{t.delta.period}</span>
            </p>
          )}
          <p className="cms-insight-note">{t.warn && <i aria-hidden="true" />}{t.note}</p>
          {t.action.doc
            ? <DocLink className="cms-insight-action" collection={t.action.doc.collection} id={t.action.doc.id} href={t.action.href}>{t.action.label} <Icon name="right" size={14} /></DocLink>
            : <Link className="cms-insight-action" href={t.action.href}>{t.action.label} <Icon name="right" size={14} /></Link>}
        </div>
      ))}
    </section>
  );
}

/* ── cards ── */

async function EnquiriesCard({ payload }: { payload: Payload }) {
  const { hours, replyRate } = await getEnquiryStats(payload);
  return <section className="cms-card cms-anim" aria-labelledby="dash-enquiries"><EnquiryChart hours={hours} replyRate={replyRate} /></section>;
}

async function WorkflowCard({ payload, admin }: { payload: Payload; admin: string }) {
  const [pages, projects] = await Promise.all([getPages(payload), getProjects(payload)]);
  const items: (WorkItem & { at: string })[] = [
    ...pages.map((p) => ({ key: `page-${p.id}`, id: p.id, kind: 'page' as const, title: p.title, sub: p.path ?? 'No address yet', path: p.path, href: `${admin}/collections/pages/${p.id}`, status: p.status, ago: p.ago, at: p.updatedAt })),
    ...projects.map((p) => ({ key: `project-${p.id}`, id: p.id, kind: 'project' as const, title: p.title, sub: p.client || p.path || 'No address yet', path: p.path, href: `${admin}/collections/projects/${p.id}`, status: p.status, ago: p.ago, at: p.updatedAt })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <section className="cms-card cms-anim" aria-labelledby="dash-workflow">
      <Workflow items={items.map(({ at: _at, ...i }) => i)} />
    </section>
  );
}

async function HealthCard({ payload, admin }: { payload: Payload; admin: string }) {
  const [pages, site] = await Promise.all([getPages(payload), getSiteDefaults(payload)]);
  const edit = (id: number) => `${admin}/collections/pages/${id}`;
  const siteHref = `${admin}/globals/site`;
  const checks: HealthCheck[] = [
    {
      key: 'title', label: 'Search titles', fallback: 'use the page name', fallbackPasses: false,
      pages: pages.map((p) => ({ id: p.id, title: p.title, href: edit(p.id), state: p.meta?.title ? 'own' : 'fallback' })),
    },
    {
      key: 'description', label: 'Descriptions', fallback: 'use the site description', fallbackPasses: false,
      pages: pages.map((p) => ({ id: p.id, title: p.title, href: edit(p.id), state: p.meta?.description ? 'own' : site.description ? 'fallback' : 'missing' })),
      fix: site.description ? undefined : { label: 'Add a site-wide description in Site settings', href: siteHref },
    },
    {
      key: 'image', label: 'Share images', fallback: 'use the site image', fallbackPasses: true,
      pages: pages.map((p) => ({ id: p.id, title: p.title, href: edit(p.id), state: p.meta?.image ? 'own' : site.image ? 'fallback' : 'missing' })),
      fix: site.image ? undefined : { label: 'Add a default share image in Site settings', href: siteHref },
    },
  ];
  return <section className="cms-card cms-anim" aria-labelledby="dash-health"><Health checks={checks} /></section>;
}

async function TasksCard({ payload, admin }: { payload: Payload; admin: string }) {
  const [inbox, pages, projects, media, site] = await Promise.all([getInbox(payload), getPages(payload), getProjects(payload), getMediaStats(payload), getSiteDefaults(payload)]);
  const pageDoc = (id: number) => ({ href: `${admin}/collections/pages/${id}`, doc: { collection: 'pages', id } });
  const projectDoc = (id: number) => ({ href: `${admin}/collections/projects/${id}`, doc: { collection: 'projects', id } });
  const noTitle = pages.filter((p) => !p.meta?.title);
  const noDesc = pages.filter((p) => !p.meta?.description);
  const noImage = pages.filter((p) => !p.meta?.image && !site.image);
  const largeHref = `${admin}/collections/media?${new URLSearchParams({ 'where[and][0][mimeType][like]': 'image', 'where[and][1][filesize][greater_than]': String(LARGE_IMAGE) })}`;
  // one task for a single document opens it in the pop-up; a task over many goes to the first
  const noSamples = projects.filter((p) => !p.samples).sort((a, b) => Number(a.status !== 'live') - Number(b.status !== 'live'));
  const firstOf = (list: { id: number }[]) => (list[0] ? pageDoc(list[0].id) : { href: `${admin}/collections/pages` });

  const tasks: Task[] = [
    {
      key: 'inbox', priority: 'high', done: inbox.unread === 0, href: inbox.unread ? '#dash-inbox' : `${admin}/collections/inquiries`,
      label: inbox.unread ? `Reply to ${plural(inbox.unread, 'new enquiry', 'new enquiries')}` : 'Reply to new enquiries',
      detail: inbox.unread ? 'Waiting in the inbox below' : 'Inbox is clear',
    },
    ...[...pages.map((p) => ({ ...p, kind: 'page' as const })), ...projects.map((p) => ({ ...p, kind: 'project' as const }))]
      .filter((d) => d.status === 'edits')
      .map((d): Task => ({
        key: `edits-${d.kind}-${d.id}`, priority: 'medium', done: false, ...(d.kind === 'page' ? pageDoc(d.id) : projectDoc(d.id)),
        label: `Publish changes to ${d.title}`, detail: `${d.kind === 'page' ? 'Page' : 'Project'} · edited ${d.ago}; visitors still see the older version`,
      })),
    {
      key: 'titles', priority: 'medium', done: noTitle.length === 0, ...firstOf(noTitle),
      label: noTitle.length ? `Write search titles for ${plural(noTitle.length, 'page')}` : 'Search titles',
      detail: noTitle.length ? noTitle.map((p) => p.title).join(', ') : 'Every page has its own',
    },
    {
      key: 'descriptions', priority: 'medium', done: noDesc.length === 0, ...firstOf(noDesc),
      label: noDesc.length ? `Write descriptions for ${plural(noDesc.length, 'page')}` : 'Search descriptions',
      detail: noDesc.length ? noDesc.map((p) => p.title).join(', ') : 'Every page has its own',
    },
    {
      key: 'share', priority: 'normal', done: noImage.length === 0, ...(site.image ? { href: `${admin}/globals/site` } : firstOf(noImage)),
      label: noImage.length ? 'Add share images' : 'Share images',
      detail: noImage.length ? `${plural(noImage.length, 'page')} without one, and no site default` : site.image ? 'Pages without their own use the site default' : 'Every page has its own',
    },
    {
      key: 'media', priority: 'normal', done: media.large === 0, href: largeHref,
      label: media.large ? `Shrink ${plural(media.large, 'image')} over 1 MB` : 'Image sizes',
      detail: media.large ? 'Large files slow the site down on phones' : 'Every image is under 1 MB',
    },
    // live case studies first; past the first three, one task covers the rest
    ...noSamples.slice(0, 3).map((p): Task => ({
      key: `samples-${p.id}`, priority: p.status === 'live' ? 'medium' : 'normal', done: false, ...projectDoc(p.id),
      label: `Add samples to ${p.title}`, detail: p.status === 'live' ? 'Live case study with no work to show' : 'Draft case study',
    })),
    ...(noSamples.length > 3 ? [{
      key: 'samples-more', priority: 'normal' as const, done: false, href: `${admin}/collections/projects`,
      label: `Add samples to ${plural(noSamples.length - 3, 'more project')}`, detail: noSamples.slice(3).map((p) => p.title).join(', '),
    }] : []),
    ...pages.filter((p) => p.status === 'draft').map((p): Task => ({
      key: `draft-page-${p.id}`, priority: 'normal', done: false, ...pageDoc(p.id),
      label: `Finish and publish ${p.title}`, detail: `Not on the site yet · edited ${p.ago}`,
    })),
  ];
  return <section className="cms-card cms-anim" aria-labelledby="dash-tasks"><Tasks tasks={tasks} /></section>;
}

async function RecentWorkCard({ payload, admin }: { payload: Payload; admin: string }) {
  const work = await getRecentWork(payload);
  if (!work.length) return null;
  return (
    <section className="cms-card cms-anim cms-work-strip" aria-labelledby="dash-recent">
      <div className="cms-section-head">
        <div>
          <h2 id="dash-recent">Recent work <span className="cms-count is-strong">{work.length}</span></h2>
          <p className="cms-muted">The latest projects you’ve edited</p>
        </div>
        <Link className="cms-link" href={`${admin}/collections/projects`}>All projects →</Link>
      </div>
      <ul className="cms-work-cards">
        {work.map((w) => (
          <li key={w.id}>
            <DocLink className="cms-work-card" collection="projects" id={w.id} href={`${admin}/collections/projects/${w.id}`}>
              <span className="cms-work-cover">{w.cover ? <Img media={w.cover} sizes="(max-width: 640px) 100vw, 320px" /> : <Icon name="image" size={20} />}</span>
              <span className="cms-work-card-body">
                <span className="cms-work-card-top">
                  <b>{w.title}</b>
                  <StatusBadge status={w.status} />
                </span>
                <small>{[w.client, w.year].filter(Boolean).join(' · ') || 'No client yet'}</small>
                <span className="cms-work-card-meta">
                  <span>{w.samples ? plural(w.samples, 'sample') : 'No samples'}</span>
                  <span>Edited {w.ago}</span>
                </span>
              </span>
            </DocLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

async function InboxCard({ payload, admin }: { payload: Payload; admin: string }) {
  const inbox = await getInbox(payload);
  return <section className="cms-card cms-anim" aria-labelledby="dash-inbox"><Inbox items={inbox.items} unread={inbox.unread} admin={admin} /></section>;
}

function SettingsCard({ admin }: { admin: string }) {
  const links: { href: string; icon: IconName; label: string; sub: string }[] = [
    { href: `${admin}/globals/header`, icon: 'layoutTop', label: 'Header', sub: 'Menu links and the quote button' },
    { href: `${admin}/globals/footer`, icon: 'layoutBottom', label: 'Footer', sub: 'Call to action, columns, legal' },
    { href: `${admin}/globals/theme`, icon: 'palette', label: 'Styles', sub: 'Colours, fonts, buttons, spacing' },
    { href: `${admin}/globals/site`, icon: 'settings', label: 'Site settings', sub: 'Name, contact, socials, default SEO' },
  ];
  return (
    <section className="cms-card cms-anim" aria-labelledby="dash-site">
      <div className="cms-card-head">
        <div>
          <h2 id="dash-site">Site-wide</h2>
          <p className="cms-muted">Shown on every page</p>
        </div>
      </div>
      <ul className="cms-shortcuts">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>
              <span className="cms-shortcut-icon" aria-hidden="true"><Icon name={l.icon} size={16} /></span>
              <span><b>{l.label}</b><small>{l.sub}</small></span>
              <Icon name="right" size={15} className="cms-shortcut-go" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export async function Dashboard({ payload, user }: Props) {
  const admin = payload.config.routes.admin;
  const firstName = (user as { name?: string } | null)?.name?.split(' ')[0];
  const siteURL = process.env.NEXT_PUBLIC_SERVER_URL || '/';

  return (
    <div className="cms-dash is-intro">
      <DashIntro />
      <StickyHero>
        <Greeting name={firstName} />
        <div className="cms-dash-actions">
          <LiveStatus />
          <a className="cms-btn cms-btn-ghost" href={siteURL} target="_blank" rel="noopener noreferrer">View site <Icon name="external" size={14} /></a>
          <QuickCreate collection="media" label="Upload media" className="cms-btn" />
          <NewDoc collection="pages" className="cms-btn cms-btn-primary"><Icon name="plus" size={16} /> New page</NewDoc>
        </div>
      </StickyHero>

      <Suspense fallback={<div className="cms-insights">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={168} lines={2} className="cms-skel-tile" />)}</div>}>
        <Insights payload={payload} admin={admin} />
      </Suspense>

      {/* Paired rows that end level (no ragged columns), partners chosen for similar heights: each
          8-col card sets its row's height and the 4-col card beside it stretches to match. To do
          fills the space beside Content and scrolls inside it rather than making the row taller. */}
      <div className="cms-bento">
        <div className="cms-cell cms-span-8"><Suspense fallback={<Skeleton height={360} lines={4} />}><EnquiriesCard payload={payload} /></Suspense></div>
        <div className="cms-cell cms-span-4"><Suspense fallback={<Skeleton height={392} lines={4} />}><HealthCard payload={payload} admin={admin} /></Suspense></div>
        <div className="cms-cell cms-span-8"><Suspense fallback={<Skeleton height={360} lines={5} />}><WorkflowCard payload={payload} admin={admin} /></Suspense></div>
        <div className="cms-cell cms-span-4 is-fill"><Suspense fallback={<Skeleton height={360} lines={5} />}><TasksCard payload={payload} admin={admin} /></Suspense></div>
        <div className="cms-cell cms-span-8"><Suspense fallback={<Skeleton height={340} lines={3} />}><RecentWorkCard payload={payload} admin={admin} /></Suspense></div>
        <div className="cms-cell cms-span-4"><SettingsCard admin={admin} /></div>
        {/* full width with no partner: an empty inbox stays a slim strip instead of stretching */}
        <div className="cms-cell cms-span-12"><Suspense fallback={<Skeleton height={200} lines={3} />}><InboxCard payload={payload} admin={admin} /></Suspense></div>
      </div>
    </div>
  );
}
