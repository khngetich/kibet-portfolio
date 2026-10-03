/** A small line drawing of each section type, used as its thumbnail in the section list. */
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const shapes: Record<string, React.ReactNode> = {
  hero: <><path d="M5 7h14M7 10h10" /><rect x="8.5" y="12.5" width="7" height="2.5" rx="1.25" /><rect x="3" y="17" width="5" height="4" rx="1" /><rect x="9.5" y="17" width="5" height="4" rx="1" /><rect x="16" y="17" width="5" height="4" rx="1" /></>,
  workShowcase: <><path d="M3 9l6-3 12 4-6 3z" /><rect x="6" y="15" width="12" height="6" rx="1.5" /></>,
  aboutBanner: <><circle cx="12" cy="8" r="3" /><path d="M6 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" /><path d="M3 3h18v18H3z" /></>,
  audience: <><path d="M4 8h7M4 12h10M4 16h7" /><path d="M16 9l3 3-3 3" /></>,
  process: <><rect x="4" y="12" width="16" height="8" rx="1.5" /><path d="M6 12V9.5A1.5 1.5 0 0 1 7.5 8h9A1.5 1.5 0 0 1 18 9.5V12M8 8V6h8v2" /></>,
  services: <><rect x="3" y="5" width="7.5" height="14" rx="1.5" /><rect x="13.5" y="5" width="7.5" height="14" rx="1.5" /><path d="M5 9h3.5M15.5 9H19" /></>,
  testimonials: <><path d="M4 5h16v10H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></>,
  projectGrid: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
  profile: <><circle cx="8" cy="9" r="3" /><path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M15 7h6M15 11h6M15 15h4" /></>,
  richText: <><path d="M4 6h16M4 10h16M4 14h12M4 18h8" /></>,
  mediaSection: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" /><circle cx="15.5" cy="9" r="1.5" /></>,
  ctaBanner: <><rect x="3" y="7" width="18" height="10" rx="5" /><path d="M9 12h6M13 10l2 2-2 2" /></>,
  faq: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5v.4M12 17h.01" /></>,
  tools: <><rect x="3" y="4" width="7" height="7" rx="2" /><rect x="14" y="4" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><path d="M5.5 7.5h2M16.5 7.5h2" /></>,
  showreel: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10.5 9.5v5l4-2.5z" /></>,
  insights: <><rect x="3" y="4" width="8" height="16" rx="1.5" /><rect x="13" y="4" width="8" height="16" rx="1.5" /><path d="M5 15h4M5 17.5h3M15 15h4M15 17.5h3" /></>,
  resume: <><path d="M6 3h9l4 4v14H6z" /><path d="M14.5 3v4.5H19" /><circle cx="10" cy="10" r="1.8" /><path d="M9 14.5h7M9 17.5h5" /></>,
};

export function SectionIcon({ type, size = 22 }: { type: string; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} {...S}>{shapes[type] ?? shapes.richText}</svg>;
}
