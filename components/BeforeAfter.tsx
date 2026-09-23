'use client';

import { useState, type ReactNode } from 'react';

/** Drag (or use arrow keys on) the handle to compare two images. */
export function BeforeAfter({ before, after }: { before: ReactNode; after: ReactNode }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="ba" style={{ '--pos': `${pos}%` } as React.CSSProperties}>
      <div className="ba-layer">{after}</div>
      <div className="ba-layer ba-before">{before}</div>
      <span className="ba-tag ba-tag-l">Before</span>
      <span className="ba-tag ba-tag-r">After</span>
      <input className="ba-range" type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Before and after comparison" />
      <span className="ba-handle" aria-hidden="true" />
    </div>
  );
}
