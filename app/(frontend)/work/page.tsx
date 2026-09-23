import type { Metadata } from 'next';
import { getProjects } from '@/lib/cms';
import { ProjectCard } from '@/components/ProjectCard';
import { WorkGrid } from '@/components/WorkGrid';

export const metadata: Metadata = { title: 'Work', description: 'Social media, brand and web design projects.' };

export default async function WorkIndex() {
  const projects = await getProjects();
  return (
    <section className="page-head-section">
      <div className="wrap">
        <header className="page-head">
          <h1 className="h-xl">Work</h1>
          <p className="lede">Campaigns, identities and websites, each with a short case study on the brief, the process and what shipped.</p>
        </header>
        {projects.length ? (
          <WorkGrid
            items={projects.map((p, i) => ({
              disciplines: p.disciplines ?? [],
              node: <ProjectCard project={p} sizes="(max-width: 800px) 100vw, 600px" preload={i < 2} />,
            }))}
          />
        ) : (
          <p className="muted">No projects published yet.</p>
        )}
      </div>
    </section>
  );
}
