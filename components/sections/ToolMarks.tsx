import type { ReactNode } from 'react';

/**
 * Small drawn marks for the tools on the résumé, in each tool's own colours. They're simplified
 * stand-ins (a lettered tile for the Adobe apps, the shapes for Figma), drawn inline so nothing
 * loads from elsewhere. Unknown tools get no mark and stay a plain chip.
 */

const tile = (bg: string, fg: string, letters: string): ReactNode => (
  <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
    <rect width="40" height="40" rx="9" fill={bg} />
    <text x="20" y="26.5" textAnchor="middle" fontFamily="var(--font), Arial, sans-serif" fontSize="17" fontWeight="700" letterSpacing="-.5" fill={fg}>{letters}</text>
  </svg>
);

const MARKS: Record<string, ReactNode> = {
  illustrator: tile('#330000', '#FF9A00', 'Ai'),
  photoshop: tile('#001E36', '#31A8FF', 'Ps'),
  indesign: tile('#49021F', '#FF3366', 'Id'),
  'premiere pro': tile('#00005B', '#9999FF', 'Pr'),
  'after effects': tile('#00005B', '#9999FF', 'Ae'),
  lightroom: tile('#001E36', '#31A8FF', 'Lr'),
  figma: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <rect width="40" height="40" rx="9" fill="#1E1E1E" />
      <path d="M15 8h5v8h-5a4 4 0 0 1 0-8z" fill="#F24E1E" />
      <path d="M20 8h5a4 4 0 0 1 0 8h-5z" fill="#FF7262" />
      <path d="M15 16h5v8h-5a4 4 0 0 1 0-8z" fill="#A259FF" />
      <circle cx="25" cy="20" r="4" fill="#1ABCFE" />
      <path d="M15 24h5v4a4 4 0 1 1-5-4z" fill="#0ACF83" />
    </svg>
  ),
  canva: (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
      <defs><linearGradient id="cv-canva" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#00C4CC" /><stop offset="1" stopColor="#7D2AE8" /></linearGradient></defs>
      <circle cx="20" cy="20" r="20" fill="url(#cv-canva)" />
      <text x="20" y="27" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="21" fill="#FFFFFF">C</text>
    </svg>
  ),
  'ms office': tile('#D83B01', '#FFFFFF', 'O'),
  'microsoft office': tile('#D83B01', '#FFFFFF', 'O'),
};

const key = (name: string) => name.toLowerCase().replace(/^adobe\s+/, '').trim();

export const toolMark = (name: string): ReactNode | null => MARKS[key(name)] ?? null;

/** A group reads as "tools" when most of its items have a mark. */
export const isToolGroup = (items: string[]) => items.length > 0 && items.filter((i) => MARKS[key(i)]).length >= items.length / 2;
