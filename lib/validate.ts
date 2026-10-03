/**
 * Field validators shared by collections, globals and sections. Each returns true or a message
 * the CMS shows under the field. Empty values pass; `required` handles those.
 */

export const hexColour = (v: unknown) => !v || (typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) || 'Use a hex colour like #E8352B';

/** A full web address. */
export const webURL = (v: unknown) => !v || (typeof v === 'string' && /^https?:\/\/[^\s/]+\.[^\s]+$/.test(v)) || 'Use a full address starting with https://';

/** Anything a link can point at: a page (/about), a section (/#work or #work), a full URL, mailto: or tel:. */
export const linkTarget = (v: unknown) =>
  !v || (typeof v === 'string' && /^(\/[^\s]*|#[\w-]+|https?:\/\/[^\s/]+\.[^\s]+|mailto:[^\s@]+@[^\s@]+|tel:\+?[\d\s()-]+)$/.test(v)) || 'Use a page (/about), a section (/#work), a full https:// address, mailto: or tel:';

/** A year (2024), a range (2023–2025) or a word like Ongoing. */
export const yearText = (v: unknown) => !v || (typeof v === 'string' && /^(\d{4}(\s*[–-]\s*(\d{4}|now|present))?|ongoing)$/i.test(v.trim())) || 'Use a year like 2025, a range like 2023–2025, or “Ongoing”';
