import type { Block, Field, GlobalConfig } from 'payload';

/**
 * Serialisable field descriptions for the Studio editor. The Studio draws its forms from
 * the same field configs Payload uses (blocks/sections.ts, globals/*), so a new field or
 * section type appears in the editor automatically. Functions (validation, hooks) stay on
 * the server; Payload still enforces them when the Studio saves.
 */

export type SField = {
  type: string;
  name?: string;
  label?: string;
  description?: string;
  required?: boolean;
  hasMany?: boolean;
  relationTo?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  control?: string;
  width?: string;
  defaultValue?: unknown;
  maxRows?: number;
  hidden?: boolean;
  styleTab?: boolean;
  fields?: SField[];
  tabs?: { label: string; name?: string; description?: string; fields: SField[] }[];
  blocks?: SBlock[];
};

export type SBlock = { slug: string; label: string; description?: string; summary?: string; image?: string; fields: SField[] };

const text = (l: unknown, fallback = ''): string =>
  typeof l === 'string' ? l : l && typeof l === 'object' ? String(Object.values(l as Record<string, unknown>)[0] ?? fallback) : fallback;

const plain = (v: unknown): unknown => (typeof v === 'function' ? undefined : v === undefined ? undefined : JSON.parse(JSON.stringify(v)));

export function toSField(f: Field): SField | null {
  const a = (f as { admin?: Record<string, unknown> }).admin ?? {};
  const custom = (a.custom ?? {}) as Record<string, unknown>;
  const base: SField = {
    type: f.type,
    name: 'name' in f ? f.name : undefined,
    label: 'label' in f && f.label !== false ? text(f.label) || undefined : undefined,
    description: typeof a.description === 'string' ? a.description : undefined,
    width: typeof a.width === 'string' ? a.width : undefined,
    hidden: a.hidden === true || undefined,
    control: typeof custom.control === 'string' ? custom.control : undefined,
    unit: typeof custom.unit === 'string' ? custom.unit : undefined,
    styleTab: custom.styleTab === true || undefined,
  };
  if ('required' in f && f.required) base.required = true;
  if ('hasMany' in f && f.hasMany) base.hasMany = true;
  if ('relationTo' in f && typeof f.relationTo === 'string') base.relationTo = f.relationTo;
  if ('defaultValue' in f && typeof f.defaultValue !== 'function') base.defaultValue = plain(f.defaultValue);
  if ('min' in f && typeof f.min === 'number') base.min = f.min;
  if ('max' in f && typeof f.max === 'number') base.max = f.max;
  if ('maxRows' in f && typeof f.maxRows === 'number') base.maxRows = f.maxRows;
  if (typeof a.step === 'number') base.step = a.step;
  if ('options' in f && Array.isArray(f.options)) {
    base.options = f.options.map((o) => (typeof o === 'string' ? { label: o, value: o } : { label: text(o.label, String(o.value)), value: String(o.value) }));
  }
  if (f.type === 'blocks') base.blocks = (f.blocks as Block[]).map(toSBlock);
  if (f.type === 'tabs') {
    base.tabs = f.tabs.map((t) => ({ label: text(t.label, 'name' in t ? t.name : ''), name: 'name' in t ? t.name : undefined, description: typeof t.description === 'string' ? t.description : undefined, fields: toSFields(t.fields) }));
  } else if ('fields' in f && Array.isArray(f.fields)) {
    base.fields = toSFields(f.fields);
  }
  // Payload-only UI fields (e.g. the SEO plugin's preview widgets) have no data to edit.
  if (f.type === 'ui' || f.type === 'join') return null;
  return base;
}

export const toSFields = (fields: Field[]): SField[] => fields.map(toSField).filter((f): f is SField => !!f);

export function toSBlock(b: Block): SBlock {
  const custom = (b.admin?.custom ?? {}) as { summary?: string; description?: string };
  // Payload adds its own `blockName` field to every block once the config is loaded; the Studio doesn't use it.
  const fields = toSFields(b.fields).filter((f) => f.name !== 'blockName' && f.name !== 'id');
  return { slug: b.slug, label: text(b.labels?.singular, b.slug), description: custom.description, summary: custom.summary, image: b.imageURL, fields };
}

export const toSGlobal = (g: GlobalConfig) => ({ slug: g.slug, label: text(g.label, g.slug), description: typeof g.admin?.description === 'string' ? g.admin.description : undefined, fields: toSFields(g.fields) });
