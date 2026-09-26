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

      <div className="case-sheet">
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
                {project.stats?.map((st) => <div key={st.id ?? st.label}><dt>{st.label}</dt><dd>{st.value}</dd></div>)}
                {project.liveUrl && <div><dt>Live</dt><dd><a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Visit <Icon name="external" size={13} /></a></dd></div>}
              </dl>
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
