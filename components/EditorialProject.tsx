import Link from 'next/link';
import type { ProjectCard } from '@/lib/cms';
import { Icon } from './Icon';

/**
 * "More work": after the featured project files, the rest of the projects as a light row of
 * underlined text links, ending with "All work". Keeps the spread short without hiding anything.
 */
export function MoreWork({ projects, allHref = '/work', label = 'More work' }: { projects: ProjectCard[]; allHref?: string; label?: string }) {
  return (
    <div className="ed-more">
      <p className="ed-kicker">{label}</p>
      <ul>
        {projects.map((p) => <li key={p.id}><Link className="link-under" href={`/work/${p.slug}`}>{p.title} <Icon name="arrow" size={13} /></Link></li>)}
        <li><Link className="link-under" href={allHref}>All work <Icon name="arrow" size={13} /></Link></li>
      </ul>
    </div>
  );
}
