import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Search and sharing helpers shared by every route's metadata:
 *  - ogCard: the generated share card's URL, signed so /og only ever renders titles this site
 *    asked for (anyone else's ?title= gets the default card instead of their text under the brand)
 *  - canonical: the one public URL for a page, so /home, ?service= and friends don't count twice
 *  - structured data (JSON-LD) for the person, case studies, services and articles
 * Server-only (it signs with PAYLOAD_SECRET).
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '');

const sign = (title: string, kicker: string) =>
  createHmac('sha256', process.env.PAYLOAD_SECRET || 'dev').update(`${title}\n${kicker}`).digest('base64url').slice(0, 22);

export const ogCard = (title: string, kicker = '') => `/og?${new URLSearchParams({ title, kicker, s: sign(title, kicker) })}`;

export function verifyOgCard(title: string, kicker: string, sig: string | null) {
  if (!sig) return false;
  const want = Buffer.from(sign(title, kicker));
  const got = Buffer.from(sig);
  return want.length === got.length && timingSafeEqual(want, got);
}

/**
 * A page title for metadata. The layout appends "— <name>" to every title; an SEO title that already
 * names you (e.g. "… | Humphrey Kibet") is used as it is, so the name never appears twice.
 */
export const pageTitle = (title: string, siteName: string) => (siteName && title.toLowerCase().includes(siteName.toLowerCase()) ? { absolute: title } : title);

export const canonical = (path: string) => `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL;

/* ── structured data ── */

type Site = { name: string; role?: string | null; location?: string | null; email?: string | null; socials?: { url?: string | null }[] | null; studio?: string | null };

export const personLd = (site: Site) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role || undefined,
  url: SITE_URL,
  email: site.email ? `mailto:${site.email}` : undefined,
  address: site.location ? { '@type': 'PostalAddress', addressCountry: site.location } : undefined,
  worksFor: site.studio ? { '@type': 'Organization', name: site.studio } : undefined,
  sameAs: (site.socials ?? []).map((s) => s.url).filter(Boolean),
});

export const creativeWorkLd = (p: { title: string; slug?: string | null; summary?: string | null; client?: string | null; year?: string | null; image?: string | null }, author: string) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: p.title,
  url: canonical(`/work/${p.slug}`),
  description: p.summary || undefined,
  image: p.image || undefined,
  dateCreated: p.year && /^\d{4}$/.test(p.year) ? p.year : undefined,
  creator: { '@type': 'Person', name: author },
  sourceOrganization: p.client ? { '@type': 'Organization', name: p.client } : undefined,
});

export const serviceLd = (s: { title: string; slug?: string | null; description?: string | null; priceFrom?: number | null; currency?: string | null }, provider: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.title,
  url: canonical(`/services/${s.slug}`),
  description: s.description || undefined,
  provider: { '@type': 'Person', name: provider, url: SITE_URL },
  offers: s.priceFrom != null ? { '@type': 'Offer', price: s.priceFrom, priceCurrency: s.currency || 'KES' } : undefined,
});

export const articleLd = (a: { title: string; slug?: string | null; excerpt?: string | null; publishedAt?: string | null; updatedAt?: string | null; image?: string | null }, author: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  url: canonical(`/insights/${a.slug}`),
  description: a.excerpt || undefined,
  datePublished: a.publishedAt || undefined,
  dateModified: a.updatedAt || a.publishedAt || undefined,
  image: a.image || undefined,
  author: { '@type': 'Person', name: author, url: SITE_URL },
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: canonical(it.path) })),
});
