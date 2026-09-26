/**
 * One-off import of the original site content into the CMS.
 *   npm run seed
 * Safe to re-run: it skips anything that already exists (matched by slug / filename).
 *
 * It does NOT create an admin user — open /admin and create your own on first visit.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import { designer, profile, projects } from './seed-data';
import { art } from './placeholder-art';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = (p: string) => path.resolve(dirname, '../public', p.replace(/^\//, ''));
const ctx = { disableRevalidate: true };

async function upload(payload: Payload, name: string, data: Buffer, mimetype: string, alt: string) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1 });
  if (existing.docs[0]) return existing.docs[0].id;
  const doc = await payload.create({ collection: 'media', data: { alt }, file: { data, name, mimetype, size: data.length }, context: ctx });
  return doc.id;
}

/** Renders one of the old generated SVG covers to a PNG, for projects with no publishable images yet. */
async function placeholder(payload: Payload, key: string, alt: string) {
  // The SVGs style text through page CSS classes; give the rasteriser real font stacks instead.
  const svg = art(key)
    .replaceAll('class="t-display"', 'font-family="Impact, Helvetica Neue, Arial Black, sans-serif"')
    .replaceAll('class="t-sans"', 'font-family="Helvetica Neue, Helvetica, Arial, sans-serif"');
  const png = await sharp(Buffer.from(svg), { density: 400 }).resize(1600, 1000, { fit: 'cover' }).png().toBuffer();
  return upload(payload, `placeholder-${key}.png`, png, 'image/png', alt);
}

/** Minimal Lexical rich-text document from plain paragraphs. */
const DISCIPLINE: Record<string, 'social' | 'web'> = { 'Social media design': 'social', 'Web design': 'web' };
// Real images first, so the site leads with finished, publishable work.
const ORDER = ['rovex-car-rentals', 'techpressive-prints-and-design', 'kwikbet-matchday-posters', 'kwikbet-crash-game-posters', 'kwikbet-winners-announcements'];

async function seed() {
  const payload = await getPayload({ config });
  payload.logger.info('Seeding…');

  // ── Projects ──
  for (const slug of ORDER) {
    const p = projects.find((x) => x.slug === slug)!;
    const exists = await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, draft: true });
    if (exists.docs[0]) { payload.logger.info(`  project exists: ${slug}`); continue; }

    const cover = p.cover
      ? await upload(payload, path.basename(p.cover), await fs.readFile(pub(p.cover)), 'image/jpeg', p.gallery[0]?.alt || p.title)
      : await placeholder(payload, p.art, `${p.title} (placeholder artwork)`);

    const isWeb = p.discipline === 'Web design';
    const disciplines: ('social' | 'web' | 'brand')[] = [DISCIPLINE[p.discipline] ?? 'social'];
    if (p.role.includes('Brand revamp')) disciplines.unshift('brand');

    await payload.create({
      collection: 'projects',
      context: ctx,
      data: {
        _status: 'published',
        title: p.title,
        slug: p.slug,
        client: p.client,
        year: p.year,
        disciplines,
        role: p.role,
        summary: p.summary,
        brief: p.brief,
        approach: p.approach,
        // The KwikBet outcomes in the old site were written during the conversion, not by
        // the designer. Left empty until real results are added in the CMS.
        outcome: isWeb ? p.result : undefined,
        cover,
        featured: slug !== 'kwikbet-winners-announcements',
        note: p.note
          ? `${p.note} Placeholder cover — replace it with the real work in the CMS once you have permission to publish.`
          : undefined,
        layout: [],
      },
    });
    payload.logger.info(`  + project: ${slug}`);
  }

  // ── Profile photo ──
  const photo = await upload(payload, 'profile.jpg', await fs.readFile(pub(profile.photo)), 'image/jpeg', `${designer.name}, graphic designer`);

  // ── Globals ──
  await payload.updateGlobal({
    slug: 'site',
    context: ctx,
    data: {
      name: designer.name,
      studio: designer.studio,
      role: designer.role,
      location: designer.city,
      availability: designer.availability,
      email: designer.email,
      phone: designer.phone,
      whatsapp: true,
      // The old links pointed at instagram.com / facebook.com / x.com with no username.
      // Add real profile URLs (Behance, Instagram, LinkedIn…) under Site settings → Contact.
      socials: [],
      metaDescription: `${designer.role} in ${designer.city}. Social media design, brand identity and web design.`,
    },
  });

  // Pages (Home, About, Work), Header and Footer are created by `npm run seed-pages`,
  // which uses the profile photo uploaded above.
  void photo;

  payload.logger.info('Done. Next run `npm run seed-pages`, then open /admin to create your editor account.');
  process.exit(0);
}

await seed();
