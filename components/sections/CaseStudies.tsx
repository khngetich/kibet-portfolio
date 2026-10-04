import type { ProjectCard } from '@/lib/cms';
import { GlassFolder } from '@/components/GlassFolder';
import { MoreWork } from '@/components/EditorialProject';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Selected projects as a shelf of glass folders, each with its work peeking out of the top
 * (components/GlassFolder.tsx): two to a row on wider screens, one under another on phones.
 * Every folder opens its case study with the "file extraction" transition; the rest of the
 * projects follow as a row of text links.
 */
const FILES = 4;

export function CaseStudies({ projects, allHref = '/work' }: { projects: ProjectCard[]; allHref?: string | null }) {
  if (!projects.length) return null;
  const files = projects.slice(0, FILES);
  const more = projects.slice(FILES);
  return (
    <div className="ed-work">
      <ol className="gf-shelf" data-count={files.length}>
        {files.map((p, i) => (
          <li key={p.id}>
            <Reveal y={20} delay={(i % 2) * 0.1}><GlassFolder project={p} n={i + 1} sizes="(max-width: 760px) 60vw, 340px" /></Reveal>
          </li>
        ))}
      </ol>
      <MoreWork projects={more} allHref={allHref} />
    </div>
  );
}
