'use client';

import type { BlocksFieldClientComponent, BlocksFieldClientProps, ClientBlock } from 'payload';
import {
  BlocksDrawer,
  ConfirmationModal,
  DraggableSortable,
  DraggableSortableItem,
  Drawer,
  ErrorPill,
  RenderFields,
  ShimmerEffect,
  useDrawerSlug,
  useField,
  useForm,
  useFormFields,
  useFormSubmitted,
  useLivePreviewContext,
  useModal,
  useTranslation,
} from '@payloadcms/ui';
import { useCallback, useMemo, useState } from 'react';
import { SectionIcon } from './SectionIcon';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconSwap } from '@/components/ui/IconSwap';

/**
 * The page editor's section list. Replaces Payload's inline blocks field with compact rows;
 * each section opens in its own side panel (a Drawer rendering the same form fields at the
 * row's path, so edits land in the page form and the live preview follows along).
 *
 * Rows support drag to reorder, insert between, duplicate, show/hide and delete (confirmed
 * in a modal). Adding a section opens a picker modal, then straight into its panel.
 */

type Row = { id: string; blockType?: string; isLoading?: boolean };
type Perms = BlocksFieldClientProps['permissions'];

const text = (l: unknown): string => (typeof l === 'string' ? l : l && typeof l === 'object' ? String(Object.values(l)[0] ?? '') : '');
const custom = (b?: ClientBlock) => (b?.admin?.custom ?? {}) as { summary?: string; description?: string };

/**
 * Which section's panel is open, per field path. Kept outside React state because the
 * document view remounts this field when the live preview is switched on or off, and the
 * panel must stay open across that.
 */
const openSection = new Map<string, number>();

/** Same permission narrowing Payload's own block rows use. */
function blockPermissions(permissions: Perms, slug: string) {
  if (permissions === true) return true;
  const p = (permissions as { blocks?: Record<string, unknown> } | undefined)?.blocks;
  const specific = (p?.[slug] ?? p) as true | { fields?: unknown } | undefined;
  if (specific === true) return true;
  return (specific?.fields ?? true) as true;
}

export const SectionsField: BlocksFieldClientComponent = (props) => {
  const { field, path: pathFromProps, schemaPath: schemaPathFromProps, permissions, readOnly } = props;
  const schemaPath = schemaPathFromProps ?? field.name;
  const { rows = [], path, errorPaths = [], disabled } = useField({ hasRows: true, potentiallyStalePath: pathFromProps });
  const { addFieldRow, dispatchFields, moveFieldRow, removeFieldRow, setModified } = useForm();
  const { openModal, closeModal } = useModal();
  const submitted = useFormSubmitted();
  const addSlug = useDrawerSlug('add-section');
  // A stable slug (not useDrawerSlug's generated one) so the open panel survives a remount.
  const editSlug = `section-panel-${path}`;
  const deleteSlug = `section-delete-${path}`;
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState(0);
  const [editing, setEditingState] = useState<number | null>(() => openSection.get(path) ?? null);
  const setEditing = useCallback((i: number | null) => {
    if (i == null) openSection.delete(path); else openSection.set(path, i);
    setEditingState(i);
  }, [path]);
  const locked = Boolean(readOnly || disabled);

  const blocks = useMemo(() => (field.blocks ?? []) as ClientBlock[], [field.blocks]);
  const blockFor = useCallback((slug?: string) => blocks.find((b) => b.slug === slug), [blocks]);

  const openAdd = (index: number) => { setInsertAt(index); openModal(addSlug); };
  const openEdit = (index: number) => { setEditing(index); openModal(editSlug); };

  const add = useCallback((index: number, blockType?: string) => {
    addFieldRow({ blockType, path, rowIndex: index, schemaPath });
    // Straight into the new section's panel.
    setTimeout(() => { setEditing(index); openModal(editSlug); }, 0);
  }, [addFieldRow, path, schemaPath, openModal, editSlug, setEditing]);

  const duplicate = (index: number) => { dispatchFields({ type: 'DUPLICATE_ROW', path, rowIndex: index }); setModified(true); };
  const remove = (index: number) => removeFieldRow({ path, rowIndex: index });
  const askRemove = (index: number) => { setPendingDelete(index); openModal(deleteSlug); };
  const move = (from: number, to: number) => { if (to >= 0 && to < rows.length) moveFieldRow({ moveFromIndex: from, moveToIndex: to, path }); };
  const setHidden = (index: number, hidden: boolean) => {
    dispatchFields({ type: 'UPDATE', path: `${path}.${index}.hidden`, value: hidden });
    setModified(true);
  };

  // While the live preview is showing, the panel leaves it uncovered and clickable.
  const previewing = Boolean(useLivePreviewContext()?.isLivePreviewing);

  const editingRow = editing != null ? (rows[editing] as Row | undefined) : undefined;
  const editingBlock = blockFor(editingRow?.blockType);

  return (
    <div className="sf">
      <header className="sf-head">
        <div>
          <h3>Sections <span>{rows.length}</span></h3>
          <p>Drag to reorder. Click a section to edit it. Hidden sections stay here but are left off the live page.</p>
        </div>
        {!locked && <button type="button" className="sf-btn sf-btn-primary" onClick={() => openAdd(rows.length)}>+ Add section</button>}
      </header>

      {rows.length === 0 ? (
        <div className="sf-empty">
          <p>This page has no sections yet.</p>
          {!locked && <button type="button" className="sf-btn sf-btn-primary" onClick={() => openAdd(0)}>+ Add the first section</button>}
        </div>
      ) : (
        <DraggableSortable className="sf-list" ids={(rows as Row[]).map((r) => r.id)} onDragEnd={({ moveFromIndex, moveToIndex }) => move(moveFromIndex, moveToIndex)}>
          {(rows as Row[]).map((row, i) => {
            const block = blockFor(row.blockType);
            if (!block) return null;
            const errors = submitted ? errorPaths.filter((p) => p.startsWith(`${path}.${i}.`)).length : 0;
            return (
              <DraggableSortableItem key={row.id} id={row.id} disabled={locked}>
                {(drag) => (
                  <div ref={drag.setNodeRef} style={{ transform: drag.transform, transition: drag.transition }} className={`sf-item${drag.isDragging ? ' is-dragging' : ''}`}>
                    {!locked && <InsertLine onClick={() => openAdd(i)} />}
                    <SectionRow
                      index={i}
                      path={`${path}.${i}`}
                      row={row}
                      block={block}
                      label={text(block.labels?.singular) || block.slug}
                      errors={errors}
                      locked={locked}
                      isFirst={i === 0}
                      isLast={i === rows.length - 1}
                      dragProps={{ ...drag.attributes, ...drag.listeners }}
                      onEdit={() => openEdit(i)}
                      onDuplicate={() => duplicate(i)}
                      onRemove={() => askRemove(i)}
                      onMove={(d) => move(i, i + d)}
                      onHidden={(h) => setHidden(i, h)}
                    />
                  </div>
                )}
              </DraggableSortableItem>
            );
          })}
          {!locked && <InsertLine onClick={() => openAdd(rows.length)} last />}
        </DraggableSortable>
      )}

      <ConfirmationModal
        modalSlug={deleteSlug}
        heading="Delete this section?"
        body={
          pendingDelete != null && rows[pendingDelete]
            ? <p>The <b>{text(blockFor((rows[pendingDelete] as Row).blockType)?.labels?.singular)}</b> section and everything in it will be removed from this page. You can undo this by leaving without publishing, or by restoring an earlier version.</p>
            : null
        }
        confirmLabel="Delete section"
        onConfirm={() => { if (pendingDelete != null) remove(pendingDelete); setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
      />

      <BlocksDrawer addRow={add} addRowIndex={insertAt} blocks={blocks} drawerSlug={addSlug} labels={{ singular: 'Section', plural: 'Sections' }} />

      <Drawer
        slug={editSlug}
        className={`sf-drawer${previewing ? ' is-previewing' : ''}`}
        gutter={false}
        Header={
          editing != null && editingBlock ? (
            <PanelHeader
              label={text(editingBlock.labels?.singular)}
              blockType={editingBlock.slug}
              path={`${path}.${editing}`}
              summaryField={custom(editingBlock).summary}
              onHidden={(h) => setHidden(editing, h)}
              onClose={() => { closeModal(editSlug); setEditing(null); }}
            />
          ) : null
        }
      >
        {editing != null && editingBlock && editingRow && (
          <div className="sf-panel">
            {custom(editingBlock).description && <p className="sf-panel-desc">{custom(editingBlock).description}</p>}
            {editingRow.isLoading ? (
              <ShimmerEffect height="20rem" />
            ) : (
              <RenderFields
                className="sf-panel-fields"
                fields={editingBlock.fields}
                margins="small"
                parentIndexPath=""
                parentPath={`${path}.${editing}`}
                parentSchemaPath={schemaPath + editingBlock.slug}
                permissions={blockPermissions(permissions, editingBlock.slug)}
                readOnly={locked}
              />
            )}
            <p className="sf-panel-foot">Edits show in the preview as you type. Press <b>Publish changes</b> to put them live.</p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

function InsertLine({ onClick, last }: { onClick: () => void; last?: boolean }) {
  return (
    <button type="button" className={`sf-insert${last ? ' sf-insert-last' : ''}`} onClick={onClick}>
      <span>+ Insert section</span>
    </button>
  );
}

function SectionRow(props: {
  index: number;
  path: string;
  row: Row;
  block: ClientBlock;
  label: string;
  errors: number;
  locked: boolean;
  isFirst: boolean;
  isLast: boolean;
  dragProps: Record<string, unknown>;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
  onHidden: (hidden: boolean) => void;
}) {
  const { index, path, row, block, label, errors, locked, isFirst, isLast, dragProps } = props;
  const summaryField = custom(block).summary ?? 'heading';
  const hidden = useFormFields(([f]) => Boolean(f[`${path}.hidden`]?.value));
  const summary = useFormFields(([f]) => f[`${path}.${summaryField}`]?.value);
  const { i18n } = useTranslation();

  return (
    <div className={`sf-row${hidden ? ' is-hidden' : ''}${errors ? ' has-errors' : ''}`}>
      {!locked && (
        <button type="button" className="sf-handle" aria-label={`Drag to reorder ${label}`} {...dragProps}>
          <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><g fill="currentColor"><circle cx="2" cy="2" r="1.4" /><circle cx="8" cy="2" r="1.4" /><circle cx="2" cy="8" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="2" cy="14" r="1.4" /><circle cx="8" cy="14" r="1.4" /></g></svg>
        </button>
      )}
      <button type="button" className="sf-main" onClick={props.onEdit}>
        <span className="sf-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="sf-thumb" aria-hidden="true"><SectionIcon type={block.slug} /></span>
        <span className="sf-text">
          <b>{label}</b>
          <small>{row.isLoading ? 'Loading…' : typeof summary === 'string' && summary.trim() ? summary : 'Click to edit'}</small>
        </span>
        {hidden && <span className="sf-badge">Hidden</span>}
        {errors > 0 && <ErrorPill count={errors} i18n={i18n} withMessage />}
      </button>
      {!locked && (
        <div className="sf-actions">
          <IconBtn label={hidden ? 'Show on the page' : 'Hide from the page'} onClick={() => props.onHidden(!hidden)} icon="eye" swap="eyeOff" pressed={hidden} />
          <IconBtn label="Move up" onClick={() => props.onMove(-1)} icon="up" disabled={isFirst} />
          <IconBtn label="Move down" onClick={() => props.onMove(1)} icon="down" disabled={isLast} />
          <IconBtn label="Duplicate" onClick={props.onDuplicate} icon="copy" />
          <IconBtn label="Delete" onClick={props.onRemove} icon="trash" danger />
        </div>
      )}
    </div>
  );
}

function PanelHeader({ label, blockType, path, summaryField, onHidden, onClose }: { label: string; blockType: string; path: string; summaryField?: string; onHidden: (h: boolean) => void; onClose: () => void }) {
  const hidden = useFormFields(([f]) => Boolean(f[`${path}.hidden`]?.value));
  const summary = useFormFields(([f]) => f[`${path}.${summaryField ?? 'heading'}`]?.value);
  const preview = useLivePreviewContext();
  return (
    <div className="sf-panel-head">
      <span className="sf-thumb" aria-hidden="true"><SectionIcon type={blockType} /></span>
      <div className="sf-panel-title">
        <small>Editing section</small>
        <h2>{label}{typeof summary === 'string' && summary.trim() ? <span> · {summary}</span> : null}</h2>
      </div>
      <label className="sf-switch">
        <input type="checkbox" checked={!hidden} onChange={(e) => onHidden(!e.target.checked)} />
        <span aria-hidden="true" />
        {hidden ? 'Hidden' : 'Visible'}
      </label>
      {preview?.isLivePreviewEnabled && (
        <button type="button" className={`sf-btn${preview.isLivePreviewing ? ' is-on' : ''}`} onClick={() => preview.setIsLivePreviewing(!preview.isLivePreviewing)} aria-pressed={preview.isLivePreviewing}>
          {preview.isLivePreviewing ? 'Hide preview' : 'Show preview'}
        </button>
      )}
      <button type="button" className="sf-btn sf-btn-primary" onClick={onClose}>Done</button>
    </div>
  );
}

function IconBtn({ label, onClick, icon, disabled, danger, pressed, swap }: { label: string; onClick: () => void; icon: IconName; disabled?: boolean; danger?: boolean; pressed?: boolean; swap?: IconName }) {
  return (
    <button type="button" className={`sf-icon${danger ? ' is-danger' : ''}`} onClick={onClick} disabled={disabled} aria-label={label} title={label} aria-pressed={pressed}>
      {swap ? <IconSwap a={icon} b={swap} show={pressed ? 'b' : 'a'} size={16} /> : <Icon name={icon} size={16} />}
    </button>
  );
}
