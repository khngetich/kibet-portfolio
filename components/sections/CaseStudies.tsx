import type { ProjectCard } from '@/lib/cms';
import { ProjectFolder } from '@/components/ProjectFolder';
import { MoreWork } from '@/components/EditorialProject';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Selected projects as a file drawer: each project is a full project file with its number beside
 * it, and as you scroll each file pins a little lower than the one before and slides over it, so
 * the earlier files stay visible as a stack of tabs (CSS position: sticky; no script). Phones get
 * the files one after another. Every file still opens its case study with the "file extraction"
 * transition; the rest of the projects follow as a row of text links.
 */
const FILES = 5;

export function CaseStudies({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  const files = projects.slice(0, FILES);
  const more = projects.slice(FILES);
  return (
    <div className="ed-work">
      <ol className="drawer" style={{ '--files': files.length } as React.CSSProperties}>
        {files.map((p, i) => (
          <li key={p.id} className="drawer-file" style={{ '--i': i } as React.CSSProperties}>
            <span className="drawer-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <Reveal y={20}><ProjectFolder project={p} size="lg" sizes="(max-width: 900px) 94vw, 1060px" level={3} /></Reveal>
          </li>
        ))}
      </ol>
      <MoreWork projects={more} />
    </div>
  );
}
