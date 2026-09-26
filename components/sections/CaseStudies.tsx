import type { ProjectCard } from '@/lib/cms';
import { ProjectFolder } from '@/components/ProjectFolder';
import { Reveal } from '@/components/motion/Reveal';

/**
 * Selected projects as a story rather than a grid: one large project file (with client, role
 * and outcome inside), then up to three smaller files side by side; the pattern repeats for
 * longer lists. Every file opens its case study with the "file extraction" transition.
 */
export function CaseStudies({ projects }: { projects: ProjectCard[] }) {
  if (!projects.length) return null;
  const groups: { lead: ProjectCard; rest: ProjectCard[] }[] = [];
  for (let i = 0; i < projects.length; i += 4) groups.push({ lead: projects[i], rest: projects.slice(i + 1, i + 4) });
  return (
    <div className="cases">
      {groups.map(({ lead, rest }, g) => (
        <div key={lead.id} className="cases-group">
          <Reveal y={24}><ProjectFolder project={lead} size="lg" sizes="(max-width: 900px) 94vw, 1200px" preload={g === 0} /></Reveal>
          {!!rest.length && (
            <ul className={`case-cards is-${rest.length}`}>
              {rest.map((p, i) => (
                <li key={p.id}><Reveal delay={i * 0.1} y={20}><ProjectFolder project={p} sizes="(max-width: 800px) 90vw, 30vw" /></Reveal></li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
