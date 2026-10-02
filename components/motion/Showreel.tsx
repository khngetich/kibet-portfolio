'use client';

import { useState } from 'react';
import { Img } from '@/components/Img';
import { Icon } from '@/components/Icon';
import { Viewer, type ViewItem } from './SampleViewer';

/**
 * The showreel: a wide still with a play button. Pressing it opens the reel full screen in the
 * same viewer as the case-study samples (an uploaded video plays there; a YouTube/Vimeo link
 * plays as an embed). The still is a real button, so it works from the keyboard too.
 */
export function Showreel({ item, poster, label }: { item: ViewItem; poster: unknown; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="reel-still" onClick={() => setOpen(true)} aria-label={label}>
        {poster ? <Img media={poster} sizes="(max-width: 900px) 100vw, 1100px" /> : <span className="reel-blank" aria-hidden="true" />}
        <span className="reel-shade" aria-hidden="true" />
        <span className="reel-play" aria-hidden="true"><Icon name="play" size={26} /></span>
      </button>
      <Viewer items={[item]} index={open ? 0 : null} onIndex={() => {}} onClose={() => setOpen(false)} />
    </>
  );
}
