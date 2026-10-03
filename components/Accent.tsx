import { Fragment } from 'react';

/**
 * Headings with an accent: words wrapped in asterisks are set in the serif italic, in the accent
 * colour, e.g. "Good ideas. *Made visible.*". An accent that ends the heading after a full
 * sentence ("…. *…*") drops onto its own line, the editorial two-line pattern. The asterisks
 * never show, to sighted readers or screen readers.
 */
export function Accent({ text }: { text?: string | null }) {
  if (!text) return null;
  const parts = text.split(/(\*[^*]+\*)/).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const marked = p.length > 2 && p.startsWith('*') && p.endsWith('*');
        if (!marked) return <Fragment key={i}>{p}</Fragment>;
        const before = parts.slice(0, i).join('').trim();
        const ownLine = i === parts.length - 1 && /[.!?:]$/.test(before);
        return <em key={i} className={`accent${ownLine ? ' accent-line' : ''}`}>{p.slice(1, -1)}</em>;
      })}
    </>
  );
}

/** The same text with the asterisks removed, for labels, titles and alt text. */
export const plain = (text?: string | null) => (text ?? '').replace(/\*([^*]+)\*/g, '$1');
