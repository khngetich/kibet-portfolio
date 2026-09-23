import Link from 'next/link';
import type { ProjectCard as Card } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { Img } from './Img';

export function ProjectCard({ project, sizes, large, preload }: { project: Card; sizes: string; large?: boolean; preload?: boolean }) {
  return (
    <Link href={`/work/${project.slug}`} className={`card reveal${large ? ' card-lg' : ''}`}>
      <div className="card-media">
        <Img media={project.cover} sizes={sizes} preload={preload} />
      </div>
      <div className="card-meta">
        <h3>{project.title}</h3>
        <p>{project.client} · {disciplineList(project.disciplines)}</p>
      </div>
    </Link>
  );
}
