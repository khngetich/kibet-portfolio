import Link from 'next/link';
import { ViewTransition } from 'react';
import type { ProjectCard } from '@/lib/cms';
import { disciplineList } from '@/lib/format';
import { paletteVars } from '@/lib/paletteVars';
import { Img } from './Img';
import { Icon } from './Icon';

/**
 * A project as a case-study "file" in a matte sleeve: the cover as a banner with the project
 * name, a dark folder-tab panel with the category and discipline, and results at the foot.
 *
 * The banner and the panel carry view-transition names shared with the case study page, so
 * opening one morphs the banner into the page's header image and the panel into its article
 * body (see app/(frontend)/work/[slug]/page.tsx and the `case-open` styles in sections.css).
 *
 * Colour adaptation: the panel, tab, rim and glow take the cover's own colours (lib/palette.ts),
 * so each file looks like it belongs to its work.
 */
export function ProjectFolder({ project: p, size = 'md', sizes, preload }: { project: ProjectCard; size?: 'md' | 'lg'; sizes: string; preload?: boolean }) {
  // the tab holds one category; everything else goes on the discipline line under it
  const category = disciplineList(p.disciplines?.slice(0, 1)) || 'Case study';
  const tagline = taglineOf(p, category);
  const [first, second] = p.stats ?? [];

  return (
    <Link href={`/work/${p.slug}`} className={`pcard pcard-${size}`} style={paletteVars(p.palette)} transitionTypes={['case-open']} aria-label={`${p.title}: ${category}${p.client && p.client !== p.title ? `, for ${p.client}` : ''}. View the case study`}>
      <ViewTransition name={`case-cover-${p.slug}`} share="case-cover" default="none">
        <span className="pcard-banner">
          <Img media={p.cover} sizes={sizes} preload={preload} />
          <span className="pcard-name">{p.title}</span>
        </span>
      </ViewTransition>
      <ViewTransition name={`case-sheet-${p.slug}`} share="case-sheet" default="none">
        <span className="pcard-body">
          {/* the folder tab holds the category; the panel below carries the discipline line */}
          <span className="pcard-tabrow"><span className="pcard-tab"><span className="pcard-title">{category}</span></span><Slope /></span>
          <span className="pcard-panel">
            {tagline && <span className="pcard-tagline">{tagline}</span>}
            {size === 'lg' && (
              <span className="pcard-detail">
                {p.summary && <span className="pcard-summary">{p.summary}</span>}
                <span className="pcard-facts">
                  {p.client && <span><small>Client</small>{p.client}</span>}
                  {!!p.role?.length && <span><small>Role</small>{p.role.join(', ')}</span>}
                  {p.outcome && <span><small>Outcome</small>{p.outcome}</span>}
                </span>
              </span>
            )}
            <span className="pcard-foot">
              {first ? <span className="pcard-stat"><b>{first.value}</b>{first.label}</span> : <span className="pcard-stat"><b>{p.year}</b></span>}
              {second ? <span className="pcard-stat-r"><b>{second.value}</b> {second.label}</span> : <span className="pcard-open">View case study <Icon name="arrow" size={15} /></span>}
            </span>
          </span>
        </span>
      </ViewTransition>
    </Link>
  );
}

/** Roles that add something beyond the category, joined as a readable line. */
function taglineOf(p: ProjectCard, category: string) {
  const cat = category.toLowerCase();
  const roles = (p.role ?? []).filter((r) => !cat.includes(r.toLowerCase()) && !r.toLowerCase().includes(cat));
  return roles.slice(0, 3).join(' & ') || null;
}

/** The folder tab's curved step down from the tab to the panel (drawn in the panel colour). */
export function Slope() {
  return (
    <svg className="pcard-slope" viewBox="0 0 64 56" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 0h6c10 0 15 4 21 13l12 19c6 9 11 13 21 14.5h4V56H0z" />
    </svg>
  );
}
