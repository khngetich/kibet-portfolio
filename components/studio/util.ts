import type { SField } from '@/lib/studio-schema';

export type Rec = Record<string, unknown>;

/** A 24-hex row id, the same shape Payload generates for array and block rows. */
export const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');

/** Default values for a set of fields (recursing into rows, groups and unnamed tabs). */
export function defaultsOf(fields: SField[]): Rec {
  const out: Rec = {};
  for (const f of fields) {
    if (f.type === 'row' || (f.type === 'collapsible' && !f.name)) Object.assign(out, defaultsOf(f.fields ?? []));
    else if (f.type === 'tabs') for (const t of f.tabs ?? []) { if (t.name) out[t.name] = defaultsOf(t.fields); else Object.assign(out, defaultsOf(t.fields)); }
    else if (!f.name) continue;
    else if (f.type === 'group') out[f.name] = defaultsOf(f.fields ?? []);
    else if (f.type === 'array') out[f.name] = Array.isArray(f.defaultValue) ? (f.defaultValue as Rec[]).map((r) => ({ ...r, id: newId() })) : [];
    else if (f.defaultValue !== undefined) out[f.name] = structuredClone(f.defaultValue);
  }
  return out;
}

/** The first plain-text value in a row, used as its title in lists. */
export function titleOf(row: Rec, fields: SField[], fallback: string): string {
  const flat = (fs: SField[]): SField[] => fs.flatMap((f) => (f.type === 'row' ? flat(f.fields ?? []) : [f]));
  for (const f of flat(fields)) {
    const v = f.name ? row[f.name] : undefined;
    if ((f.type === 'text' || f.type === 'textarea') && typeof v === 'string' && v.trim()) return v.trim();
  }
  return fallback;
}

/* Rich text: the Studio edits Payload's Lexical documents as plain paragraphs. */
type LexNode = { type?: string; text?: string; children?: LexNode[] };
export function lexicalToText(doc: unknown): string {
  const root = (doc as { root?: LexNode } | null)?.root;
  if (!root?.children) return '';
  const textOf = (n: LexNode): string => (n.text ?? '') + (n.children ?? []).map(textOf).join('');
  return root.children.map(textOf).join('\n\n');
}
export function textToLexical(text: string) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1, direction: 'ltr',
      children: paras.map((p) => ({
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0,
        children: [{ type: 'text', text: p, format: 0, detail: 0, mode: 'normal', style: '', version: 1 }],
      })),
    },
  };
}

export const pagePath = (slug?: string | null) => (!slug || slug === 'home' ? '/' : `/${slug}`);
export const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export const timeAgo = (iso?: string | null) => {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
