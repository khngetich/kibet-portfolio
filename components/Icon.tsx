import type { ReactElement, SVGProps } from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const paths = {
  sun: <g {...S}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></g>,
  moon: <path {...S} d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  left: <path {...S} strokeWidth={2} d="M14.5 6l-6 6 6 6" />,
  right: <path {...S} strokeWidth={2} d="M9.5 6l6 6-6 6" />,
  arrow: <path {...S} d="M5 12h14M13 6l6 6-6 6" />,
  external: <path {...S} d="M8 16L16 8M9 8h7v7" />,
  menu: <path {...S} d="M4 8h16M4 16h16" />,
  home: <path {...S} d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  check: <path {...S} strokeWidth={2.2} d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" />,
  spark: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" fill="currentColor" />,
  close: <path {...S} d="M6 6l12 12M18 6L6 18" />,
  mail: <g {...S}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></g>,
  download: <path {...S} d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  whatsapp: <g {...S}><path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" /><path d="M9 9.2c0 3 2.8 5.8 5.8 5.8l1-1.5-2-1-.9.9a4 4 0 0 1-2.3-2.3l.9-.9-1-2L9 9.2z" /></g>,
  instagram: <g {...S}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r=".9" fill="currentColor" /></g>,
  behance: <g {...S}><path d="M3 7h5a2.5 2.5 0 0 1 0 5H3zM3 12h5.5a2.75 2.75 0 0 1 0 5.5H3zM3 7v10.5" /><path d="M14.5 13.5h6a3 3 0 1 0-.8 2.2M15 7.5h4.5" /></g>,
  dribbble: <g {...S}><circle cx="12" cy="12" r="8.5" /><path d="M5 7c5 1 10 1 14-1.5M3.8 13.5c5-2 11-2 16 1M9 3.8c3 4 5 10 5.5 16.5" /></g>,
  linkedin: <g {...S}><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5v6M8 7.5v.1M11.5 16.5v-6M11.5 13c0-1.7 1.2-2.5 2.5-2.5s2.5.8 2.5 2.5v3.5" /></g>,
  x: <path {...S} d="M4.5 4.5l15 15M19.5 4.5l-15 15" />,
  facebook: <path {...S} d="M14.5 8H13a1.5 1.5 0 0 0-1.5 1.5V20M9 12.5h5.5M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z" />,
  tiktok: <path {...S} d="M13.5 4v10.5a3.5 3.5 0 1 1-3.5-3.5M13.5 4c.3 2.5 2 4 4.5 4.3" />,
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 18, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" {...props}>
      {paths[name]}
    </svg>
  );
}
