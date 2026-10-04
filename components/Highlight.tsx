/**
 * The "selected text" mark from a design tool: a tinted box behind the words, a caret at each
 * end with a round handle, and a few sparkles where the selection ends, as if someone just
 * dragged across the word to say "this bit". Decorative only (aria-hidden); the words stay in
 * the text. Styles: `.hl` in globals.css.
 */
export function SelectionMarks() {
  return (
    <>
      <span className="hl-caret is-start" aria-hidden="true" />
      <span className="hl-caret is-end" aria-hidden="true" />
      <Sparkles />
    </>
  );
}

/** Three four-point stars, the big one first, as on a sticker sheet. */
export function Sparkles({ className = 'hl-spark' }: { className?: string }) {
  const star = 'M12 0C12.9 6.6 17.4 11.1 24 12C17.4 12.9 12.9 17.4 12 24C11.1 17.4 6.6 12.9 0 12C6.6 11.1 11.1 6.6 12 0Z';
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path d={star} transform="translate(4 12) scale(1.15)" />
      <path d={star} transform="translate(30 2) scale(.6)" />
      <path d={star} transform="translate(31 30) scale(.5)" />
    </svg>
  );
}

/**
 * A collaborator's cursor with a name tag, as in a shared canvas ("You", "Humphrey"). `tone`
 * picks one of the sticker hues; `side` flips the arrow so the tag can sit left of the pointer.
 */
export function NameCursor({ name, tone = 'green', side = 'right', className = '' }: { name: string; tone?: 'green' | 'violet' | 'amber' | 'red'; side?: 'left' | 'right'; className?: string }) {
  return (
    <span className={`ncur is-${tone} is-${side} ${className}`} aria-hidden="true">
      <svg className="ncur-arrow" viewBox="0 0 16 16" focusable="false"><path d="M1.5 1.5l13 5.2-5.6 1.9-1.9 5.6z" /></svg>
      <span className="ncur-tag">{name}</span>
    </span>
  );
}
