'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import type { SBlock, SField } from '@/lib/studio-schema';
import { useStudioData, type MediaDoc } from './Data';
import { Icon } from '@/components/ui/Icon';
import { thumbURL } from '@/lib/media';
import { useConfirm } from './Modal';
import { TabList, TabPanel } from './TabList';
import { defaultsOf, lexicalToText, newId, textToLexical, titleOf, type Rec } from './util';

/**
 * Draws an editing form from a serialised field schema (lib/studio-schema.ts). Values are
 * immutable: every change produces a new object passed to `onChange`.
 */

const human = (s?: string) => (s ? s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()) : '');
const labelOf = (f: SField) => f.label || human(f.name);

export function FieldList({ fields, value, onChange }: { fields: SField[]; value: Rec; onChange: (v: Rec) => void }) {
  return (
    <div className="st-fields">
      {fields.map((f, i) => <FieldView key={(f.name ?? f.type) + i} field={f} value={value} onChange={onChange} />)}
    </div>
  );
}

/** Renders one field against its parent object (rows, tabs and unnamed groups write into the parent). */
function FieldView({ field: f, value, onChange }: { field: SField; value: Rec; onChange: (v: Rec) => void }) {
  if (f.hidden) return null;
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });

  switch (f.type) {
    case 'row':
      return (
        <div className="st-frow">
          {(f.fields ?? []).map((c, i) => (
            <div key={(c.name ?? c.type) + i} className="st-fcell" style={{ flexBasis: c.width ?? '100%' }}>
              <FieldView field={{ ...c, width: undefined }} value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      );
    case 'collapsible':
      return <FieldList fields={f.fields ?? []} value={value} onChange={onChange} />;
    case 'tabs':
      return <Tabs field={f} value={value} onChange={onChange} />;
    case 'group': {
      if (!f.name) return <FieldList fields={f.fields ?? []} value={value} onChange={onChange} />;
      const v = (value[f.name] as Rec) ?? {};
      if (f.control === 'link') return <LinkControl label={labelOf(f)} value={v} onChange={(nv) => set(f.name!, nv)} />;
      return (
        <fieldset className="st-group">
          <legend>{labelOf(f)}</legend>
          {f.description && <p className="st-help">{f.description}</p>}
          <FieldList fields={f.fields ?? []} value={v} onChange={(nv) => set(f.name!, nv)} />
        </fieldset>
      );
    }
    case 'array':
      return <ArrayField field={f} rows={(value[f.name!] as Rec[]) ?? []} onChange={(rows) => set(f.name!, rows)} />;
    case 'blocks':
      return <BlocksField field={f} rows={(value[f.name!] as Rec[]) ?? []} onChange={(rows) => set(f.name!, rows)} />;
    default:
      if (!f.name) return null;
      return <Leaf field={f} value={value[f.name]} onChange={(v) => set(f.name!, v)} />;
  }
}

function Tabs({ field, value, onChange }: { field: SField; value: Rec; onChange: (v: Rec) => void }) {
  const [tab, setTab] = useState(0);
  const base = useId();
  const tabs = field.tabs ?? [];
  const t = tabs[tab];
  if (!t) return null;
  return (
    <div className="st-tabs-field">
      <TabList base={base} label={labelOf(field) || 'Field groups'} tabs={tabs.map((x, i) => ({ value: i, label: x.label }))} active={tab} onChange={setTab} />
      <TabPanel base={base} active={tab}>
        {t.description && <p className="st-help">{t.description}</p>}
        {t.name
          ? <FieldList fields={t.fields} value={(value[t.name] as Rec) ?? {}} onChange={(nv) => onChange({ ...value, [t.name!]: nv })} />
          : <FieldList fields={t.fields} value={value} onChange={onChange} />}
      </TabPanel>
    </div>
  );
}

/**
 * A field's label, control and help text. With `htmlFor` the label names that input;
 * without it (tags, choices, pickers) the controls sit in a group named by the label.
 * Help text gets the id `${htmlFor}-desc` for aria-describedby.
 */
function Wrap({ field, children, htmlFor, aside }: { field: SField; children: React.ReactNode; htmlFor?: string; aside?: React.ReactNode }) {
  const own = useId();
  const labelId = `${own}-label`;
  const req = field.required && <i aria-hidden="true">*</i>;
  return (
    <div className="st-field">
      <div className="st-label-row">
        {htmlFor
          ? <label className="st-label" htmlFor={htmlFor}>{labelOf(field)}{req}</label>
          : <span className="st-label" id={labelId}>{labelOf(field)}{req}</span>}
        {aside}
      </div>
      {htmlFor ? children : <div role="group" aria-labelledby={labelId} aria-describedby={field.description ? `${own}-desc` : undefined}>{children}</div>}
      {field.description && <p className="st-help" id={htmlFor ? `${htmlFor}-desc` : `${own}-desc`}>{field.description}</p>}
    </div>
  );
}

/** ARIA for a labelled input: its help text, required and invalid states. */
const ariaOf = (f: SField, id: string, invalid?: boolean) => ({
  'aria-describedby': f.description ? `${id}-desc` : undefined,
  'aria-required': f.required || undefined,
  'aria-invalid': invalid || undefined,
});

function Leaf({ field: f, value, onChange }: { field: SField; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const invalid = f.required && (value == null || value === '');

  if (f.type === 'text' && f.hasMany) return <Wrap field={f} htmlFor={id}><Tags id={id} describedBy={f.description ? `${id}-desc` : undefined} value={(value as string[]) ?? []} onChange={onChange} /></Wrap>;
  if (f.control === 'colour') return <Wrap field={f} htmlFor={id}><Colour id={id} name={labelOf(f)} describedBy={f.description ? `${id}-desc` : undefined} value={(value as string) ?? ''} fallback={f.defaultValue as string | undefined} onChange={onChange} /></Wrap>;
  if (f.control === 'range') return <Range id={id} field={f} value={value as number | null | undefined} onChange={onChange} />;

  switch (f.type) {
    case 'text':
    case 'email':
      return <Wrap field={f} htmlFor={id}><input id={id} {...ariaOf(f, id, invalid)} className={`st-input${invalid ? ' is-invalid' : ''}`} type={f.type === 'email' ? 'email' : 'text'} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} /></Wrap>;
    case 'textarea':
      return <Wrap field={f} htmlFor={id}><textarea id={id} {...ariaOf(f, id, invalid)} className={`st-input${invalid ? ' is-invalid' : ''}`} rows={3} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} /></Wrap>;
    case 'number':
      return <Wrap field={f} htmlFor={id}><input id={id} {...ariaOf(f, id)} className="st-input" type="number" min={f.min} max={f.max} step={f.step} value={value == null ? '' : String(value)} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} /></Wrap>;
    case 'checkbox':
      return (
        <label className="st-switch-row">
          <span className="st-switch"><input type="checkbox" aria-describedby={f.description ? `${id}-desc` : undefined} checked={!!value} onChange={(e) => onChange(e.target.checked)} /><span aria-hidden="true" /></span>
          <span>{labelOf(f)}{f.description && <small id={`${id}-desc`}>{f.description}</small>}</span>
        </label>
      );
    case 'select': {
      const opts = f.options ?? [];
      if (f.hasMany) return <Wrap field={f}><div className="st-checks">{opts.map((o) => { const on = ((value as string[]) ?? []).includes(o.value); return <button key={o.value} type="button" className={`st-chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => onChange(on ? (value as string[]).filter((x) => x !== o.value) : [...((value as string[]) ?? []), o.value])}>{o.label}</button>; })}</div></Wrap>;
      if (opts.length <= 4) return <Wrap field={f}><div className="st-seg">{opts.map((o) => <button key={o.value} type="button" className={value === o.value ? 'is-on' : undefined} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>)}</div></Wrap>;
      return <Wrap field={f} htmlFor={id}><select id={id} {...ariaOf(f, id)} className="st-input" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value || null)}>{!f.required && <option value="">—</option>}{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Wrap>;
    }
    case 'upload':
      return <Wrap field={f}>{f.hasMany ? <MediaMany value={(value as number[]) ?? []} onChange={onChange} /> : <MediaOne value={value as number | null} onChange={onChange} />}</Wrap>;
    case 'relationship':
      return <Wrap field={f}><ProjectPicker value={(f.hasMany ? (value as number[]) : value != null ? [value as number] : []) ?? []} max={f.hasMany ? f.maxRows : 1} onChange={(ids) => onChange(f.hasMany ? ids : ids[0] ?? null)} /></Wrap>;
    case 'richText':
      return <RichTextLite id={id} field={f} value={value} onChange={onChange} />;
    case 'date':
      return <Wrap field={f} htmlFor={id}><input id={id} {...ariaOf(f, id)} className="st-input" type="date" value={typeof value === 'string' ? value.slice(0, 10) : ''} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} /></Wrap>;
    default:
      return null;
  }
}

/* ── controls ── */

function Colour({ id, name, describedBy, value, fallback, onChange }: { id: string; name: string; describedBy?: string; value: string; fallback?: string; onChange: (v: string | null) => void }) {
  const shown = value || fallback || '';
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(shown);
  return (
    <div className="st-colour">
      <span className="st-swatch" style={{ background: valid ? shown : 'transparent' }}>
        <input type="color" aria-label={`${name}: colour picker`} value={valid && shown.length === 7 ? shown : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      </span>
      <input id={id} aria-describedby={describedBy} className="st-input" value={value} placeholder={fallback ?? 'Default'} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      {value && <button type="button" className="st-link-btn" onClick={() => onChange(null)} aria-label={`Reset ${name} to default`}>Reset</button>}
    </div>
  );
}

function Range({ id, field: f, value, onChange }: { id: string; field: SField; value: number | null | undefined; onChange: (v: number | null) => void }) {
  const min = f.min ?? 0, max = f.max ?? 100;
  const fallback = typeof f.defaultValue === 'number' ? f.defaultValue : null;
  const current = value ?? fallback;
  return (
    <Wrap field={f} htmlFor={id} aside={<span className="st-value">{current == null ? 'Default' : `${current}${f.unit ?? ''}`}</span>}>
      <div className="st-range">
        <input id={id} {...ariaOf(f, id)} type="range" min={min} max={max} step={f.step ?? 1} value={current ?? min} onChange={(e) => onChange(Number(e.target.value))} style={{ '--p': `${(((current ?? min) - min) / (max - min)) * 100}%` } as React.CSSProperties} />
        <input className="st-input st-input-num" type="number" min={min} max={max} step={f.step ?? 1} value={value ?? ''} placeholder={fallback != null ? String(fallback) : '—'} onChange={(e) => onChange(e.target.value === '' ? null : Math.min(max, Math.max(min, Number(e.target.value))))} aria-label={`${labelOf(f)} value`} />
        {value != null && value !== fallback && <button type="button" className="st-link-btn" onClick={() => onChange(fallback)}>Reset</button>}
      </div>
    </Wrap>
  );
}

function Tags({ id, describedBy, value, onChange }: { id: string; describedBy?: string; value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');
  const add = () => { const t = draft.trim(); if (t && !value.includes(t)) onChange([...value, t]); setDraft(''); };
  return (
    <div className="st-tags">
      {value.map((t, i) => (
        <span key={t + i} className="st-tag">{t}<button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}><Icon name="close" size={12} /></button></span>
      ))}
      <input id={id} aria-describedby={describedBy} className="st-tags-input" value={draft} placeholder={value.length ? 'Add another…' : 'Type and press Enter'} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1)); }} onBlur={add} />
    </div>
  );
}

// Two button styles: Primary (solid; the colour suits the background) and Secondary (outline).
const VARIANTS = [
  { value: 'default', label: 'Primary' }, { value: 'light', label: 'Primary · white' }, { value: 'dark', label: 'Primary · dark' },
  { value: 'accent', label: 'Primary · red' }, { value: 'outline', label: 'Secondary' }, { value: 'ghost', label: 'Text link' },
];
function LinkControl({ label, value, onChange }: { label: string; value: Rec; onChange: (v: Rec) => void }) {
  const id = useId();
  return (
    <fieldset className="st-group st-link">
      <legend>{label}</legend>
      <div className="st-frow">
        <div className="st-fcell" style={{ flexBasis: '40%' }}><div className="st-field"><label className="st-label" htmlFor={`${id}-label`}>Label</label><input id={`${id}-label`} className="st-input" value={(value.label as string) ?? ''} onChange={(e) => onChange({ ...value, label: e.target.value })} /></div></div>
        <div className="st-fcell" style={{ flexBasis: '60%' }}><div className="st-field"><label className="st-label" htmlFor={`${id}-url`}>Link</label><input id={`${id}-url`} className="st-input" value={(value.url as string) ?? ''} placeholder="/about, /#contact or https://…" onChange={(e) => onChange({ ...value, url: e.target.value })} /></div></div>
      </div>
      <div className="st-field">
        <span className="st-label" id={`${id}-style`}>Style</span>
        <div className="st-seg st-seg-wrap" role="group" aria-labelledby={`${id}-style`}>{VARIANTS.map((o) => <button key={o.value} type="button" aria-pressed={(value.variant ?? 'default') === o.value} className={(value.variant ?? 'default') === o.value ? 'is-on' : undefined} onClick={() => onChange({ ...value, variant: o.value })}>{o.label}</button>)}</div>
      </div>
    </fieldset>
  );
}

function RichTextLite({ id, field, value, onChange }: { id: string; field: SField; value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(() => lexicalToText(value));
  // Re-read the text when the value changes from outside (undo, restore), adjusted during render.
  const [from, setFrom] = useState(value);
  if (from !== value) { setFrom(value); setText(lexicalToText(value)); }
  return (
    <Wrap field={{ ...field, description: field.description ?? 'Separate paragraphs with a blank line.' }} htmlFor={id}>
      <textarea id={id} aria-describedby={`${id}-desc`} className="st-input" rows={8} value={text} onChange={(e) => { setText(e.target.value); onChange(textToLexical(e.target.value)); }} />
    </Wrap>
  );
}

/* ── media ── */

function Thumb({ doc }: { doc?: MediaDoc }) {
  if (!doc) return <span className="st-thumb is-loading" />;
  return <span className="st-thumb">{doc.mimeType?.startsWith('image/') && doc.url ? <img src={thumbURL(doc, 128)!} alt="" loading="lazy" /> : <span className="st-media-type">{doc.mimeType?.split('/')[1] ?? 'file'}</span>}</span>;
}

function MediaOne({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  const { media, ensureMedia, pickMedia } = useStudioData();
  const id = typeof value === 'object' && value ? (value as { id: number }).id : value;
  useEffect(() => { if (id) ensureMedia([id]); }, [id, ensureMedia]);
  const choose = async () => { const r = await pickMedia(); if (r?.[0]) onChange(r[0].id); };
  if (!id) return <button type="button" className="st-media-empty" onClick={choose}><b>+ Choose image</b><span>From the library or upload new</span></button>;
  return (
    <div className="st-media-one">
      <Thumb doc={media[id]} />
      <span className="st-media-one-meta"><b>{media[id]?.alt ?? 'Loading…'}</b><small>{media[id]?.filename}</small></span>
      <span className="st-media-one-actions">
        <button type="button" className="st-btn st-btn-sm" onClick={choose}>Replace</button>
        <button type="button" className="st-link-btn" onClick={() => onChange(null)}>Remove</button>
      </span>
    </div>
  );
}

function MediaMany({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const { media, ensureMedia, pickMedia } = useStudioData();
  const ids = value.map((v) => (typeof v === 'object' && v ? (v as { id: number }).id : v));
  useEffect(() => { ensureMedia(ids); }, [ids.join(','), ensureMedia]); // eslint-disable-line react-hooks/exhaustive-deps
  const add = async () => { const r = await pickMedia({ multiple: true }); if (r?.length) onChange([...ids, ...r.map((d) => d.id).filter((x) => !ids.includes(x))]); };
  return (
    <div className="st-media-many">
      {ids.map((id, i) => (
        <span key={id} className="st-media-many-item">
          <Thumb doc={media[id]} />
          <span className="st-media-many-actions">
            <button type="button" onClick={() => i > 0 && onChange(ids.map((x, j) => (j === i - 1 ? ids[i] : j === i ? ids[i - 1] : x)))} disabled={i === 0} aria-label="Move earlier" title="Move earlier"><Icon name="left" size={12} weight="semibold" /></button>
            <button type="button" onClick={() => onChange(ids.filter((x) => x !== id))} aria-label="Remove" title="Remove"><Icon name="close" size={12} weight="semibold" /></button>
          </span>
        </span>
      ))}
      <button type="button" className="st-media-add" onClick={add}><Icon name="plus" size={14} /> Add</button>
    </div>
  );
}

function ProjectPicker({ value, max, onChange }: { value: number[]; max?: number; onChange: (v: number[]) => void }) {
  const { projects } = useStudioData();
  const ids = value.map((v) => (typeof v === 'object' && v ? (v as { id: number }).id : v));
  const byId = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);
  const available = projects.filter((p) => !ids.includes(p.id));
  const full = max != null && ids.length >= max;
  return (
    <div className="st-picker">
      {ids.length === 0 && <p className="st-help">None chosen — the section uses its default (featured projects).</p>}
      <ul className="st-picker-list">
        {ids.map((id, i) => (
          <li key={id}>
            <span>{byId[id]?.title ?? `Project #${id}`}</span>
            <button type="button" onClick={() => i > 0 && onChange(ids.map((x, j) => (j === i - 1 ? ids[i] : j === i ? ids[i - 1] : x)))} disabled={i === 0} aria-label="Move up" title="Move up"><Icon name="up" size={14} /></button>
            <button type="button" onClick={() => onChange(ids.filter((x) => x !== id))} aria-label="Remove" title="Remove"><Icon name="close" size={14} /></button>
          </li>
        ))}
      </ul>
      {!full && available.length > 0 && (
        <select className="st-input" value="" onChange={(e) => e.target.value && onChange([...ids, Number(e.target.value)])} aria-label="Add a project">
          <option value="">+ Add a project…</option>
          {available.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      )}
    </div>
  );
}

/* ── repeatable items ── */

function ItemShell({ title, index, count, open, onToggle, onMove, onDuplicate, onRemove, children, tag }: {
  title: string; index: number; count: number; open: boolean; tag?: string;
  onToggle: () => void; onMove: (d: -1 | 1) => void; onDuplicate: () => void; onRemove: () => void; children: React.ReactNode;
}) {
  // Fields mount the first time the item opens and stay mounted, so closing can animate
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);
  return (
    <li className={`st-item${open ? ' is-open' : ''}`}>
      <div className="st-item-head">
        <button type="button" className="st-item-title" onClick={onToggle} aria-expanded={open}>
          <Icon name="right" size={14} className="st-caret" />
          {tag && <span className="st-item-tag">{tag}</span>}
          <span>{title}</span>
        </button>
        <span className="st-item-actions">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" title="Move up"><Icon name="up" size={14} /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down" title="Move down"><Icon name="down" size={14} /></button>
          <button type="button" onClick={onDuplicate} aria-label="Duplicate" title="Duplicate"><Icon name="copy" size={14} /></button>
          <button type="button" onClick={onRemove} aria-label="Delete" title="Delete" className="is-danger"><Icon name="trash" size={14} /></button>
        </span>
      </div>
      <div className="st-item-collapse" inert={!open}>
        <div className="st-item-body">{seen && children}</div>
      </div>
    </li>
  );
}

function useRows(rows: Rec[], onChange: (rows: Rec[]) => void, noun: string) {
  const confirm = useConfirm();
  const [open, setOpen] = useState<string | null>(null);
  const keyOf = (r: Rec, i: number) => (r.id as string) ?? String(i);
  return {
    open, setOpen, keyOf,
    move: (i: number, d: number) => { const j = i + d; if (j < 0 || j >= rows.length) return; const next = [...rows]; [next[i], next[j]] = [next[j], next[i]]; onChange(next); },
    duplicate: (i: number) => { const copy = { ...structuredClone(rows[i]), id: newId() }; const next = [...rows]; next.splice(i + 1, 0, copy); onChange(next); setOpen(copy.id as string); },
    remove: async (i: number, title: string) => { if (await confirm({ title: `Delete this ${noun}?`, body: <>“{title}” will be removed.</>, confirmLabel: 'Delete', danger: true })) onChange(rows.filter((_, j) => j !== i)); },
    update: (i: number, v: Rec) => onChange(rows.map((r, j) => (j === i ? v : r))),
  };
}

function ArrayField({ field: f, rows, onChange }: { field: SField; rows: Rec[]; onChange: (rows: Rec[]) => void }) {
  const noun = (labelOf(f).replace(/s$/, '') || 'item').toLowerCase();
  const r = useRows(rows, onChange, noun);
  const full = f.maxRows != null && rows.length >= f.maxRows;
  const add = () => { const row = { ...defaultsOf(f.fields ?? []), id: newId() }; onChange([...rows, row]); r.setOpen(row.id); };
  return (
    <div className="st-field st-array">
      <div className="st-label-row"><span className="st-label">{labelOf(f)} <em>{rows.length}{f.maxRows ? ` / ${f.maxRows}` : ''}</em></span></div>
      {f.description && <p className="st-help">{f.description}</p>}
      <ul className="st-items">
        {rows.map((row, i) => {
          const title = titleOf(row, f.fields ?? [], `${human(noun)} ${i + 1}`);
          return (
            <ItemShell key={r.keyOf(row, i)} title={title} index={i} count={rows.length} open={r.open === r.keyOf(row, i)} onToggle={() => r.setOpen(r.open === r.keyOf(row, i) ? null : r.keyOf(row, i))} onMove={(d) => r.move(i, d)} onDuplicate={() => r.duplicate(i)} onRemove={() => r.remove(i, title)}>
              <FieldList fields={f.fields ?? []} value={row} onChange={(v) => r.update(i, v)} />
            </ItemShell>
          );
        })}
      </ul>
      {!full && <button type="button" className="st-add" onClick={add}><Icon name="plus" size={14} /> Add {noun}</button>}
    </div>
  );
}

function BlocksField({ field: f, rows, onChange }: { field: SField; rows: Rec[]; onChange: (rows: Rec[]) => void }) {
  const r = useRows(rows, onChange, 'block');
  const blocks = useMemo(() => f.blocks ?? [], [f.blocks]);
  const byType = useMemo(() => Object.fromEntries(blocks.map((b) => [b.slug, b])), [blocks]) as Record<string, SBlock>;
  const add = (slug: string) => { const b = byType[slug]; if (!b) return; const row = { blockType: slug, ...defaultsOf(b.fields), id: newId() }; onChange([...rows, row]); r.setOpen(row.id); };
  return (
    <div className="st-field st-array">
      <div className="st-label-row"><span className="st-label">{labelOf(f)} <em>{rows.length}</em></span></div>
      <ul className="st-items">
        {rows.map((row, i) => {
          const b = byType[row.blockType as string];
          if (!b) return null;
          const title = titleOf(row, b.fields, b.label);
          return (
            <ItemShell key={r.keyOf(row, i)} tag={b.label} title={title === b.label ? '' : title} index={i} count={rows.length} open={r.open === r.keyOf(row, i)} onToggle={() => r.setOpen(r.open === r.keyOf(row, i) ? null : r.keyOf(row, i))} onMove={(d) => r.move(i, d)} onDuplicate={() => r.duplicate(i)} onRemove={() => r.remove(i, b.label)}>
              <FieldList fields={b.fields} value={row} onChange={(v) => r.update(i, v)} />
            </ItemShell>
          );
        })}
      </ul>
      <select className="st-input st-add-select" value="" onChange={(e) => { if (e.target.value) add(e.target.value); }} aria-label="Add a block">
        <option value="">+ Add a block…</option>
        {blocks.map((b) => <option key={b.slug} value={b.slug}>{b.label}</option>)}
      </select>
    </div>
  );
}
