import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/styles/cms-tokens.css';
import './studio.css';

export const metadata: Metadata = { title: 'Studio', robots: { index: false, follow: false } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FFFFFF' };

/** The Studio editor has its own document shell, separate from the site and the Payload admin. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
