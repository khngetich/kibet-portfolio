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
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  check: <path d="m5.5 12.5 4 4 9-9.5" />,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7.5 7.5 5.5 7.5-5.5" /></>,
  archive: <><rect x="3.5" y="4.5" width="17" height="4.5" rx="1.5" /><path d="M5 9v8.5A2 2 0 0 0 7 19.5h10a2 2 0 0 0 2-2V9M10 13h4" /></>,
  inbox: <><path d="M4 13.5 6.5 5.5h11l2.5 8v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M4 13.5h4.5l1 2h5l1-2H20" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="m4 16 4.5-4.5 4 4 2.5-2.5 5 5" /><circle cx="15.5" cy="9" r="1.5" /></>,
  file: <><path d="M6.5 3.5h7l4 4v13h-11z" /><path d="M13.5 3.5v4h4M9.5 12.5h5M9.5 16h5" /></>,
  folder: <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  refresh: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4" />,
  pen: <path d="m4.5 19.5 4-1 10.5-10.5-3-3L5.5 15.5zM14 7l3 3" />,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.4 3.5 5.2 3.5 8.5s-1 6.1-3.5 8.5c-2.5-2.4-3.5-5.2-3.5-8.5s1-6.1 3.5-8.5Z" /></>,
  bolt: <path d="M13 3.5 5.5 13.5H12l-1 7 7.5-10H12z" />,
  sun: <><circle cx="12" cy="12" r="3.75" /><path d="M12 3v1.75M12 19.25V21M5.64 5.64l1.24 1.24M17.12 17.12l1.24 1.24M3 12h1.75M19.25 12H21M5.64 18.36l1.24-1.24M17.12 6.88l1.24-1.24" /></>,
  moon: <path d="M19.5 14.6A7.5 7.5 0 0 1 9.4 4.5a7.5 7.5 0 1 0 10.1 10.1Z" />,
  // CMS sections: one recognisable picture per area, drawn as one family (24-unit grid, shapes
  // kept inside 3.5–20.5, rounded joins), so the sidebar reads as a single set
  dashboard: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  fileText: <><path d="M13.5 3.5h-6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-10z" /><path d="M13.5 3.5v5h5M9 13h6M9 16.5h4" /></>,
  briefcase: <><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 12.5h17" /></>,
  box: <><path d="M12 3.5l7.5 4.25v8.5L12 20.5l-7.5-4.25v-8.5z" /><path d="M4.5 7.75 12 12l7.5-4.25M12 12v8.5" /></>,
  bookOpen: <path d="M12 7c-1.7-1.6-4-2.5-7-2.5H3.5V18H5c3 0 5.3.9 7 2.5 1.7-1.6 4-2.5 7-2.5h1.5V4.5H19c-3 0-5.3.9-7 2.5zM12 7v13.5" />,
  photo: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.75" /><path d="m20.5 15.5-4.5-4.5-9 8.5" /></>,
  tag: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7a1 1 0 0 1 .7.3l7.8 7.8a1 1 0 0 1 0 1.4l-7.7 7.7a1 1 0 0 1-1.4 0l-7.8-7.8a1 1 0 0 1-.3-.7Z" /><circle cx="8" cy="8" r="1.5" /></>,
  portfolio: <><rect x="3.5" y="7.5" width="13" height="12" rx="2" /><path d="M7.5 4.5h11a2 2 0 0 1 2 2v9" /><path d="m3.5 16.5 3.5-3.5 3 3 2-2 4.5 4.5" /><circle cx="12.5" cy="11" r="1" /></>,
  users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M3 19.5c.7-3.2 3-5 6-5s5.3 1.8 6 5M15.5 5a3.5 3.5 0 0 1 0 7M18 14.8c1.5.7 2.4 2.2 2.8 4.7" /></>,
  layoutTop: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17" /></>,
  layoutBottom: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M3.5 14.5h17" /></>,
  sidebar: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15" /></>,
  palette: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.8-.7 1.8-1.7 0-1.2-1.2-1.6-1.2-2.8 0-1 .8-1.7 1.8-1.7h2a4.1 4.1 0 0 0 4.1-4.1c0-3.8-3.8-6.7-8.5-6.7Z" /><circle cx="7.5" cy="11.5" r="1" /><circle cx="9.5" cy="7.5" r="1" /><circle cx="14.5" cy="7.5" r="1" /></>,
  settings: <><path d="M12.22 3.5h-.44a1.75 1.75 0 0 0-1.75 1.75v.16a1.75 1.75 0 0 1-.87 1.51l-.38.22a1.75 1.75 0 0 1-1.75 0l-.13-.07a1.75 1.75 0 0 0-2.39.64l-.22.38a1.75 1.75 0 0 0 .64 2.39l.13.08a1.75 1.75 0 0 1 .87 1.5v.45a1.75 1.75 0 0 1-.87 1.52l-.13.08a1.75 1.75 0 0 0-.64 2.39l.22.38a1.75 1.75 0 0 0 2.39.64l.13-.07a1.75 1.75 0 0 1 1.75 0l.38.22a1.75 1.75 0 0 1 .87 1.51v.16a1.75 1.75 0 0 0 1.75 1.75h.44a1.75 1.75 0 0 0 1.75-1.75v-.16a1.75 1.75 0 0 1 .87-1.51l.38-.22a1.75 1.75 0 0 1 1.75 0l.13.07a1.75 1.75 0 0 0 2.39-.64l.22-.38a1.75 1.75 0 0 0-.64-2.39l-.13-.08a1.75 1.75 0 0 1-.87-1.52v-.44a1.75 1.75 0 0 1 .87-1.52l.13-.08a1.75 1.75 0 0 0 .64-2.39l-.22-.38a1.75 1.75 0 0 0-2.39-.64l-.13.07a1.75 1.75 0 0 1-1.75 0l-.38-.22a1.75 1.75 0 0 1-.87-1.51v-.16a1.75 1.75 0 0 0-1.75-1.75z" /><circle cx="12" cy="12" r="2.75" /></>,
  logout: <path d="M14 4.5h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3M10 16.5 5.5 12 10 7.5M5.5 12h10" />,
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
