import type { ProjectCard as Card } from '@/lib/cms';
import { ProjectFolder } from './ProjectFolder';

/** A project in the Work grid: the same project "file" card as the homepage, full size when `large`. */
export function ProjectCard({ project, sizes, large, preload }: { project: Card; sizes: string; large?: boolean; preload?: boolean; level?: 2 | 3 }) {
  return <ProjectFolder project={project} size={large ? 'lg' : 'md'} sizes={sizes} preload={preload} />;
}
