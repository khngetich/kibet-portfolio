/**
 * One outline icon set for the Studio and the CMS. Strokes don't scale with the icon's size
 * (non-scaling-stroke), so `weight` is the rendered line width: 1.5px beside regular text,
 * 2px beside semibold. Paths are drawn centred by visual weight rather than by bounding box,
 * so arrows, chevrons and the copy glyph sit balanced inside square buttons.
 */
const PATHS = {
  up: <path d="M12 18.5V6M6.5 11.5 12 6l5.5 5.5" />,
  down: <path d="M12 5.5V18M6.5 12.5 12 18l5.5-5.5" />,
  left: <path d="M14.5 6.5 9 12l5.5 5.5" />,
  right: <path d="M9.5 6.5 15 12l-5.5 5.5" />,
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  copy: <><rect x="8.5" y="8.5" width="11" height="11" rx="2.5" /><path d="M15.5 8.5V7a2.5 2.5 0 0 0-2.5-2.5H7A2.5 2.5 0 0 0 4.5 7v6A2.5 2.5 0 0 0 7 15.5h1.5" /></>,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 11.2a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8L17.5 7M10.5 11v5M13.5 11v5" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.75" /></>,
  eyeOff: <path d="M4 4l16 16M10.1 5.7A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.4M6.6 7C4 8.7 2.5 12 2.5 12S6 18.5 12 18.5a8.6 8.6 0 0 0 4.4-1.2M10 10.1a2.75 2.75 0 0 0 3.9 3.9" />,
  external: <path d="M10 5.5H7A2.5 2.5 0 0 0 4.5 8v9A2.5 2.5 0 0 0 7 19.5h9a2.5 2.5 0 0 0 2.5-2.5v-3M13.5 4.5h6v6M19 5l-8 8" />,
  more: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="3" />,
  undo: <path d="M9.5 13.5 5 9l4.5-4.5M5.5 9H14a5 5 0 0 1 0 10h-3" />,
  redo: <path d="m14.5 13.5 4.5-4.5-4.5-4.5M18.5 9H10a5 5 0 0 0 0 10h3" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16, weight = 'regular', className }: { name: IconName; size?: number; weight?: 'regular' | 'semibold'; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"
      className={`ui-icon${className ? ` ${className}` : ''}`}
      fill="none" stroke="currentColor" strokeWidth={weight === 'semibold' ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
