import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase Storage public URL, e.g. https://abcd.supabase.co/storage/v1/object/public/media
const storage = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;
// Payload returns absolute upload URLs on the site's own origin when files are stored locally.
const self = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000');

// Content sources the pages actually use: Supabase Storage for media, YouTube/Vimeo embeds in the
// viewer, Cloudflare Turnstile on the contact form, Google Fonts when Styles picks a font that isn't
// self-hosted. Enforced on the public site (it ran report-only first with nothing flagged); the CMS,
// Studio and API stay report-only, since Payload's admin (its code editor, workers) needs more room.
const csp = [
  "default-src 'self'",
  // Next streams page data in inline scripts, and the theme boot script runs before paint
  // (development only: Next's dev runtime and fast refresh evaluate code, so they need 'unsafe-eval')
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'production' ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob:${storage ? ` ${storage.origin}` : ''} https://i.ytimg.com https://i.vimeocdn.com`,
  `media-src 'self' blob:${storage ? ` ${storage.origin}` : ''}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self'${process.env.S3_ENDPOINT ? ` ${new URL(process.env.S3_ENDPOINT).origin}` : ''} https://challenges.cloudflare.com`,
  'frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://challenges.cloudflare.com',
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  // nothing outside this site may frame it (the Studio canvas and live preview are same-origin)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
];

const nextConfig: NextConfig = {
  // a separate output folder for a local preview build (NEXT_DIST_DIR=.next-preview), so it
  // doesn't collide with `next dev` or another build writing to .next at the same time
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // the public site: enforced
      { source: '/((?!admin|studio|api).*)', headers: [{ key: 'Content-Security-Policy', value: csp }] },
      // the CMS, Studio and API: reported only
      { source: '/:area(admin|studio|api)/:path*', headers: [{ key: 'Content-Security-Policy-Report-Only', value: csp }] },
      { source: '/:area(admin|studio|api)', headers: [{ key: 'Content-Security-Policy-Report-Only', value: csp }] },
    ];
  },
  // The Studio uploads images and videos through server actions (default cap is 1MB).
  experimental: { serverActions: { bodySizeLimit: '50mb' } },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: self.protocol.replace(':', '') as 'http' | 'https', hostname: self.hostname, port: self.port, pathname: '/api/media/file/**' },
      ...(storage ? [{ protocol: 'https' as const, hostname: storage.hostname, pathname: '/storage/v1/object/public/**' }] : []),
    ],
    // Local development fetches images from localhost, which Next blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  webpack: (config) => {
    config.resolve.extensionAlias = { '.cjs': ['.cts', '.cjs'], '.js': ['.ts', '.tsx', '.js', '.jsx'], '.mjs': ['.mts', '.mjs'] };
    return config;
  },
  // A stray package-lock.json in the home directory otherwise makes Next guess the wrong root.
  turbopack: { root: dirname },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
