import Link from 'next/link';
import type { ProjectCard } from '@/lib/cms';
import { Icon } from './Icon';

/**
 * "More work": after the featured project files, the rest of the projects as a light row of
 * underlined text links, ending with "All work". Keeps the spread short without hiding anything.
 */
export function MoreWork({ projects, allHref = '/work', label = 'More work' }: { projects: ProjectCard[]; allHref?: string | null; label?: string }) {
  if (!projects.length && !allHref) return null;
  return (
    <div className="ed-more">
      {/* with nothing more to list, it's just the way to the full archive */}
      {projects.length > 0 && <p className="ed-kicker">{label}</p>}
      <ul>
        {projects.map((p) => <li key={p.id}><Link className="link-under" href={`/work/${p.slug}`}>{p.title} <Icon name="arrow" size={13} /></Link></li>)}
        {allHref && <li><Link className="link-under" href={allHref}>All work <Icon name="arrow" size={13} /></Link></li>}
      </ul>
    </div>
  );
}
