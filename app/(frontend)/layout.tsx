import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
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
    openGraph: { title, description: site.metaDescription || site.role, type: 'website', images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined }] : [{ url: '/og', width: 1200, height: 630, alt: title }] },
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} data-theme="dark" data-motion={theme.motion ?? 'full'} data-scroll-behavior="smooth" data-wa={!studio && site.phone && site.whatsapp ? '' : undefined}>
      <body>
        <ThemeStyle theme={theme} />
        {/* Ink layer: the misregistration filter used on project images (sections.css, "ink and paper") */}
        <svg className="ink-defs" aria-hidden="true" focusable="false" width="0" height="0">
          <filter id="misreg" x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx="3" dy="-1" result="r2" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feOffset in="b" dx="-3" dy="1" result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </svg>
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
