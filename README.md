# Humphrey Kibet — Portfolio (Kaptured Creatives)

A designer's portfolio and its content system: **Next.js 16** (App Router, React 19) with
**Payload CMS 3** built in, a **Postgres** database on **Supabase**, media in **Supabase Storage**,
hosted on **Vercel**.

| Address | What it is |
|---|---|
| `/` and every other public page | The site. Pages are built from sections edited in the CMS |
| `/admin` | Payload, the CMS: content, settings, enquiries, users |
| `/studio` | A visual editor for the same content (click a section on the page to edit it) |

## Run it on your computer

```bash
npm install
cp .env.example .env   # then fill it in (see below)
npm run dev            # http://localhost:3000
```

Node 20.9 or newer (`.nvmrc` pins 24).

**Which database?** `.env`'s `DATABASE_URL` decides. A local Postgres
(`postgres://you@localhost:5432/portfolio`) is the safe default: the dev server adjusts its
tables to the code automatically. Pointing it at Supabase means **you are editing the live site**:
uploads, seed scripts and migrations all land in production. `scripts/use-supabase-locally.sh`
switches `.env` to Supabase on purpose.

## Environment variables

All of them are listed, with where to find each, in [`.env.example`](.env.example).

- **Required:** `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`.
- **Production media:** the `S3_*` variables.
- **Recommended:**
  - `RESEND_API_KEY` and `EMAIL_FROM`: emails you each new enquiry, and makes "Forgot password" work.
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`: spam protection on the contact form.

Each optional feature stays off until its keys are set. On Vercel, add the same variables
under Project → Settings → Environment Variables.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run check` | Lint and type-check (run before committing; CI runs it too) |
| `npm run build` / `npm start` | Production build and server |
| `npm run migrate` | Apply new database migrations to the database in `.env` |
| `npm run migrate:create -- name` | Create a migration after changing collections, globals or sections |
| `npm run generate:types` | Refresh `payload-types.ts` after a schema change |
| `npm run backup` | Back up the database and all media to `~/Backups/portfolio/` |
| `npm run seed` / `npm run seed-pages` | Fill an empty database with starter content |

## Changing the content model

1. Edit `collections/`, `globals/` or `blocks/sections.ts`.
2. `npm run generate:types`, then `npm run migrate:create -- what-changed`.
3. Read the generated file in `migrations/`. When it asks "created or renamed?", the answer is
   usually *created*. Rehearse it on a throwaway local database.
4. Commit the migration (`.ts` and `.json`), `migrations/index.ts` and `payload-types.ts` together.
5. **Before deploying**, run `npm run migrate` against production. New code expects the new
   tables, so deploying first breaks the live site until the migration runs.

Once a migration has been applied to production, don't edit it. Make a new one on top.

## Deploying

```bash
npm run check
npm run migrate        # against production, if there are new migrations
vercel --prod
```

Preview deployments currently share the production database. Treat them as live, or give
previews their own database (a Supabase branch) under Vercel → Environment Variables → Preview.

## Backups

`npm run backup` writes a full database dump and every media file to a dated folder. It needs
`pg_dump` at least as new as Supabase's Postgres (the script says which version to install).
Run it weekly and before big changes, and keep a copy off this computer. To restore:

```bash
pg_restore --clean --no-owner -d "$TARGET_URL" ~/Backups/portfolio/<date>/database.dump
```

## Where things live

| Path | What's there |
|---|---|
| `app/(frontend)/` | Public routes: home, `/work`, `/services`, `/insights`, `/lab`, policies, metadata |
| `app/(payload)/` | The CMS (`/admin`, `/api`) and its theme (`custom.css`) |
| `app/(studio)/` | The Studio editor |
| `components/sections/RenderSections.tsx` | Renders a page's sections; one function per section type |
| `components/motion/` | Interactive and animated pieces (client components) |
| `components/admin/` | Dashboard, sidebar, ⌘K palette and pop-up editing for the CMS |
| `collections/`, `globals/`, `blocks/` | The content model |
| `lib/cms.ts` | Every read the public site makes |
| `lib/seo.ts` | Canonical URLs, signed share cards (`/og`), structured data |
| `hooks/` | Cache purging on publish, new-enquiry emails |
| `migrations/` | Database migrations, in order (`index.ts`) |
| `scripts/` | Seeding, Supabase setup, backups (`archive/` holds one-off tools) |

## Security notes

- Security headers come from `next.config.ts`. The Content Security Policy is report-only for now:
  check the browser console for "Content-Security-Policy-Report-Only" warnings, then switch the
  header name to `Content-Security-Policy` to enforce it.
- Visitors can't create enquiries through the API; only the contact form's server action can.
- The sign-in cookie is Secure and SameSite=Lax in production. Editors can't see other users.
- Never commit `.env*` (ignored by git) and rotate any key that has been pasted anywhere.
