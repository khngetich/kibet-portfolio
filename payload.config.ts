import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { resendAdapter } from '@payloadcms/email-resend';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Projects } from './collections/Projects';
import { Services } from './collections/Services';
import { Posts } from './collections/Posts';
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
// Vercel caps a request body at about 4.5 MB, so bigger uploads must skip the app: with this on,
// the browser asks for a signed URL and sends the file straight to Supabase (admin and Studio).
// Opt-in (S3_CLIENT_UPLOADS=true) because it needs the bucket to accept browser PUTs.
export const directUploads = useSupabaseStorage && process.env.S3_CLIENT_UPLOADS === 'true';

const missing = (name: string): never => { throw new Error(`${name} is not set. Add it to the environment (see .env.example).`); };

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' — Kaptured CMS' },
    // Light or dark, in the public site's palette: each editor picks with the switch in the top
    // bar (components/admin/ThemeSwitch.tsx), remembered in a cookie; until then it follows the
    // device. Colours and type are set in app/(payload)/custom.css.
    theme: 'all',
    components: {
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
      // the login screen's showcase panel and theme switch
      beforeLogin: ['/components/admin/LoginAside#LoginAside'],
      beforeNavLinks: ['/components/admin/NavMenu#NavMenu'],
      actions: ['/components/admin/ThemeSwitch#ThemeSwitch'],
      providers: ['/components/admin/FontProvider#FontProvider'],
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
        else if (collectionConfig?.slug === 'services') target = `/services/${data?.slug || ''}`;
        else if (collectionConfig?.slug === 'posts') target = `/insights/${data?.slug || ''}`;
        else if (collectionConfig?.slug === 'pages') target = pagePath(data?.slug);
        return `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/preview?path=${encodeURIComponent(target)}`;
      },
      collections: ['pages', 'projects', 'services', 'posts'],
      globals: ['header', 'footer', 'theme', 'site'],
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Pages, Projects, Services, Posts, Media, Inquiries, Users],
  globals: [Header, Footer, Theme, Site],
  editor: lexicalEditor(),
  // signs logins and preview links: never run production without it
  secret: process.env.PAYLOAD_SECRET || (process.env.NODE_ENV === 'production' ? missing('PAYLOAD_SECRET') : 'local-development-only'),
  // Email (new-enquiry alerts, password resets) goes through Resend once RESEND_API_KEY is set;
  // until then Payload only logs emails to the console. EMAIL_FROM must be on a domain verified in Resend.
  email: process.env.RESEND_API_KEY
    ? resendAdapter({ apiKey: process.env.RESEND_API_KEY, defaultFromAddress: process.env.EMAIL_FROM || 'onboarding@resend.dev', defaultFromName: process.env.EMAIL_FROM_NAME || 'Portfolio' })
    : undefined,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      // `next build` runs four workers (next.config.ts `cpus`), each with its own pool, and Supabase's
      // session pooler allows 15 clients in all ("EMAXCONNSESSION"). While building, each worker
      // keeps up to three connections and lets them go when idle; the running site keeps pg's
      // default. Not one: a query that needs a second connection while holding the only one waits
      // forever, and the build hangs at "Collecting page data".
      ...(process.env.NEXT_PHASE === 'phase-production-build' ? { max: 3, idleTimeoutMillis: 1000 } : {}),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Dev mode would otherwise push schema changes straight into whatever database it's pointed
    // at. Only a database on this machine may be changed that way; Supabase (production) only
    // ever changes through migrations (`payload migrate`).
    push: /@(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\//.test(process.env.DATABASE_URL || ''),
  }),
  sharp,
  // biggest file anyone can upload (images, PDFs, portfolio videos); also signed into direct-to-storage
  // upload URLs, so the bucket refuses anything larger
  upload: { limits: { fileSize: 100 * 1024 * 1024 } },
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
      // The plugin adds a `prefix` column to media when it's on; keeping it on everywhere means
      // local and production share one schema (migration 20261001_224434_media_prefix).
      alwaysInsertFields: true,
      clientUploads: directUploads,
      collections: {
        media: {
          prefix: 'media',
          // Serve files straight from Supabase's public CDN instead of proxying through the app.
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => `${process.env.S3_PUBLIC_URL}/${prefix || 'media'}/${filename}`,
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
