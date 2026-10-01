'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Poster Lab: type a line, pick a layout and an ink, and it is set as a poster in the browser
 * (canvas, so the preview and the download are the same pixels). The PNG carries a small
 * credit line with the studio's name and address. Nothing is uploaded or stored.
 */

type Layout = 'stack' | 'swiss' | 'riso';
type Ink = { key: string; label: string; paper: string; ink: string; spot: string; spot2: string };

const W = 1080, H = 1350, M = 72;
const LAYOUTS: { key: Layout; label: string; hint: string }[] = [
  { key: 'stack', label: 'Stack', hint: 'One word a line, set to the edge' },
  { key: 'swiss', label: 'Swiss', hint: 'A grid, a big number, small type' },
  { key: 'riso', label: 'Riso', hint: 'Two inks, slightly out of register' },
];
const INKS: Ink[] = [
  { key: 'signal', label: 'Signal', paper: '#0B0B0B', ink: '#F5F5F4', spot: '#E8352B', spot2: '#FF6A2B' },
  { key: 'paper', label: 'Paper', paper: '#EEECE4', ink: '#151412', spot: '#E2231A', spot2: '#2E3192' },
  { key: 'riso', label: 'Riso', paper: '#F3EFE6', ink: '#1D3FBB', spot: '#FF48B0', spot2: '#FFE800' },
  { key: 'mono', label: 'Mono', paper: '#FFFFFF', ink: '#0A0A0A', spot: '#0A0A0A', spot2: '#7A7A7A' },
];

const fam = () => getComputedStyle(document.documentElement).getPropertyValue('--font-geist-sans').trim() || 'Helvetica, Arial, sans-serif';
const mono = () => getComputedStyle(document.documentElement).getPropertyValue('--font-geist-mono').trim() || 'ui-monospace, monospace';

/** The largest size (up to `max`) at which `text` fits in `width`. */
function fit(ctx: CanvasRenderingContext2D, text: string, width: number, weight: number, max: number) {
  let size = max;
  ctx.font = `${weight} ${size}px ${fam()}`;
  const w = ctx.measureText(text).width;
  if (w > width) size = Math.floor((size * width) / w);
  return size;
}

function draw(ctx: CanvasRenderingContext2D, layout: Layout, ink: Ink, text: string, credit: string, n: number) {
  const words = (text.trim() || 'Make it loud').split(/\s+/).slice(0, 8);
  ctx.save();
  ctx.fillStyle = ink.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  if (layout === 'stack') {
    ctx.fillStyle = ink.spot;
    ctx.fillRect(M, M, 120, 14);
    let y = M + 60;
    const avail = H - M * 2 - 160;
    // each word fills the width; shrink the lot if the stack would run off the page
    const sizes = words.map((w) => fit(ctx, w.toUpperCase(), W - M * 2, 800, 420));
    const total = sizes.reduce((a, s) => a + s * 0.86, 0);
    const k = Math.min(1, avail / total);
    words.forEach((w, i) => {
      const s = Math.floor(sizes[i] * k);
      y += s * 0.86;
      ctx.font = `800 ${s}px ${fam()}`;
      ctx.fillStyle = i === words.length - 1 ? ink.spot : ink.ink;
      ctx.fillText(w.toUpperCase(), M - s * 0.04, y);
    });
  }

  if (layout === 'swiss') {
    ctx.strokeStyle = ink.ink;
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 2;
    for (let i = 1; i < 6; i++) { const x = M + ((W - M * 2) / 6) * i; ctx.beginPath(); ctx.moveTo(x, M); ctx.lineTo(x, H - M); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = ink.spot;
    ctx.font = `800 520px ${fam()}`;
    ctx.fillText(String(n).padStart(2, '0'), M - 24, M + 430);
    ctx.fillStyle = ink.ink;
    const line = words.join(' ');
    const size = Math.max(64, Math.min(150, fit(ctx, line, (W - M * 2) * 2.2, 700, 150)));
    ctx.font = `700 ${size}px ${fam()}`;
    // wrap into lines that fit the grid
    const lines: string[] = [];
    let cur = '';
    for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > W - M * 2 && cur) { lines.push(cur); cur = w; } else cur = t; }
    lines.push(cur);
    lines.forEach((l, i) => ctx.fillText(l, M, H - M - 120 - (lines.length - 1 - i) * size * 1.02));
    ctx.font = `500 26px ${mono()}`;
    ctx.fillText('No.', M, M + 24);
    ctx.fillText(new Date().getFullYear().toString(), W - M - 80, M + 24);
  }

  if (layout === 'riso') {
    // two overprinted discs, multiplied like real ink
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = ink.spot;
    ctx.beginPath(); ctx.arc(W * 0.62, H * 0.36, 330, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ink.spot2;
    ctx.beginPath(); ctx.arc(W * 0.4, H * 0.48, 280, 0, Math.PI * 2); ctx.fill();
    const line = words.join(' ').toUpperCase();
    const size = Math.min(210, fit(ctx, line, (W - M * 2) * 1.3, 800, 210));
    ctx.font = `800 ${size}px ${fam()}`;
    const lines: string[] = [];
    let cur = '';
    for (const w of line.split(' ')) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > W - M * 2 && cur) { lines.push(cur); cur = w; } else cur = t; }
    lines.push(cur);
    const top = H - M - 130 - (lines.length - 1) * size * 0.92;
    // the same type in two inks, a few pixels apart: misregistration
    lines.forEach((l, i) => { ctx.fillStyle = ink.spot; ctx.fillText(l, M + 6, top + i * size * 0.92 + 4); });
    lines.forEach((l, i) => { ctx.fillStyle = ink.ink; ctx.fillText(l, M, top + i * size * 0.92); });
    ctx.globalCompositeOperation = 'source-over';
  }

  // credit line, always on
  ctx.fillStyle = ink.ink;
  ctx.globalAlpha = 0.7;
  ctx.font = `500 22px ${mono()}`;
  ctx.fillText(credit.toUpperCase(), M, H - M + 30);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function PosterLab({ studio, host }: { studio: string; host: string }) {
  const id = useId();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('Make it loud');
  const [layout, setLayout] = useState<Layout>('stack');
  const [ink, setInk] = useState<Ink>(INKS[0]);
  const [ready, setReady] = useState(false);
  const n = Math.max(1, text.trim().length % 100);
  const credit = `Poster Lab · ${studio} · ${host}`;

  // wait for the site's fonts so the first draw isn't in a fallback face
  useEffect(() => {
    let live = true;
    Promise.all([document.fonts.load(`800 100px ${fam()}`), document.fonts.load(`500 20px ${mono()}`)]).finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (ctx && ready) draw(ctx, layout, ink, text, credit, n);
  }, [layout, ink, text, credit, n, ready]);

  const download = () => {
    canvas.current?.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `poster-${layout}-${(text.trim() || 'poster').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  };

  return (
    <div className="lab">
      <div className="lab-stage">
        <canvas ref={canvas} width={W} height={H} className="lab-canvas" role="img" aria-label={`Poster preview: “${text || 'Make it loud'}” in the ${layout} layout, ${ink.label.toLowerCase()} inks`} />
      </div>
      <form className="lab-panel" onSubmit={(e) => { e.preventDefault(); download(); }}>
        <label className="lab-field" htmlFor={`${id}-text`}>
          <span>Your line</span>
          <input id={`${id}-text`} value={text} maxLength={60} onChange={(e) => setText(e.target.value)} placeholder="Make it loud" autoComplete="off" spellCheck={false} />
          <small>{60 - text.length} characters left</small>
        </label>
        <fieldset className="lab-field">
          <legend>Layout</legend>
          <div className="lab-options">
            {LAYOUTS.map((l) => (
              <label key={l.key} className={`lab-option${layout === l.key ? ' is-on' : ''}`}>
                <input type="radio" name="layout" value={l.key} checked={layout === l.key} onChange={() => setLayout(l.key)} />
                <b>{l.label}</b><small>{l.hint}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="lab-field">
          <legend>Inks</legend>
          <div className="lab-inks">
            {INKS.map((k) => (
              <label key={k.key} className={`lab-ink${ink.key === k.key ? ' is-on' : ''}`} title={k.label}>
                <input type="radio" name="ink" value={k.key} checked={ink.key === k.key} onChange={() => setInk(k)} />
                <span className="lab-swatch" style={{ background: `linear-gradient(135deg, ${k.paper} 0 50%, ${k.spot} 50% 75%, ${k.ink} 75%)` }} aria-hidden="true" />
                <span>{k.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn btn-light" disabled={!ready}>Download PNG</button>
        <p className="lab-note">Made in your browser; nothing is uploaded. Free to share with the credit line.</p>
      </form>
    </div>
  );
}
