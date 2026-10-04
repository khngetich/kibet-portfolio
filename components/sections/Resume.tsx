import './resume.css';
import Link from 'next/link';
import type { Page, Project, Site } from '@/payload-types';
import { asMedia, type ProjectCard } from '@/lib/cms';
import { text } from '@/lib/home-copy';
import { Accent } from '@/components/Accent';
import { Icon } from '@/components/Icon';
import { Img } from '@/components/Img';
import { Reveal } from '@/components/motion/Reveal';
import { ResumeNav } from '@/components/motion/ResumeNav';
import { DISCIPLINES } from '@/collections/Projects';
import { isToolGroup, toolMark } from './ToolMarks';

/**
 * The Résumé section (blocks/sections.ts → ResumeSection): a full CV on one page, after the
 * CV page on designbythomted.world. An intro beside a dark availability card, a row of
 * figures, then the parts of the CV in a column with an “At a glance” menu down the side.
 * Each part shows only when it has content; the menu lists the parts that show.
 */

type Section = NonNullable<Page['sections']>[number];
type ResumeBlock = Extract<Section, { blockType: 'resume' }>;
type Link = { label?: string | null; url?: string | null; variant?: string | null } | null | undefined;

const BUTTON: Record<string, string> = { light: 'btn-light', dark: 'btn-dark', accent: 'btn-accent', outline: 'btn-outline', ghost: 'btn-ghost' };
const btn = (variant: string | null | undefined, fallback: string) => `btn ${(variant && BUTTON[variant]) || fallback}`;
const discipline = (v: string) => DISCIPLINES.find((d) => d.value === v)?.label ?? v;
const paragraphs = (s?: string | null) => (s ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const projectsOf = (rel: ResumeBlock['projects']): ProjectCard[] =>
  (rel ?? []).filter((p): p is Project => typeof p === 'object' && !!p && p._status !== 'draft');

export function ResumeSection({ s, site, featured, id, first }: { s: ResumeBlock; site: Site; featured: ProjectCard[]; id?: string; first: boolean }) {
  // One h1 per page: the name, when this is the page's first section.
  const H = first ? 'h1' : 'h2';
  const Sub = first ? 'h2' : 'h3';
  const Item = first ? 'h3' : 'h4';
  // Anchors are prefixed so they can't clash with another section's on the same page.
  const p = id ? `${id}-` : 'cv-';

  const cv = asMedia(s.cv);
  const card = s.card;
  const picked = projectsOf(s.projects);
  const work = (picked.length ? picked : featured).slice(0, 4);
  const linkedin = site.socials?.find((x) => x.platform === 'linkedin')?.url;
  const workLink = { label: text(s.workLink?.label, 'See all work'), url: text(s.workLink?.url, '/work') };
  const closing = { label: text(s.closingLink?.label, 'Let’s talk about it'), url: text(s.closingLink?.url, '/#contact'), variant: s.closingLink?.variant };
  const cardLink = s.cardLink?.label && s.cardLink?.url ? s.cardLink : null;
  const [place, zone] = (card?.place ?? '').split('·').map((x) => x.trim());

  const parts = [
    { id: `${p}profile`, label: 'Profile', show: !!(s.profile || s.quote || s.pillars?.length) },
    { id: `${p}experience`, label: 'Experience', show: !!s.jobs?.length },
    { id: `${p}work`, label: 'Selected work', show: work.length > 0 },
    { id: `${p}skills`, label: 'Skills & tools', show: !!s.skillGroups?.length },
    { id: `${p}education`, label: 'Education', show: !!(s.schools?.length || s.certs?.length) },
  ].filter((x) => x.show);
  const [profileId, xpId, workId, skillsId, eduId] = ['profile', 'experience', 'work', 'skills', 'education'].map((k) => `${p}${k}`);
  const has = (partId: string) => parts.some((x) => x.id === partId);
  // start years for the year strip: the first year in each role's dates, newest first, each
  // pointing at the first role that began then
  const years: { year: string; job: number }[] = [];
  (s.jobs ?? []).forEach((j, i) => {
    const year = j.dates?.match(/\b(19|20)\d{2}\b/)?.[0];
    if (year && !years.some((y) => y.year === year)) years.push({ year, job: i });
  });

  return (
    <section className="cv" id={id} aria-label={`Résumé: ${s.name.replace(/\*/g, '')}`}>
      {/* ── intro and availability card ── */}
      <div className="wrap cv-hero">
        <div className="cv-hero-main">
          {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
          <H className="cv-name"><Accent text={s.name} /></H>
          {s.role && <p className="cv-role">{s.role}</p>}
          {s.intro && <p className="lede cv-intro">{s.intro}</p>}
          {s.current && <p className="cv-current">{s.currentLead && <span>{s.currentLead} </span>}<b>{s.current}</b></p>}
          <div className="cv-actions">
            {cv?.url && (
              <a className="btn btn-dark cv-download" href={cv.url} download>
                <Icon name="download" size={16} />{text(s.cvLabel, 'Download résumé')}<span className="cv-file">PDF</span>
              </a>
            )}
            {has(xpId) && <a className="link-under" href={`#${xpId}`}>Explore my experience <Icon name="arrow" size={14} style={{ rotate: '90deg' }} /></a>}
          </div>
        </div>
        {card?.heading && (
          <div className="cv-pass-wrap">
          <aside className="cv-pass" aria-label="Availability">
            <div className="cv-pass-band">
              <span>{card.kicker || 'Open to work'}</span>
              <span className="cv-pass-no">Nº {new Date().getFullYear()}</span>
            </div>
            <div className="cv-pass-main">
              <p className="cv-pass-heading"><Accent text={card.heading} /></p>
              {card.text && <p className="cv-pass-text">{card.text}</p>}
              {(place || zone) && (
                <dl className="cv-pass-fields">
                  {place && <div><dt>Based in</dt><dd>{place}</dd></div>}
                  {zone && <div><dt>Time zone</dt><dd>{zone}</dd></div>}
                </dl>
              )}
              {!!card.workTypes?.length && (
                <ul className="cv-pass-stamps" aria-label="Ways of working">{card.workTypes.map((t) => <li key={t}>{t}</li>)}</ul>
              )}
            </div>
            <div className="cv-pass-perf" aria-hidden="true" />
            <div className="cv-pass-stub">
              {!!card.topics?.length && (
                <>
                  <p className="cv-pass-label">{text(card.topicsLabel, 'Let’s talk about')}</p>
                  <ul className="cv-card-topics">{card.topics.map((t) => <li key={t}>{t}</li>)}</ul>
                </>
              )}
              {cardLink && (
                <a className="cv-pass-link" href={cardLink.url!}>
                  <span>{cardLink.label}<Icon name="arrow" size={15} /></span>
                  <Barcode seed={s.name} />
                </a>
              )}
            </div>
          </aside>
          </div>
        )}
      </div>

      {/* ── figures ── */}
      {!!s.stats?.length && (
        <div className="wrap">
          <dl className="cv-stats">
            {s.stats.map((x) => (
              <div key={x.id} className="cv-stat"><dt>{x.label}</dt><dd>{x.value}</dd></div>
            ))}
          </dl>
        </div>
      )}

      {/* ── the CV, with the menu down the side ── */}
      {parts.length > 0 && (
        <div className="wrap cv-body">
          <ResumeNav items={parts.map(({ id: i, label }) => ({ id: i, label }))}>
            <ul className="cv-nav-extra">
              {cv?.url && <li><a href={cv.url} download><Icon name="download" size={15} />Take the résumé with you</a></li>}
              <li><a href={closing.url}><Icon name="mail" size={15} />Discuss a role</a></li>
            </ul>
          </ResumeNav>

          <div className="cv-main">
            {has(profileId) && (
              <section className="cv-part" id={profileId} aria-labelledby={`${profileId}-h`}>
                <Reveal>
                  <p className="ed-kicker">Profile</p>
                  <Sub className="h-lg cv-h" id={`${profileId}-h`}><Accent text={text(s.profileHeading, 'Profile')} /></Sub>
                  {paragraphs(s.profile).length > 0 && <div className="cv-prose">{paragraphs(s.profile).map((t, i) => <p key={i}>{t}</p>)}</div>}
                  {s.quote && <blockquote className="cv-quote">{s.quote}</blockquote>}
                </Reveal>
                {!!s.pillars?.length && (
                  <ol className="cv-pillars">
                    {s.pillars.map((x, i) => (
                      <li key={x.id}>
                        <Reveal delay={i * 0.1}>
                          <span className="cv-pillar-no">{String(i + 1).padStart(2, '0')}</span>
                          <Item className="cv-pillar-title">{x.title}</Item>
                          {x.text && <p>{x.text}</p>}
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            )}

            {has(xpId) && (
              <section className="cv-part" id={xpId} aria-labelledby={`${xpId}-h`}>
                <p className="ed-kicker">Professional experience</p>
                <Sub className="h-lg cv-h" id={`${xpId}-h`}><Accent text={text(s.xpHeading, 'Experience')} /></Sub>
                {years.length > 1 && (
                  <nav className="cv-years" aria-label="Jump to a year">
                    <ol>
                      {years.map((y, k) => (
                        <li key={y.year}><a href={`#${p}job-${y.job}`} className={k === 0 ? 'is-now' : undefined} aria-label={k === 0 ? `${y.year}, current role` : `From ${y.year}`}>{k === 0 && <span className="cv-years-tag">Now</span>}{y.year}</a></li>
                      ))}
                    </ol>
                  </nav>
                )}
                <ol className="cv-jobs">
                  {s.jobs!.map((j, i) => (
                    <li key={j.id} id={`${p}job-${i}`} className="cv-job-item">
                      <Reveal className={`cv-job${i === 0 ? ' is-current' : ''}`} y={20}>
                        <div className="cv-job-meta">
                          {j.dates && <span>{j.dates}</span>}
                          {(j.place || j.mode) && <span>{[j.place, j.mode].filter(Boolean).join(' · ')}</span>}
                        </div>
                        <Item className="cv-job-role">{j.role}</Item>
                        <p className="cv-job-company">{j.company}</p>
                        {j.about && <p className="cv-job-about">{j.about}</p>}
                        {j.summary && <p className="cv-job-summary">{j.summary}</p>}
                        {!!j.points?.length && <ul className="cv-job-points">{j.points.map((t, k) => <li key={k}>{t}</li>)}</ul>}
                        {j.linkLabel && j.linkUrl && <Link className="link-under cv-job-link" href={j.linkUrl}>{j.linkLabel}<Icon name="external" size={14} /></Link>}
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {has(workId) && (
              <section className="cv-part" id={workId} aria-labelledby={`${workId}-h`}>
                <p className="ed-kicker">Selected work</p>
                <Sub className="h-lg cv-h" id={`${workId}-h`}><Accent text={text(s.workHeading, 'Selected work')} /></Sub>
                {s.workIntro && <p className="lede cv-part-intro">{s.workIntro}</p>}
                <ul className="cv-work">
                  {work.map((w) => (
                    <li key={w.id}>
                      <Link className="cv-work-row" href={`/work/${w.slug}`}>
                        <span className="cv-work-thumb">{asMedia(w.cover) ? <Img media={w.cover} sizes="(max-width: 640px) 90vw, 240px" /> : <span className="cv-work-ph" aria-hidden="true">{w.title.slice(0, 1)}</span>}</span>
                        <span className="cv-work-text">
                          <Item className="cv-work-title">{w.title}</Item>
                          <span className="cv-work-sub">{[w.client, ...(w.role ?? []).slice(0, 2)].filter(Boolean).join(' · ')}</span>
                          {w.summary && <span className="cv-work-summary">{w.summary}</span>}
                          {!!w.disciplines?.length && <span className="cv-work-tags">{w.disciplines.map((d) => <span key={d}>{discipline(d)}</span>)}</span>}
                          <span className="cv-work-more">See the case study <Icon name="external" size={14} /></span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link className="cv-work-all" href={workLink.url}>{workLink.label}<Icon name="external" size={16} /></Link>
              </section>
            )}

            {has(skillsId) && (
              <section className="cv-part" id={skillsId} aria-labelledby={`${skillsId}-h`}>
                <p className="ed-kicker">Skills &amp; tools</p>
                <Sub className="h-lg cv-h" id={`${skillsId}-h`}><Accent text={text(s.skillsHeading, 'Skills')} /></Sub>
                <dl className="cv-skills">
                  {s.skillGroups!.map((g, i) => (
                    <div key={g.id} className="cv-skill-row">
                      <dt><span className="cv-tag"><span className="cv-tag-no">{String(i + 1).padStart(2, '0')}</span><span className="cv-tag-label">{g.label}</span></span></dt>
                      <dd>
                        {isToolGroup(g.items ?? [])
                          ? <ul className="cv-tools">{(g.items ?? []).map((t) => <li key={t}>{toolMark(t) ?? <span className="cv-tool-blank" aria-hidden="true">{t.slice(0, 2)}</span>}<span>{t.replace(/^Adobe\s+/, '')}</span></li>)}</ul>
                          : <ul className="cv-chips">{(g.items ?? []).map((t) => <li key={t}>{t}</li>)}</ul>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {has(eduId) && (
              <section className="cv-part" id={eduId} aria-labelledby={`${eduId}-h`}>
                <p className="ed-kicker">Education</p>
                <Sub className="h-lg cv-h" id={`${eduId}-h`}><Accent text={text(s.eduHeading, 'Education')} /></Sub>
                {!!s.schools?.length && (
                  <ul className="cv-edu">
                    {s.schools.map((e) => (
                      <li key={e.id}>
                        {e.years && <p className="cv-edu-years">{e.years}</p>}
                        <Item className="cv-edu-title">{e.qualification}</Item>
                        <p className="cv-edu-school">{e.school}{e.place && <span>{e.place}</span>}</p>
                        {e.note && <p className="cv-edu-note">{e.note}</p>}
                      </li>
                    ))}
                  </ul>
                )}
                {!!s.certs?.length && (
                  <div className="cv-certs">
                    <p className="cv-certs-label">Certifications</p>
                    <ul>
                      {s.certs.map((c) => (
                        <li key={c.id}>
                          <div className="cv-cert-head">
                            <Item className="cv-cert-title">{c.title}</Item>
                            {c.year && <span className="cv-cert-year">{c.year}</span>}
                          </div>
                          {c.issuer && <p className="cv-cert-issuer">{c.issuer}</p>}
                          {c.note && <p className="cv-cert-note">{c.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {/* ── closing ── */}
      {s.closingHeading && (
        <div className="wrap">
          <Reveal className="cv-closing">
            <div>
              {s.closingKicker && <p className="ed-kicker">{s.closingKicker}</p>}
              <Sub className="h-lg cv-h"><Accent text={s.closingHeading} /></Sub>
              {s.closingText && <p className="lede">{s.closingText}</p>}
            </div>
            <div className="cv-closing-actions">
              <a className={btn(closing.variant, 'btn-dark')} href={closing.url}>{closing.label}<Icon name="external" size={16} /></a>
              <ul className="cv-closing-links">
                {s.showEmail && site.email && <li><a href={`mailto:${site.email}`}><Icon name="mail" size={16} />{site.email}</a></li>}
                {cv?.url && <li><a href={cv.url} download><Icon name="download" size={16} />Download my CV</a></li>}
                {s.showLinkedIn && linkedin && <li><a href={linkedin} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={16} />Connect on LinkedIn</a></li>}
              </ul>
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}

/** Decorative bars on the pass's stub, the same for the same name. */
function Barcode({ seed }: { seed: string }) {
  const widths = Array.from({ length: 22 }, (_, i) => 1 + ((seed.charCodeAt(i % seed.length) + i * 7) % 3));
  const xs = widths.map((_, i) => widths.slice(0, i).reduce((sum, w) => sum + w + 2, 0));
  const total = xs[xs.length - 1] + widths[widths.length - 1];
  return (
    <svg className="cv-barcode" viewBox={`0 0 ${total} 28`} height="28" aria-hidden="true">
      {widths.map((w, i) => <rect key={i} x={xs[i]} y="0" width={w} height="28" fill="currentColor" />)}
    </svg>
  );
}
