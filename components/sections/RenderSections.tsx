import Link from 'next/link';
import { RichText } from '@payloadcms/richtext-lexical/react';
import { Showreel } from '@/components/motion/Showreel';
import { PostCard } from '@/components/PostCard';
import { embedURL } from '@/lib/media';
import { getPosts, getTools } from '@/lib/cms';
import type { Header, Media, Page, Project, Site } from '@/payload-types';
import { asMedia, getHeader, getProjects, getServices, getSite, type ProjectCard as Card, type ServiceCard } from '@/lib/cms';
import { digits, price } from '@/lib/format';
import { COPY, DEFAULT_PROCESS, DEFAULT_ROLES, copy, orDefault, text } from '@/lib/home-copy';
import { Img } from '@/components/Img';
import { Icon, type IconName } from '@/components/Icon';
import { CaseStudies } from '@/components/sections/CaseStudies';
import { ScrollRow } from '@/components/motion/ScrollRow';
import { ServiceDeck } from '@/components/motion/ServiceDeck';
import { ContactForm } from '@/components/ContactForm';
import { ProjectCard } from '@/components/ProjectCard';
import { WorkGrid } from '@/components/WorkGrid';
import { Reveal, ScrollWords } from '@/components/motion/Reveal';
import { LivingTitle } from '@/components/motion/LivingTitle';
import { Accent, plain } from '@/components/Accent';
import { MarqueeToggle } from '@/components/motion/PauseButton';
import { HeroCards } from '@/components/motion/HeroCards';
import { RoleWheel } from '@/components/motion/RoleWheel';
import { TiltGallery } from '@/components/motion/TiltGallery';
import { CoverFlow } from '@/components/motion/CoverFlow';
import { StackCards } from '@/components/motion/StackCards';
import { AboutBanner } from '@/components/motion/AboutBanner';
import { AboutEditorial } from '@/components/motion/AboutEditorial';
import { AboutPortrait } from '@/components/motion/AboutPortrait';
import { GrowMedia } from '@/components/motion/GrowMedia';
import { SmartLink } from '@/components/SmartLink';
import { ServiceRow } from '@/components/motion/ServiceRow';
import { ResumeSection } from '@/components/sections/Resume';
import { ProfileSection } from '@/components/sections/Profile';

/**
 * Renders a page's sections in order, skipping hidden ones. Each section type is defined
 * in blocks/sections.ts; the matching component below keys off `blockType`.
 */

type Section = NonNullable<Page['sections']>[number];
type Of<T extends Section['blockType']> = Extract<Section, { blockType: T }>;
type Link = { label?: string | null; url?: string | null; variant?: string | null } | null | undefined;
type SectionStyle = { background?: string | null; text?: string | null; accent?: string | null; paddingTop?: number | null; paddingBottom?: number | null; minHeight?: number | null; width?: string | null; align?: string | null; visibility?: string | null } | null | undefined;

const BUTTON: Record<string, string> = { light: 'btn-light', dark: 'btn-dark', accent: 'btn-accent', outline: 'btn-outline', ghost: 'btn-ghost' };
/** A button's class from its chosen Style, falling back to the section's designed one. */
const btn = (variant: string | null | undefined, fallback: string) => `btn ${(variant && BUTTON[variant]) || fallback}`;

/** The Style tab's overrides as a class list and CSS variables on the section's wrapper. */
function styleOf(st: SectionStyle) {
  const vars: Record<string, string> = {};
  const cls = ['sec'];
  if (!st) return { className: cls.join(' '), style: vars };
  if (st.background) { vars['--sec-bg'] = st.background; cls.push('has-bg'); }
  if (st.text) { vars['--sec-ink'] = st.text; cls.push('has-ink'); }
  if (st.accent) { vars['--sec-accent'] = st.accent; cls.push('has-accent'); }
  if (st.paddingTop != null) { vars['--sec-pt'] = `${st.paddingTop}px`; cls.push('has-pt'); }
  if (st.paddingBottom != null) { vars['--sec-pb'] = `${st.paddingBottom}px`; cls.push('has-pb'); }
  if (st.minHeight) { vars['--sec-minh'] = `${st.minHeight}vh`; cls.push('has-minh'); }
  if (st.width && st.width !== 'default') cls.push(`w-${st.width}`);
  if (st.align && st.align !== 'default') cls.push(`a-${st.align}`);
  if (st.visibility === 'desktop') cls.push('hide-mobile');
  if (st.visibility === 'mobile') cls.push('hide-desktop');
  return { className: cls.join(' '), style: vars };
}

type Ctx = {
  site: Site;
  header: Header;
  all: Card[];
  featured: Card[];
  covers: Media[];
  services: ServiceCard[];
  serviceTitles: string[];
  whatsapp: string | null;
  cta: { label: string; url: string };
  studio: boolean;
  /** a "Who it's for" section is on the page, so the contact section doesn't list the roles again */
  audience: boolean;
  /** the contact form is on the page, so sections don't add their own "Start a project" button */
  contact: boolean;
};

const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
/** Picked projects arrive fully populated; pass only the card fields on to client components. */
const projectsOf = (rel: (number | Project)[] | null | undefined): Card[] =>
  (rel ?? []).filter((p): p is Project => typeof p === 'object' && !!p).map(({ id, title, slug, client, year, disciplines, summary, cover, featured, accent, role, outcome, stats }) => ({ id, title, slug, client, year, disciplines, summary, cover, featured, accent, role, outcome, stats }));
/** A section is named by its visible heading, or by a hidden label when the heading was emptied. */
const labelled = (heading: string, hid: string, fallback: string) => (heading ? { 'aria-labelledby': hid } : { 'aria-label': fallback });

/** A Services section's cards: the services picked in it, else every published service (Content → Services). */
type SvcItem = Omit<ServiceCard, 'id' | 'slug'> & { id?: string | number | null; slug?: string | null };
function serviceList(s: Of<'services'>, all: ServiceCard[]): SvcItem[] {
  const picked = (s.services ?? []).filter((x): x is Exclude<typeof x, number> => typeof x === 'object' && !!x && x._status !== 'draft');
  return picked.length ? picked : all;
}

const linkOf = (l: Link, fallback: { label: string; url: string }) => ({ label: text(l?.label, fallback.label), url: text(l?.url, fallback.url), variant: l?.variant ?? null });

/**
 * `studio` keeps hidden sections (dimmed) so the Studio canvas can still select them, and
 * tags every section with its index for click-to-select.
 */
/** Section types that render the page's h1 when they come first. */
const H1_SECTIONS = ['hero', 'projectGrid', 'profile', 'resume'];
/** Section types numbered as chapters of the page's story. */
const CHAPTERS: string[] = ['workShowcase', 'process', 'aboutBanner', 'services', 'testimonials', 'contact', 'tools', 'showreel', 'insights'];

export async function RenderSections({ sections, studio = false, title }: { sections: Page['sections']; studio?: boolean; title?: string }) {
  const visible = (sections ?? []).map((s, index) => ({ s, index })).filter(({ s }) => studio || !s.hidden);
  if (!visible.length) return null;

  const [site, header, all, featuredOnly, services] = await Promise.all([getSite(), getHeader(), getProjects(), getProjects({ featured: true }), getServices()]);
  const featured = featuredOnly.length ? featuredOnly : all;
  const ctx: Ctx = {
    services,
    site,
    header,
    all,
    featured,
    covers: all.map((p) => asMedia(p.cover)).filter((m): m is Media => !!m),
    // the contact form's "What do you need?" options: the Services section's list when it's on
    // the page, otherwise every published service (the About banner picks from the same ones)
    serviceTitles: (() => {
      const shown = visible.flatMap(({ s }) => (!s.hidden && s.blockType === 'services' ? serviceList(s, services).map((i) => i.title) : []));
      return [...new Set(shown.length ? shown : services.map((x) => x.title))];
    })(),
    whatsapp: site.phone && site.whatsapp ? `https://wa.me/${digits(site.phone)}` : null,
    cta: { label: text(header.quoteButton?.label, 'Start a project'), url: text(header.quoteButton?.url, '/#contact') },
    studio,
    audience: visible.some(({ s }) => s.blockType === 'audience'),
    contact: visible.some(({ s }) => s.blockType === 'contact'),
  };

  // Chapters: the story sections after the hero are numbered 01, 02, … (on pages with three or more).
  // (numbered by what visitors see, so the Studio canvas shows the same numbers as the live page)
  const renders = (s: Section) => !s.hidden && (s.blockType === 'testimonials' ? !!s.items?.length : s.blockType === 'services' ? serviceList(s, services).length > 0 : true);
  const storyIdx = visible.filter(({ s }) => CHAPTERS.includes(s.blockType) && renders(s)).map(({ index }) => index);
  const chapterOf = (index: number) => (storyIdx.length >= 3 && storyIdx.includes(index) ? storyIdx.indexOf(index) + 1 : undefined);

  // Every page gets exactly one h1: from its first section, or a hidden one with the page title.
  const needsH1 = !!title && !H1_SECTIONS.includes(visible[0]?.s.blockType ?? '');
  return (
    <>
      {needsH1 && <h1 className="sr-only">{title}</h1>}
      {visible.map(({ s, index }, i) => {
        const key = s.id ?? `${s.blockType}-${index}`;
        const hid = `${s.blockType}-${i}-title`;
        const id = s.anchor || undefined;
        const node = (() => {
          switch (s.blockType) {
            case 'hero': return <HeroSection s={s} ctx={ctx} id={id} hid={hid} first={i === 0} />;
            case 'workShowcase': return <WorkShowcaseSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'aboutBanner': return <AboutBannerSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'audience': return <RoleWheel id={id} headingId={hid} heading={text(s.heading, COPY.rolesHeading)} lead={text(s.lead, COPY.rolesLead)} roles={orDefault(s.roles, DEFAULT_ROLES)} />;
            case 'process': return <ProcessSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'services': return <ServicesSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'testimonials': return <TestimonialsSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'contact': return <ContactSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'projectGrid': return <ProjectGridSection s={s} ctx={ctx} id={id} first={i === 0} />;
            case 'profile': return <ProfileSection s={s} site={ctx.site} id={id} first={i === 0} />;
            case 'richText': return <RichTextSection s={s} id={id} hid={hid} />;
            case 'mediaSection': return <MediaSection s={s} id={id} />;
            case 'ctaBanner': return <CtaSection s={s} ctx={ctx} id={id} hid={hid} />;
            case 'faq': return <FaqSection s={s} id={id} hid={hid} />;
            case 'tools': return <ToolsSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'showreel': return <ShowreelSection s={s} ctx={ctx} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'insights': return <InsightsSection s={s} id={id} hid={hid} chapter={chapterOf(index)} />;
            case 'resume': return <ResumeSection s={s} site={ctx.site} featured={ctx.featured} id={id} first={i === 0} />;
            default: return null;
          }
        })();
        if (!node) return null;
        const { className, style } = styleOf((s as { style?: SectionStyle }).style);
        return (
          <div
            key={key}
            className={`${className}${studio && s.hidden ? ' is-studio-hidden' : ''}`}
            style={style}
            {...(studio ? { 'data-section': index, 'data-section-type': s.blockType } : {})}
          >
            {node}
          </div>
        );
      })}
    </>
  );
}

type P<T extends Section['blockType']> = { s: Of<T>; ctx: Ctx; id?: string; hid: string; chapter?: number };

function HeroSection({ s, ctx, id, hid, first = true }: P<'hero'> & { first?: boolean }) {
  // the page's h1 only when the hero opens the page; otherwise the page already has one
  const Title = first ? 'h1' : 'h2';
  const clients = s.clients ?? [];
  const cards = projectsOf(s.projects);
  const trusted = s.trustedText == null ? COPY.trustedText : s.trustedText.trim();
  const button = linkOf(s.button, ctx.cta);
  return (
    <section className="hero" id={id} aria-labelledby={hid}>
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-inner">
        {!!clients.length && trusted && <p className="hero-proof intro">{trusted.replace('{count}', String(clients.length))}</p>}
        <Title className="hero-title" id={hid}><LivingTitle text={s.headline} /></Title>
        {/* stickers: what you do and where you are, straight from Site settings (availability
            already has its own floating chip, so it isn't repeated here) */}
        {(ctx.site.role || ctx.site.location) && (
          <ul className="hero-stickers intro" style={{ '--d': '.9s' } as React.CSSProperties} aria-label="At a glance">
            {ctx.site.role && <li className="sticker is-role"><Icon name="spark" size={12} />{ctx.site.role}</li>}
            {ctx.site.location && <li className="sticker is-place"><Icon name="compass" size={14} />Based in {ctx.site.location}</li>}
          </ul>
        )}
        {s.intro && <p className="hero-intro intro" style={{ '--d': '.3s' } as React.CSSProperties}>{s.intro}</p>}
        <div className="intro" style={{ '--d': '.4s' } as React.CSSProperties}>
          <div className="hero-cta">
            {s.ctaText && <span>{s.ctaText}</span>}
            <SmartLink className={`${btn(button.variant, 'btn-light')} btn-sm`} href={button.url}>{button.label}</SmartLink>
          </div>
        </div>
        {/* the work comes straight after the pitch, so it's on the first screen */}
        <div className="hero-work">
          <HeroCards projects={(cards.length ? cards : ctx.featured).slice(0, 3)} />
        </div>
        {!!clients.length && (
          <div className="partners intro" style={{ '--d': '.5s', '--intro-y': '0px' } as React.CSSProperties}>
          {copy(s.clientsLabel, COPY.clientsLabel) && <p className="partners-label">{copy(s.clientsLabel, COPY.clientsLabel)}</p>}
          <div className="marquee-row">
          <div className="marquee">
            {/* Repeated so the loop is seamless; only the first copy is read out. */}
            <ul className="marquee-track" aria-label="Clients">
              {[...clients, ...clients, ...clients, ...clients].map((c, i) => {
                const repeat = i >= clients.length;
                const name = <><Icon name="spark" size={12} />{c.name}</>;
                return (
                  <li key={`${c.id}-${i}`} aria-hidden={repeat || undefined}>
                    {c.url ? <a href={c.url} target="_blank" rel="noopener noreferrer" tabIndex={repeat ? -1 : undefined}>{name}</a> : name}
                  </li>
                );
              })}
            </ul>
          </div>
            <MarqueeToggle />
          </div>
          </div>
        )}
      </div>
    </section>
  );
}

function WorkShowcaseSection({ s, ctx, id, hid, chapter }: P<'workShowcase'>) {
  const picked = projectsOf(s.projects);
  const work = picked.length ? picked : ctx.featured;
  const link = s.link?.label && s.link?.url ? { label: s.link.label, url: s.link.url } : null;
  const heading = copy(s.heading, COPY.workHeading);
  if (s.layout === 'carousel') {
    const wall = [...(s.extraImages ?? []).map(asMedia), ...ctx.covers].filter((m): m is Media => !!m);
    return (
      <section className="work dark" id={id} {...labelled(heading, hid, 'Selected work')}>
        {s.showWall === true && <TiltGallery images={wall} />}
        <div className={`wrap section-intro${s.showWall === true ? '' : ' no-wall'}`}>
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <ScrollWords className="h-lg" id={hid} text={plain(heading)} />}
          {s.intro && <Reveal><p className="lede">{s.intro}</p></Reveal>}
        </div>
        <CoverFlow projects={work} />
        {link && <div className="center"><Link className="link-arrow" href={link.url}>{link.label} <Icon name="arrow" size={15} /></Link></div>}
      </section>
    );
  }
  return (
    <section className="work work-cases" id={id} {...labelled(heading, hid, 'Selected work')}>
      <div className="wrap">
        {/* editorial intro: label and two-line heading on the left, the link to all work on the right */}
        <Reveal className="ed-intro">
          <div>
            <Chapter n={chapter} label={s.eyebrow} />
            {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
            {s.intro && <p className="lede">{s.intro}</p>}
          </div>
          {link && <Link className="link-under" href={link.url}>{link.label} <Icon name="arrow" size={14} /></Link>}
        </Reveal>
        {/* the closing "All work" link only when the intro doesn't already link there */}
        <CaseStudies projects={work} allHref={link?.url === '/work' ? null : '/work'} />
      </div>
    </section>
  );
}

function AboutBannerSection({ s, ctx, id, hid, chapter }: P<'aboutBanner'>) {
  const first = ctx.site.name.split(/\s+/)[0];
  const link = s.link?.label && s.link?.url ? { label: s.link.label, url: s.link.url } : null;
  const cta = s.cta?.label && s.cta?.url ? { label: s.cta.label, url: s.cta.url, className: btn(s.cta.variant, 'btn-light') } : null;
  const tabs = (s.tabs ?? []).map((t) => ({ label: t.label, heading: t.heading, text: t.text ?? null, rows: (t.rows ?? []).map((r) => ({ value: r.value, label: r.label })) }));
  // the banner's services: the picked ones (published only), or every published one when none are picked
  const picked = (s.services ?? []).filter((x): x is Exclude<typeof x, number> => typeof x === 'object' && !!x && x._status !== 'draft');
  if (s.layout === 'portrait') {
    // the site tagline rides along as the last sticker, so it shows up here as on the hero
    const tagline = ctx.site.tagline?.trim();
    const stickers = [...(s.stickers ?? []).filter(Boolean), ...(tagline ? [tagline] : [])].slice(0, 3);
    return (
      <AboutPortrait
        id={id}
        headingId={hid}
        chapter={<Chapter n={chapter} label={s.eyebrow} />}
        heading={<Accent text={s.heading} />}
        intro={s.intro}
        photo={s.photo}
        moodPhoto={s.moodPhoto}
        stickers={stickers}
        caption={s.caption}
        link={link}
        name={text(s.bigName, first).toUpperCase()}
        // the same tabs as the editorial layout; without tabs, the stats alone (the heading and
        // intro are already above the folder)
        tabs={tabs.length ? tabs : s.stats?.length ? [{ label: 'Overview', heading: 'In numbers', text: null, rows: s.stats.map((r) => ({ value: r.value, label: r.label })) }] : []}
      />
    );
  }
  if (s.layout !== 'banner') {
    // the headline sits beside the print, the folder below; no tabs yet: the stats alone
    const stats = (s.stats ?? []).map((r) => ({ value: r.value, label: r.label }));
    const panels = tabs.length ? tabs : stats.length ? [{ label: 'Overview', heading: 'In numbers', text: null, rows: stats }] : [];
    return (
      <AboutEditorial
        id={id}
        headingId={hid}
        chapter={<Chapter n={chapter} label={s.eyebrow} />}
        name={text(s.bigName, first).toUpperCase()}
        role={s.role}
        photo={s.photo}
        tabs={panels}
        watermark={text(s.bigName, first).toUpperCase()}
        heading={s.heading ? <Accent text={s.heading} /> : null}
        intro={s.intro}
        link={link}
      />
    );
  }
  return (
    <AboutBanner
      id={id}
      headingId={hid}
      chapter={chapter ? <Chapter n={chapter} label={s.eyebrow} /> : s.eyebrow ? <p className="eyebrow">{s.eyebrow}</p> : null}
      greeting={copy(s.greeting, COPY.aboutGreeting)}
      name={first}
      bigName={text(s.bigName, first)}
      headline={s.heading}
      photo={s.photo}
      intro={s.intro ?? ''}
      expertise={s.expertise ?? []}
      servicesHeading={copy(s.servicesHeading, COPY.aboutServicesHeading)}
      services={(picked.length ? picked : ctx.services).map((x) => ({ title: x.title, description: x.description ?? null, slug: x.slug ?? null }))}
      stats={s.stats ?? []}
      cta={cta}
      link={link}
    />
  );
}

function ProcessSection({ s, ctx, id, hid, chapter }: P<'process'>) {
  const steps = orDefault(s.steps, DEFAULT_PROCESS).map((step, i) => ({
    ...step,
    image: asMedia((step as { image?: unknown }).image) ?? ctx.covers[(i + 1) % Math.max(ctx.covers.length, 1)] ?? null,
  }));
  const heading = copy(s.heading, COPY.processHeading);
  // the numbered timeline ('circuit' is the stored value: it predates the redesign)
  if (s.layout !== 'steps' && s.layout !== 'stack') {
    return (
      <section className="process process-tl" id={id} {...labelled(heading, hid, 'How it works')}>
        <div className="wrap tl-grid">
          <Reveal className="tl-intro">
            <Chapter n={chapter} label={s.eyebrow} />
            {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
            {s.lead && <p className="lede">{s.lead}</p>}
            {!ctx.contact && <Link className="btn btn-light" href={ctx.cta.url}>{ctx.cta.label} <Icon name="arrow" size={15} /></Link>}
          </Reveal>
          <ol className="tl-steps">
            {steps.map((step, i) => {
              const duration = (step as { duration?: string | null }).duration;
              return (
                <li key={(step as { id?: string }).id ?? i} className="tl-step">
                  <span className="tl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="tl-head">
                      <h3 className="tl-title"><span className="sr-only">Step {i + 1}: </span>{step.title}</h3>
                      {duration && <span className="tl-time"><span className="sr-only">Takes </span>{duration}</span>}
                    </div>
                    {step.description && <p className="tl-desc">{step.description}</p>}
                    {!!step.points?.length && <ul className="tl-points">{step.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    );
  }
  return (
    <section className={`process dark${s.layout === 'stack' ? '' : ' process-steps'}`} id={id} {...labelled(heading, hid, 'How it works')}>
      <div className="wrap">
        <Reveal className="section-intro">
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
          {s.lead && <p className="lede process-lead">{s.lead}</p>}
        </Reveal>
        {s.layout === 'stack' ? (
          <StackCards steps={steps} ctaLabel={ctx.cta.label} ctaUrl={ctx.cta.url} />
        ) : (
          <>
            <ol className="steps">
              {steps.map((step, i) => (
                <li key={(step as { id?: string }).id ?? i} className="step">
                  <Reveal delay={i * 0.1} y={16}>
                    <span className="step-node" aria-hidden="true"><Icon name={((step as { icon?: string }).icon as IconName) || STEP_ICONS[i % 4]} size={22} /></span>
                    <p className="step-num">Step {String(i + 1).padStart(2, '0')}</p>
                    <h3 className="step-title">{step.title}</h3>
                    {step.description && <p className="step-desc">{step.description}</p>}
                    {!!step.points?.length && <ul className="step-points">{step.points.map((pt) => <li key={pt}><Icon name="check" size={14} />{pt}</li>)}</ul>}
                  </Reveal>
                </li>
              ))}
            </ol>
            {!ctx.contact && <div className="center steps-cta"><Link className="btn btn-light" href={ctx.cta.url}>{ctx.cta.label} <Icon name="arrow" size={15} /></Link></div>}
          </>
        )}
      </div>
    </section>
  );
}
const STEP_ICONS: IconName[] = ['compass', 'pen', 'chat', 'rocket'];

function ServicesSection({ s, ctx, id, hid, chapter }: P<'services'>) {
  const items = serviceList(s, ctx.services);
  if (!items.length) return null;
  const heading = copy(s.heading, COPY.servicesHeading);
  if (s.layout !== 'cards') {
    return (
      <section className="services-deck dark" id={id} {...labelled(heading, hid, 'Services')}>
        <div className="wrap services-deck-inner">
          <Reveal className="services-deck-intro">
            <Chapter n={chapter} label={s.eyebrow} />
            {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
            {s.intro && <p className="lede">{s.intro}</p>}
            <p className="deck-hint">{text(s.labels?.deckHint, 'Pick a card to see what’s included.')}</p>
            {!ctx.contact && <Link className="btn btn-outline" href={ctx.cta.url}>{ctx.cta.label} <Icon name="arrow" size={15} /></Link>}
          </Reveal>
          <ServiceDeck services={items.map((x) => ({ title: x.title, description: x.description ?? null, deliverables: x.deliverables ?? null, slug: x.slug ?? null, image: asMedia(x.image) ?? null }))} ctaLabel={text(s.ctaLabel, 'Inquire for this service')} pageLabel={text(s.pageLinkLabel, 'See the service')} />
        </div>
      </section>
    );
  }
  // productised cards: real work on top, a one-line promise, "What you get", then the extras
  const extras = (s.extras ?? []).filter(Boolean);
  return (
    <section className="svc" id={id} {...labelled(heading, hid, 'Services')}>
      <div className="wrap">
        <Reveal className="ed-intro">
          <div>
            <Chapter n={chapter} label={s.eyebrow} />
            {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
            {s.intro && <p className="lede">{s.intro}</p>}
          </div>
        </Reveal>
        <ServiceRow
          items={items.map((item, i) => ({
            key: String(item.id ?? i), title: item.title, description: item.description, deliverables: item.deliverables, slug: item.slug, featured: item.featured,
            price: item.priceFrom != null ? price(item.priceFrom, item.currency) : null, unit: item.unit, image: asMedia(item.image) ?? null,
          }))}
          labels={{ featured: text(s.labels?.featured, 'Featured'), pageLink: text(s.pageLinkLabel, 'See the service'), inquire: text(s.ctaLabel, 'Inquire for this service') }}
        />
        {(!!extras.length || !ctx.contact) && <div className="svc-foot">
          {!!extras.length && (
            <div className="svc-extras">
              <p className="ed-kicker">{text(s.labels?.extras, 'A little extra')}</p>
              <ul>{extras.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
          {!ctx.contact && (
            <div className="svc-actions">
              <Link className="btn btn-light" href={ctx.cta.url}>{ctx.cta.label} <Icon name="arrow" size={15} /></Link>
              {s.showWhatsApp !== false && ctx.whatsapp && <a className="link-under" href={ctx.whatsapp} target="_blank" rel="noopener noreferrer">Or chat on WhatsApp</a>}
            </div>
          )}
        </div>}
      </div>
    </section>
  );
}

function TestimonialsSection({ s, ctx, id, hid, chapter }: P<'testimonials'>) {
  const items = s.items ?? [];
  if (!items.length && !ctx.studio) return null;
  const heading = copy(s.heading, COPY.testimonialsHeading);
  return (
    <section className="reviews dark" id={id} {...labelled(heading, hid, 'Testimonials')}>
      <div className="wrap">
        <Reveal className="section-intro">
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
        </Reveal>
        {!items.length ? (
          <p className="studio-empty">Add three or four client quotes in this section’s Content tab. It stays hidden on the live site until there is at least one.</p>
        ) : (
          <ScrollRow label="Client testimonials" className="quotes">
            {items.map((t, i) => {
              const logo = asMedia(t.logo);
              return (
                <li key={t.id ?? i} className="quote-card">
                  <figure>
                    {t.rating != null && t.rating > 0 && <p className="stars" role="img" aria-label={`${Math.min(5, Math.round(t.rating))} out of 5`}>{Array.from({ length: Math.min(5, Math.round(t.rating)) }, (_, k) => <Icon key={k} name="star" size={14} />)}</p>}
                    <blockquote>
                      {t.highlight && <p className="quote-key">&ldquo;{t.highlight}&rdquo;</p>}
                      <p className="quote-body">{t.highlight ? t.quote : <>&ldquo;{t.quote}&rdquo;</>}</p>
                    </blockquote>
                    <figcaption>
                      <span className="review-photo">{asMedia(t.photo) ? <Img media={t.photo} sizes="44px" /> : initials(t.name)}</span>
                      <span className="quote-who"><b>{t.name}</b>{(t.title || t.company) && <small>{[t.title, t.company].filter(Boolean).join(', ')}</small>}</span>
                      {logo && <span className="quote-logo"><Img media={logo} sizes="96px" fill={false} /></span>}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ScrollRow>
        )}
      </div>
    </section>
  );
}

function ContactSection({ s, ctx, id, hid, chapter }: P<'contact'>) {
  const { site } = ctx;
  const heading = copy(s.heading, COPY.contactHeading);
  const roles = ctx.audience ? [] : s.roles ?? [];
  return (
    <section className="contact-section contact-split" id={id} {...labelled(heading, hid, 'Contact')}>
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap contact-grid">
        {/* the pitch on the left (stays in view beside the form on wider screens), the form on the right */}
        <Reveal className="contact-copy">
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
          {s.intro && <p className="lede">{s.intro}</p>}
          {!!roles.length && (
            <div className="contact-roles">
              {s.rolesLead && <p>{s.rolesLead}</p>}
              <ul aria-label="Who it’s for">{roles.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          )}
          {s.showAvailability !== false && site.availability && <p className="status"><span className="dot" aria-hidden="true" />{site.availability}</p>}
          {site.bookingUrl && (
            <a className="btn btn-light contact-book" href={site.bookingUrl} target="_blank" rel="noopener noreferrer">
              <Icon name="calendar" size={18} /> {text(s.bookLabel, 'Book a 15-minute call')}
            </a>
          )}
        </Reveal>
        <Reveal className="contact-card" delay={0.1}>
          <ContactForm services={ctx.serviceTitles} bookingUrl={site.bookingUrl} chatUrl={ctx.whatsapp} copy={s.form ?? {}} />
        </Reveal>
      </div>
    </section>
  );
}
/** "https://www.instagram.com/kapturedcreatives" → "@kapturedcreatives" */

/**
 * The numbered label that opens each chapter of a page (“02 — The process”), with a thin
 * line reaching up to the section before, so the page reads as one continuous story.
 */
function Chapter({ n, label }: { n?: number; label?: string | null }) {
  if (!n) return label ? <p className="eyebrow">{label}</p> : null;
  return <p className="chapter"><span className="chapter-num">{String(n).padStart(2, '0')}</span>{label && <span className="chapter-label">{label}</span>}</p>;
}

function ProjectGridSection({ s, ctx, id, first }: { s: Of<'projectGrid'>; ctx: Ctx; id?: string; first: boolean }) {
  const projects = s.onlyFeatured ? ctx.featured : ctx.all;
  const Heading = first ? 'h1' : 'h2';
  // cards sit one level under the section heading, so the outline never skips a level
  const level = first ? 2 : 3;
  return (
    <section className="page-head-section" id={id}>
      <div className="wrap">
        <header className="page-head">
          {s.heading ? <Heading className="h-xl"><Accent text={s.heading} /></Heading> : first && <h1 className="sr-only">Work</h1>}
          {s.intro && <p className="lede">{s.intro}</p>}
        </header>
        {projects.length ? (
          s.showFilters !== false ? (
            <WorkGrid
              studio={ctx.site.name}
              items={projects.map((p, i) => ({
                disciplines: p.disciplines ?? [],
                node: <ProjectCard project={p} level={level} sizes="(max-width: 800px) 100vw, 600px" preload={i < 2} />,
                proof: { title: p.title, slug: p.slug, client: p.client, year: p.year, cover: p.cover, featured: p.featured },
              }))}
            />
          ) : (
            <div className="grid-work">{projects.map((p, i) => <div key={p.id} className="grid-cell"><ProjectCard project={p} level={level} sizes="(max-width: 800px) 100vw, 600px" preload={i < 2} /></div>)}</div>
          )
        ) : (
          <p className="muted">No projects published yet.</p>
        )}
      </div>
    </section>
  );
}

function RichTextSection({ s, id, hid }: Omit<P<'richText'>, 'ctx'>) {
  return (
    <section className={`text-section dark${s.align === 'center' ? ' center' : ''}`} id={id} aria-labelledby={s.heading ? hid : undefined}>
      <Reveal className="wrap text-inner">
        {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
        {s.heading && <h2 className="h-lg" id={hid}><Accent text={s.heading} /></h2>}
        {s.body && <RichText data={s.body} className="prose" />}
      </Reveal>
    </section>
  );
}

function MediaSection({ s, id }: { s: Of<'mediaSection'>; id?: string }) {
  if (!asMedia(s.media)) return null;
  const full = s.width === 'full';
  return (
    <section className="media-section dark" id={id}>
      <figure className={full ? undefined : 'wrap'}>
        <GrowMedia media={s.media} full={full} />
        {s.caption && <figcaption className={full ? 'wrap' : undefined}>{s.caption}</figcaption>}
      </figure>
    </section>
  );
}

function CtaSection({ s, ctx, id, hid }: P<'ctaBanner'>) {
  const button = linkOf(s.button, ctx.cta);
  return (
    <section className="cta-section dark" id={id} aria-labelledby={hid}>
      <div className="wrap">
        <Reveal className="cta-card">
          <div className="cta-glow" aria-hidden="true" />
          <h2 className="h-lg" id={hid}><Accent text={s.heading} /></h2>
          {s.text && <p className="lede">{s.text}</p>}
          <SmartLink className={btn(button.variant, 'btn-light')} href={button.url}>{button.label} <Icon name="arrow" size={15} /></SmartLink>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection({ s, id, hid }: Omit<P<'faq'>, 'ctx'>) {
  const items = s.items ?? [];
  if (!items.length) return null;
  return (
    <section className="faq-section dark" id={id} {...labelled(s.heading?.trim() ?? '', hid, 'Questions')}>
      <div className="wrap faq">
        <Reveal className="faq-head">
          {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
          {s.heading && <h2 className="h-lg" id={hid}><Accent text={s.heading} /></h2>}
        </Reveal>
        <div className="faq-list">
          {items.map((q, i) => (
            <Reveal key={q.id ?? i} delay={i * 0.05}>
              <details className="faq-item">
                <summary>{q.question}<span aria-hidden="true" /></summary>
                <p>{q.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── tools, showreel, insights ── */

// A short mark for well-known tools (the way their app icons abbreviate them); others use their initials.
const TOOL_MARKS: Record<string, string> = {
  photoshop: 'Ps', illustrator: 'Ai', indesign: 'Id', 'after effects': 'Ae', 'premiere pro': 'Pr', premiere: 'Pr', lightroom: 'Lr', xd: 'Xd',
  figma: 'Fi', blender: 'Bl', canva: 'Ca', procreate: 'Pc', 'cinema 4d': 'C4', 'davinci resolve': 'Dv', framer: 'Fr', webflow: 'Wf', notion: 'No',
};
const markOf = (name: string) => {
  const known = TOOL_MARKS[name.toLowerCase().replace(/^adobe\s+/, '')];
  if (known) return known;
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).replace(/^./, (c) => c.toUpperCase());
};

async function ToolsSection({ s, id, hid, chapter }: P<'tools'>) {
  const used = await getTools();
  // tools typed under "Also show" join the list once, after the ones projects used
  const seen = new Set(used.map((t) => t.name.toLowerCase()));
  const extra = (s.extra ?? []).map((t) => t.trim()).filter((t) => t && !seen.has(t.toLowerCase())).map((name) => ({ name, n: 0 }));
  const tools = [...used, ...extra];
  if (!tools.length) return null;
  const heading = s.heading?.trim() ?? '';
  return (
    <section className="tools-section dark" id={id} {...labelled(heading, hid, 'Tools')}>
      <div className="wrap">
        <Reveal className="section-intro">
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
          {s.intro && <p className="lede">{s.intro}</p>}
        </Reveal>
        <ul className="tools-grid">
          {tools.map((t, i) => (
            <li key={t.name}>
              <Reveal delay={Math.min(i, 8) * 0.04} y={16} className="tool">
                <span className="tool-mark" aria-hidden="true">{markOf(t.name)}</span>
                <b>{t.name}</b>
                {s.showCounts !== false && t.n > 0 && <small>{t.n} {t.n === 1 ? 'project' : 'projects'}</small>}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShowreelSection({ s, ctx, id, hid, chapter }: P<'showreel'>) {
  const video = asMedia(s.video);
  const embed = s.link ? embedURL(s.link) : null;
  const title = s.heading?.trim() || 'Showreel';
  const item = video?.url ? { kind: 'video' as const, url: video.url, title, media: video } : embed ? { kind: 'embed' as const, url: embed, title } : null;
  if (!item) return null;
  const heading = s.heading?.trim() ?? '';
  const label = text(s.buttonLabel, 'Watch the showreel');
  return (
    <section className="reel-section dark" id={id} {...labelled(heading, hid, 'Showreel')}>
      <div className="wrap reel">
        <Reveal className="reel-intro">
          <Chapter n={chapter} label={s.eyebrow} />
          {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
          {s.text && <p className="lede">{s.text}</p>}
          <p className="reel-hint"><Icon name="play" size={14} /> {label}</p>
        </Reveal>
        <Reveal className="reel-frame" delay={0.1}>
          <Showreel item={item} poster={s.poster ?? ctx.covers[0] ?? null} label={label} />
        </Reveal>
      </div>
    </section>
  );
}

async function InsightsSection({ s, id, hid, chapter }: Omit<P<'insights'>, 'ctx'>) {
  const posts = await getPosts(Math.min(Math.max(s.count ?? 3, 1), 6));
  if (!posts.length) return null;
  const heading = s.heading?.trim() ?? '';
  const button = linkOf(s.button, { label: 'Read all insights', url: '/insights' });
  return (
    <section className="insights-section dark" id={id} {...labelled(heading, hid, 'Insights')}>
      <div className="wrap">
        <Reveal className="insights-head">
          <div>
            <Chapter n={chapter} label={s.eyebrow} />
            {heading && <h2 className="h-lg" id={hid}><Accent text={heading} /></h2>}
          </div>
          <SmartLink className={btn(button.variant, 'btn-outline')} href={button.url}>{button.label} <Icon name="arrow" size={15} /></SmartLink>
        </Reveal>
        <ul className="post-grid">
          {posts.map((p, i) => <li key={p.id}><Reveal delay={i * 0.06}><PostCard post={p} /></Reveal></li>)}
        </ul>
      </div>
    </section>
  );
}
