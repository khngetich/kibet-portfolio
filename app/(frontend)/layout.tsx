import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LivePreview } from '@/components/LivePreview';
import { themeScript } from '@/components/ThemeToggle';
import { asMedia, getSite, isPreview } from '@/lib/cms';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site.studio ? `${site.name} — ${site.studio}` : site.name;
  const og = asMedia(site.ogImage);
  return {
    metadataBase: new URL(SERVER_URL),
    title: { default: title, template: `%s — ${site.name}` },
    description: site.metaDescription || site.role,
    openGraph: { title, description: site.metaDescription || site.role, type: 'website', images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined }] : undefined },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F4F3' },
    { media: '(prefers-color-scheme: dark)', color: '#111213' },
  ],
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [site, preview] = await Promise.all([getSite(), isPreview()]);
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        {/* Runs before paint so there is no flash of the wrong theme. */}
        <Script id="theme" strategy="beforeInteractive">{themeScript}</Script>
        <a className="skip" href="#main">Skip to content</a>
        {preview && (
          <>
            <LivePreview serverURL={SERVER_URL} />
            <a className="preview-bar" href="/exit-preview">Previewing drafts · Exit</a>
          </>
        )}
        <Header name={site.name} />
        <main id="main">{children}</main>
        <Footer site={site} />
      </body>
    </html>
  );
}
