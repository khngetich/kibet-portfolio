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
import { SampleGrid, WatchButton } from '@/components/motion/SampleViewer';
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
  const overview = [['Brief', project.brief], ['Approach', project.approach], ['Outcome', project.outcome]].filter(([, v]) => v) as [string, string][];
  const samples = toItems(project.samples ?? []);
  const details = [['Deliverables', project.deliverables], ['Tools', project.tools]].filter(([, v]) => v?.length) as [string, string[]][];
  // the live link: videos play in the viewer when they're YouTube/Vimeo, everything else opens in a new tab
  const live = project.liveUrl ? { url: project.liveUrl, type: project.liveType ?? 'website', embed: project.liveType === 'video' ? embedURL(project.liveUrl) : null } : null;
  const liveLabel = live?.type === 'video' ? 'Watch the video' : live?.type === 'post' ? 'View the live post' : 'Visit the live website';

  return (
    <article className="case" style={project.accent ? ({ '--accent': project.accent } as React.CSSProperties) : undefined}>
      <CaseArrival />
      {/* the project card's banner and dark panel morph into these two (components/ProjectFolder.tsx) */}
      <ViewTransition name={`case-cover-${slug}`} share="case-cover" default="none">
        <div className="case-hero">
          <Img media={project.cover} sizes="100vw" preload />
          <span className="case-hero-shade" aria-hidden="true" />
        </div>
      </ViewTransition>

      {/* the same cover colours as its card, so the panel keeps its colour through the morph */}
      <div className="case-sheet" style={project.palette ? { ...paletteVars(project.palette), '--accent': project.palette.accent } as React.CSSProperties : undefined}>
        <ViewTransition name={`case-sheet-${slug}`} share="case-sheet" default="none">
          <header className="case-sheet-head">
            <span className="pcard-tabrow case-tabrow" aria-hidden="true"><span className="pcard-tab" /><Slope /></span>
            <div className="wrap case-head">
              <nav className="crumb" aria-label="Breadcrumb"><Link href="/work" transitionTypes={['case-close']}>Work</Link><Icon name="right" size={12} /><span aria-current="page">{project.title}</span></nav>
              <p className="kicker">{disciplineList(project.disciplines)}</p>
              <h1 className="h-xl">{project.title}</h1>
              <p className="lede case-summary">{project.summary}</p>
              <dl className="case-meta">
                <div><dt>Client</dt><dd>{project.client}</dd></div>
                <div><dt>Year</dt><dd>{project.year}</dd></div>
                {!!project.role?.length && <div><dt>Role</dt><dd>{project.role.join(', ')}</dd></div>}
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

      {overview.length > 0 && (
        <section className="wrap case-overview" aria-label="Overview">
          {overview.map(([k, v]) => (
            <div key={k} className="reveal"><h2>{k}</h2><p>{v}</p></div>
          ))}
        </section>
      )}

      {(details.length > 0 || project.timeline) && (
        <section className="wrap case-details" aria-labelledby="case-details-title">
          <h2 id="case-details-title" className="kicker">Project details</h2>
          <div className="case-details-grid">
            {details.map(([k, v]) => (
              <div key={k}><h3>{k}</h3><ul className="case-chips">{v.map((x) => <li key={x}>{x}</li>)}</ul></div>
            ))}
            {project.timeline && <div><h3>Timeline</h3><p>{project.timeline}</p></div>}
          </div>
        </section>
      )}

      {samples.length > 0 && (
        <section className="wrap case-samples" id="samples" aria-labelledby="case-samples-title">
          <div className="case-samples-head">
            <h2 id="case-samples-title" className="h-md">Samples</h2>
            <p className="muted">{samples.length} item{samples.length === 1 ? '' : 's'} · click any to view it full size</p>
          </div>
          <SampleGrid items={samples} />
        </section>
      )}

      <RenderBlocks blocks={project.layout} />

      {project.note && <p className="wrap case-note">{project.note}</p>}

      {next && next.slug !== slug && (
        <Link className="wrap next-project" href={`/work/${next.slug}`} transitionTypes={['case-next']}>
          <div>
            <p className="kicker">Next project</p>
            <p className="h-lg">{next.title} <Icon name="arrow" size={28} /></p>
          </div>
          <div className="next-thumb"><Img media={next.cover} sizes="(max-width: 800px) 100vw, 480px" /></div>
        </Link>
      )}
      </div>
    </article>
  );
}
