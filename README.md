# Humphrey Kibet — Portfolio (Kaptured Creatives)

A Next.js 16 + React 19 + Tailwind v4 rebuild of the Portfolio.ai deck, with
shadcn-style UI primitives (Button, Badge, Card, Tabs, Sheet, Separator,
Avatar) hand-added under `components/ui/` (the shadcn CLI registry wasn't
reachable from the build sandbox, so these were written by hand in the
standard shadcn style — copy-in source, not an npm package).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production build
```

## Where things live

- `content/site.ts` — all copy: bio, projects, services, pricing, contact.
  Edit this file for day-to-day content changes.
- `lib/art.ts` — the generated-SVG artwork system (deterministic, no image
  files needed for most pieces).
- `public/profile.jpg`, `public/work/*.jpg` — real images extracted from
  the original Portfolio.ai deck (profile photo, Rovex and Techpressive
  website mockups).
- `components/sections/*` — one file per homepage section.
- `app/work/[slug]/page.tsx` — the case-study template, statically
  generated for every project in `content/site.ts`.

## A content note

Three projects (Matchday Posters, Crash Game Posters, Winners'
Announcements) were made for a sports-betting client and the original
files include licensed footballer photos, club crests and the client's
branding — those can't be reproduced here. Each is shown with a generic
abstract cover instead (see `lib/art.ts`: `matchday`, `crashgame`,
`winners`), with a note on the case-study page explaining the swap. Replace
`cover` on those projects in `content/site.ts` with a real exported image
once you have the rights to publish it.
