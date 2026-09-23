import path from 'path';
import { fileURLToPath } from 'url';
import type { NextConfig } from 'next';
import { withPayload } from '@payloadcms/next/withPayload';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase Storage public URL, e.g. https://abcd.supabase.co/storage/v1/object/public/media
const storage = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;
// Payload returns absolute upload URLs on the site's own origin when files are stored locally.
const self = new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000');

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
