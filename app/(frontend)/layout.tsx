import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import './sections.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { LivePreview } from '@/components/LivePreview';
import { asMedia, getFooter, getHeader, getSite, getTheme, isPreview, isStudioCanvas } from '@/lib/cms';
import { StudioBridge } from '@/components/StudioBridge';
import { ThemeStyle } from '@/components/ThemeStyle';
import { MotionPrefs } from '@/components/MotionPrefs';

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
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [site, header, footer, theme, preview, studio] = await Promise.all([getSite(), getHeader(), getFooter(), getTheme(), isPreview(), isStudioCanvas()]);
  return (
    <html lang="en" className={GeistSans.variable} data-theme="dark" data-motion={theme.motion ?? 'full'} data-scroll-behavior="smooth" data-wa={!studio && site.phone && site.whatsapp ? '' : undefined}>
      <body>
        <ThemeStyle theme={theme} />
        <MotionPrefs motion={theme.motion}>
          <a className="skip" href="#main">Skip to content</a>
          {preview && !studio && (
            <>
              <LivePreview serverURL={SERVER_URL} />
              {/* a route handler, not a page: a full request, never a prefetched <Link> */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="preview-bar" href="/exit-preview">Previewing drafts · Exit</a>
            </>
          )}
          {studio && <StudioBridge />}
          <Header
            name={site.name}
            menu={(header.menu ?? []).map((l) => ({ label: l.label, url: l.url }))}
            quote={{ label: header.quoteButton?.label || 'Start a project', url: header.quoteButton?.url || '/#contact' }}
            availability={header.showAvailability !== false ? site.availability : null}
          />
          <main id="main">{children}</main>
          <Footer site={site} footer={footer} />
          {!studio && site.phone && site.whatsapp && <WhatsAppFloat phone={site.phone} name={site.name} />}
        </MotionPrefs>
      </body>
    </html>
  );
}
