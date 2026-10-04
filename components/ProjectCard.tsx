import type { ProjectCard as Card } from '@/lib/cms';
import { GlassFolder } from './GlassFolder';

/** A project in the Work grid: the same glass folder as the homepage's selected projects, numbered in grid order. */
export function ProjectCard({ project, n, sizes, preload, level }: { project: Card; n: number; sizes: string; preload?: boolean; level?: 2 | 3 }) {
  return <GlassFolder project={project} n={n} sizes={sizes} preload={preload} level={level} />;
}
