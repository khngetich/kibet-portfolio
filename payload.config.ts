import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { seoPlugin } from '@payloadcms/plugin-seo';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Projects } from './collections/Projects';
import { Inquiries } from './collections/Inquiries';
import { Pages, pagePath } from './collections/Pages';
import { Site } from './globals/Site';
import { Header } from './globals/Header';
import { Footer } from './globals/Footer';
import { Theme } from './globals/Theme';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Supabase Storage speaks the S3 protocol. When its credentials are set (production),
// uploads go there; otherwise they are written to ./media on disk (local development).
const useSupabaseStorage = Boolean(process.env.S3_BUCKET && process.env.S3_ENDPOINT);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Kaptured CMS' },
    // Light, following the reference dashboard (the login screen keeps the site's dark look);
    // colours and type are set in app/(payload)/custom.css.
    theme: 'light',
    components: {
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
      beforeNavLinks: ['/components/admin/NavMenu#NavMenu'],
      views: {
        dashboard: { Component: '/components/admin/Dashboard#Dashboard' },
      },
    },
    livePreview: {
      // The preview route checks the editor is logged in, turns on Next.js draft mode,
      // then redirects to the page so unpublished changes render in the admin's preview pane.
      url: ({ data, collectionConfig }) => {
        let target = '/';
        if (collectionConfig?.slug === 'projects') target = `/work/${data?.slug || ''}`;
        else if (collectionConfig?.slug === 'pages') target = pagePath(data?.slug);
        return `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/preview?path=${encodeURIComponent(target)}`;
      },
      collections: ['pages', 'projects'],
      globals: ['header', 'footer', 'theme', 'site'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Pages, Projects, Media, Inquiries, Users],
  globals: [Header, Footer, Theme, Site],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    // SEO fields are placed by hand in Pages (Page settings tab); the plugin supplies the
    // generate buttons and the Google-style preview.
    seoPlugin({
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => doc?.title || '',
      generateURL: ({ doc }) => `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${pagePath(doc?.slug)}`,
    }),
    s3Storage({
      enabled: useSupabaseStorage,
      collections: {
        media: {
          prefix: 'media',
          // Serve files straight from Supabase's public CDN instead of proxying through the app.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => `${process.env.S3_PUBLIC_URL}/${prefix}/${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
});
