import type { ProjectCard } from '@/lib/cms';
import { ProjectFolder } from '@/components/ProjectFolder';
import { MoreWork } from '@/components/EditorialProject';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Selected projects as an editorial spread of project files: the first as a large file, then
 * up to four files in pairs (every second pair inset, so the grid breathes), then the rest as
 * a light row of text links. Every file opens its case study with the "file extraction"
 * transition.
 */
const FILES = 4;

export function CaseStudies({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  const [lead, ...rest] = projects;
  const files = rest.slice(0, FILES);
  const more = rest.slice(FILES);
  return (
    <div className="ed-work">
      <Reveal y={24}><ProjectFolder project={lead} size="lg" sizes="(max-width: 900px) 94vw, 1200px" /></Reveal>
      {!!files.length && (
        <ul className="ed-grid">
          {files.map((p, i) => (
            <li key={p.id}><Reveal delay={(i % 2) * 0.08} y={20}><ProjectFolder project={p} sizes="(max-width: 760px) 92vw, 600px" /></Reveal></li>
          ))}
        </ul>
      )}
      <MoreWork projects={more} />
    </div>
  );
}
