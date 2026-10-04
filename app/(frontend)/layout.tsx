import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import localFont from 'next/font/local';
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

// The site's sans (self-hosted at build); the accent serif is Georgia, already on every device.
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
// Geist stays available (the theme can switch to it, and the work-view switch uses the mono), but
// isn't preloaded: Manrope is the theme's font, and preloading both Geists cost ~140 KB per visit
const geistSans = localFont({ src: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2', variable: '--font-geist-sans', weight: '100 900', display: 'swap', preload: false });
const geistMono = localFont({ src: '../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2', variable: '--font-geist-mono', weight: '100 900', display: 'swap', preload: false });

/**
 * Runs before first paint: applies the visitor's saved theme (ThemeToggle), else light, so the
 * page never flashes the wrong colours. Kept tiny and dependency-free on purpose.
 */
const THEME_BOOT = `try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light')t='light';var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t}catch(e){}`;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site.studio ? `${site.name} — ${site.studio}` : site.name;
  const og = asMedia(site.ogImage);
  return {
    metadataBase: new URL(SERVER_URL),
    title: { default: title, template: `%s — ${site.name}` },
    description: site.metaDescription || site.tagline || site.role,
    openGraph: { title, description: site.metaDescription || site.tagline || site.role, type: 'website', images: og?.url ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined }] : [{ url: '/og', width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [site, header, footer, theme, preview, studio] = await Promise.all([getSite(), getHeader(), getFooter(), getTheme(), isPreview(), isStudioCanvas()]);
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable}`} data-theme="light" suppressHydrationWarning data-motion={theme.motion ?? 'full'} data-scroll-behavior="smooth" data-wa={!studio && site.phone && site.whatsapp ? '' : undefined}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
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
            quote={header.quoteButton?.show ? { label: header.quoteButton.label || 'Start a project', url: header.quoteButton.url || '/#contact' } : null}
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
