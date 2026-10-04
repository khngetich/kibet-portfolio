import Link from 'next/link';
import { ViewTransition } from 'react';
import { asMedia, type ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { paletteVars } from '@/lib/paletteVars';
import { Img } from './Img';
import { Icon } from './Icon';

/**
 * A project as a frosted-glass folder with its work peeking out of the top: the cover in the
 * middle, up to two samples fanned either side, a solid back panel in the project's own colour,
 * and a glass front with a tab that carries "Project 01", the name and what it was. Pointing at
 * it lifts the sheets a little further out, as if you're about to pull one.
 *
 * The cover keeps the case study's view-transition name, so opening the folder still morphs it
 * into the case study's header image (see ProjectFolder and the `case-open` styles).
 */
export function GlassFolder({ project: p, n, sizes, level = 3 }: { project: ProjectCard; n: number; sizes: string; level?: 2 | 3 }) {
  const Name = `h${level}` as 'h2' | 'h3';
  const what = disciplineList(p.disciplines?.slice(0, 2)) || 'Case study';
  const samples = (p.samples ?? []).map((s) => asMedia(s.file)).filter((m) => !!m).slice(0, 2);
  const [left, right] = samples;
  return (
    <Link href={`/work/${p.slug}`} className="gf" style={paletteVars(p.palette)} transitionTypes={['case-open']} aria-label={`Project ${n}: ${p.title}, ${what}. View the case study`}>
      <span className="gf-back" aria-hidden="true" />
      <span className="gf-sheets" aria-hidden="true">
        {left && <span className="gf-sheet is-l"><Img media={left} sizes="(max-width: 760px) 40vw, 220px" /></span>}
        {right && <span className="gf-sheet is-r"><Img media={right} sizes="(max-width: 760px) 40vw, 220px" /></span>}
        <ViewTransition name={`case-cover-${p.slug}`} share="case-cover" default="none">
          <span className="gf-sheet is-c"><Img media={p.cover} sizes={sizes} /></span>
        </ViewTransition>
      </span>
      <span className="gf-front">
        <span className="gf-label">Project {String(n).padStart(2, '0')}{p.year && <> · {p.year}</>}</span>
        <Name className="gf-name">{p.title}</Name>
        <span className="gf-foot">
          <span className="gf-what">{what}</span>
          <span className="gf-go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
        </span>
      </span>
    </Link>
  );
}
