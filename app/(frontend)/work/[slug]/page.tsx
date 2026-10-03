import { paletteVars } from '@/lib/paletteVars';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ViewTransition } from 'react';
import { notFound } from 'next/navigation';
import { asMedia, getProject, getProjects, getProjectSlugs } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { RenderBlocks } from '@/components/RenderBlocks';
import { Slope } from '@/components/ProjectFolder';
import { CaseArrival } from '@/components/motion/CaseArrival';
import { SampleGrid, ViewerButton, WatchButton } from '@/components/motion/SampleViewer';
import { embedURL, toItems } from '@/lib/media';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  const og = asMedia(project.ogImage) ?? asMedia(project.cover);
  const description = project.metaDescription || project.summary;
  return {
    title: project.metaTitle || project.title,
    description,
    openGraph: { title: project.metaTitle || project.title, description, images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined, alt: og.alt }] : undefined },
  };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getProjects();
  const i = all.findIndex((p) => p.slug === slug);
  const next = all.length > 1 ? all[(i + 1) % all.length] : null;
  const samples = toItems(project.samples ?? []);
  // the lead image's "+" opens the cover first, then the samples
  const lead = toItems([{ file: project.cover, title: project.title }, ...(project.samples ?? [])]);
  const details = [['Deliverables', project.deliverables], ['Tools', project.tools]].filter(([, v]) => v?.length) as [string, string[]][];
  // the story panel: brief, approach and outcome, with the details as the fourth quarter
  const story = [['The brief', project.brief], ['The approach', project.approach], ['The outcome', project.outcome]].filter(([, v]) => v) as [string, string][];
  const hasDetails = details.length > 0 || !!project.timeline;
  // the live link: videos play in the viewer when they're YouTube/Vimeo, everything else opens in a new tab
  const live = project.liveUrl ? { url: project.liveUrl, type: project.liveType ?? 'website', embed: project.liveType === 'video' ? embedURL(project.liveUrl) : null } : null;
  const liveLabel = live?.type === 'video' ? 'Watch the video' : live?.type === 'post' ? 'View the live post' : 'Visit the live website';
  const number = String((i < 0 ? 0 : i) + 1).padStart(2, '0');

  return (
    <article className="case" style={project.accent ? ({ '--accent': project.accent } as React.CSSProperties) : undefined}>
      <CaseArrival />
      {/* the project card's banner and dark panel morph into these two (components/ProjectFolder.tsx) */}
      <ViewTransition name={`case-cover-${slug}`} share="case-cover" default="none">
        <div className="case-hero">
          <Img media={project.cover} sizes="100vw" preload />
          <span className="case-hero-shade" aria-hidden="true" />
          <ViewerButton items={lead} className="case-zoom" label={`View ${project.title} full size`}><Icon name="plus" size={20} /></ViewerButton>
        </div>
      </ViewTransition>

      {/* the same cover colours as its card, so the panel keeps its colour through the morph */}
      <div className="case-sheet band-dark" style={project.palette ? { ...paletteVars(project.palette), '--accent': project.palette.accent } as React.CSSProperties : undefined}>
        <ViewTransition name={`case-sheet-${slug}`} share="case-sheet" default="none">
          <header className="case-sheet-head">
            <span className="pcard-tabrow case-tabrow" aria-hidden="true"><span className="pcard-tab" /><Slope /></span>
            <div className="wrap case-head">
              <Link className="case-back" href="/work" transitionTypes={['case-close']}><Icon name="left" size={14} /> Back to work</Link>
              <div className="case-title-row">
                <div>
                  <p className="eyebrow">{disciplineList(project.disciplines)}</p>
                  <h1 className="h-xl case-title">{project.title}<span className="case-dot" aria-hidden="true">.</span></h1>
                </div>
                <p className="case-no" aria-label={`Project ${number} of ${all.length}`}>{number}</p>
              </div>
              <p className="lede case-summary">{project.summary}</p>
              {!!project.role?.length && <ul className="case-tags" aria-label="Role">{project.role.map((r) => <li key={r}>{r}</li>)}</ul>}
              <dl className="case-meta">
                <div><dt>Client</dt><dd>{project.client}</dd></div>
                <div><dt>Year</dt><dd>{project.year}</dd></div>
                {project.timeline && <div><dt>Timeline</dt><dd>{project.timeline}</dd></div>}
                {project.stats?.map((st) => <div key={st.id ?? st.label}><dt>{st.label}</dt><dd>{st.value}</dd></div>)}
              </dl>
              <div className="case-actions">
                {live && (live.embed
                  ? <WatchButton embed={live.embed} title={project.title}><Icon name="right" size={15} /> {liveLabel}</WatchButton>
                  : <a className="btn btn-light" href={live.url} target="_blank" rel="noopener noreferrer">{liveLabel} <Icon name="external" size={15} /></a>)}
                {samples.length > 0 && <a className="btn btn-outline" href="#samples">See {samples.length} sample{samples.length === 1 ? '' : 's'}</a>}
                <Link className="btn btn-ghost" href="/#contact">Start a similar project <Icon name="arrow" size={15} /></Link>
              </div>
            </div>
          </header>
        </ViewTransition>

      {project.contribution && (
        <section className="wrap case-contribution" aria-labelledby="case-contribution-title">
          <h2 id="case-contribution-title" className="ed-kicker">My contribution</h2>
          <p className="reveal">{project.contribution}</p>
        </section>
      )}

      {(story.length > 0 || hasDetails) && (
        <section className="wrap case-story" aria-label="The story">
          {story.map(([k, v]) => (
            <div key={k} className="case-story-cell reveal"><h2>{k}</h2><p>{v}</p></div>
          ))}
          {hasDetails && (
            <div className="case-story-cell is-details reveal">
              <h2>The details</h2>
              {details.map(([k, v]) => (
                <div key={k}><h3>{k}</h3><ul className="case-chips">{v.map((x) => <li key={x}>{x}</li>)}</ul></div>
              ))}
              {project.timeline && <div><h3>Timeline</h3><p>{project.timeline}</p></div>}
            </div>
          )}
        </section>
      )}

      {samples.length > 0 && (
        <section className="wrap case-samples" id="samples" aria-labelledby="case-samples-title">
          <div className="case-samples-head">
            <div>
              <p className="ed-kicker">Samples</p>
              <h2 id="case-samples-title" className="h-md">The work, up close</h2>
            </div>
            <ViewerButton items={samples} className="btn btn-outline btn-sm">Explore all ({samples.length}) <Icon name="arrow" size={14} /></ViewerButton>
          </div>
          <SampleGrid items={samples} />
        </section>
      )}

      <RenderBlocks blocks={project.layout} />

      {project.note && <p className="wrap case-note">{project.note}</p>}
      </div>

      {/* up next: a band in the next project's own cover colour */}
      {next && next.slug !== slug && (
        <Link className="case-next band-dark" href={`/work/${next.slug}`} transitionTypes={['case-next']} style={paletteVars(next.palette)}>
          <span className="wrap case-next-in">
            <span className="case-next-text">
              <span className="ed-kicker">Up next</span>
              <span className="h-lg case-next-title">{next.title}<span className="case-dot" aria-hidden="true">.</span></span>
              <span className="case-next-sub">{disciplineList(next.disciplines)} <Icon name="arrow" size={18} /></span>
            </span>
            <span className="case-next-thumb"><Img media={next.cover} sizes="(max-width: 800px) 100vw, 480px" /></span>
          </span>
        </Link>
      )}
    </article>
  );
}
