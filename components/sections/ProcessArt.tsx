/**
 * The artwork above each process folder: a small vector scene per step, drawn as isometric slabs
 * and frosted glass panels in the step's hue (--h, --deep and --tint come from .pfx-step, so both
 * themes follow). Steps go in order: discovery, strategy, execution, delivery; a fifth step and
 * beyond start the set again. The pieces marked .pa-float lift a little when the card is hovered.
 */
export function ProcessArt({ index }: { index: number }) {
  const Scene = SCENES[index % SCENES.length];
  return (
    <svg className="pa" viewBox="0 0 240 160" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
}

/** Discovery: a brief on an isometric slab, a magnifying glass reading it with a target in the lens, and a mind map with a lightbulb. */
function Discovery() {
  // a point on the brief's top face: u runs towards the back corner, v towards the front one
  const p = (u: number, v: number) => `${50 + 70 * u + 70 * v} ${95 - 35 * u + 35 * v}`;
  return (
    <>
      <ellipse className="pa-shadow" cx="120" cy="140" rx="74" ry="9" />
      {/* the brief */}
      <path className="pa-mid" d="M50 95v8l70 35v-8z" />
      <path className="pa-tint pa-edge" d="M190 95v8l-70 35v-8z" />
      <path className="pa-sheet" d="M50 95 120 60 190 95 120 130z" />
      {[[0.2, 0.8], [0.32, 0.62], [0.44, 0.72], [0.56, 0.5], [0.68, 0.6]].map(([v, u]) => (
        <path key={v} className="pa-rule" d={`M${p(0.12, v)}L${p(u, v)}`} />
      ))}
      <path className="pa-hue-stroke" d={`M${p(0.12, 0.08)}L${p(0.42, 0.08)}`} strokeWidth="3" />
      {/* the mind map, with the idea at the top */}
      <g className="pa-float">
        <path className="pa-faint pa-dash" d="M44 58 66 46M66 46l22-14M66 46l26 10M44 58l-6 18" />
        <circle className="pa-hue" cx="66" cy="46" r="4.5" />
        <circle className="pa-glass" cx="44" cy="58" r="4" />
        <circle className="pa-glass" cx="92" cy="56" r="3.5" />
        <circle className="pa-glass" cx="38" cy="76" r="3" />
        <path className="pa-glass" d="M82 30a9 9 0 1 1 13 0c-2 2-2.5 3.5-2.5 5.5h-8c0-2-.5-3.5-2.5-5.5z" />
        <path className="pa-stroke" d="M85 39.5h7M86 43h5M88.5 14v-4M100 19l3-3M77 19l-3-3" />
      </g>
      {/* the magnifying glass, with a target in the lens */}
      <g className="pa-float pa-late">
        <path className="pa-handle" d="M166 96l18 20" />
        <circle className="pa-glass" cx="150" cy="78" r="23" />
        <circle className="pa-faint" cx="150" cy="78" r="14" />
        <circle className="pa-hue-stroke" cx="150" cy="78" r="8" />
        <circle className="pa-hue" cx="150" cy="78" r="3" />
        <path className="pa-shine" d="M134 70a17 17 0 0 1 10-10l1.5 3a14 14 0 0 0-8 8z" />
        <circle className="pa-ring" cx="150" cy="78" r="23" />
      </g>
    </>
  );
}

/** Strategy: a blueprint sheet with construction lines, a fan of colour swatches and a type scale. */
function Strategy() {
  return (
    <>
      <ellipse className="pa-shadow" cx="120" cy="142" rx="80" ry="8" />
      {/* the blueprint */}
      <rect className="pa-tint pa-edge" x="28" y="16" width="184" height="120" rx="12" />
      <path className="pa-faint" d={Array.from({ length: 14 }, (_, i) => `M${40 + i * 12} 22v108`).join('') + Array.from({ length: 9 }, (_, i) => `M34 ${28 + i * 12}h172`).join('')} />
      <path className="pa-hue-stroke pa-dash" d="M40 124 200 28M40 28a96 96 0 0 1 96 96" />
      {/* the swatches, fanned */}
      <g className="pa-float">
        {[[-12, 46, 'pa-mid'], [-4, 62, 'pa-deep'], [6, 78, 'pa-hue']].map(([r, x, cls]) => (
          <g key={x as number} transform={`rotate(${r} ${(x as number) + 18} 110)`}>
            <rect className="pa-sheet" x={x as number} y="44" width="36" height="58" rx="6" />
            <rect className={cls as string} x={(x as number) + 4} y="48" width="28" height="32" rx="3" />
            <path className="pa-rule" d={`M${(x as number) + 6} 88h18M${(x as number) + 6} 94h11`} />
          </g>
        ))}
      </g>
      {/* the type scale */}
      <g className="pa-float pa-late">
        <rect className="pa-glass" x="128" y="36" width="72" height="80" rx="10" />
        <text className="pa-type" x="137" y="70" fontSize="30">Aa</text>
        <text className="pa-type" x="138" y="92" fontSize="17">Aa</text>
        <text className="pa-type" x="168" y="92" fontSize="11">Aa</text>
        <path className="pa-rule" d="M138 104h52" />
        <path className="pa-hue-stroke" d="M138 100v8M155 101v6M168 102v4M178 102.5v3M186 103v2" />
      </g>
    </>
  );
}

/** Execution: a design tool window with a layer stack, alignment guides and a bezier curve being drawn with the pen. */
function Execution() {
  return (
    <>
      <ellipse className="pa-shadow" cx="120" cy="142" rx="82" ry="8" />
      {/* the window */}
      <rect className="pa-sheet" x="30" y="18" width="180" height="118" rx="12" />
      <path className="pa-faint" d="M30 34h180M74 34v102" />
      <circle className="pa-hue" cx="42" cy="26" r="2.5" />
      <circle className="pa-mid" cx="50" cy="26" r="2.5" />
      <circle className="pa-mid" cx="58" cy="26" r="2.5" />
      {/* the layers, one selected */}
      {[44, 56, 68, 80].map((y, i) => (
        <g key={y}>
          {i === 1 && <rect className="pa-tint" x="34" y={y - 4} width="36" height="11" rx="3" />}
          <rect className={i === 1 ? 'pa-hue' : 'pa-mid'} x="38" y={y - 1} width="5" height="5" rx="1" />
          <path className="pa-rule" d={`M47 ${y + 1.5}h${[18, 14, 16, 11][i]}`} />
        </g>
      ))}
      {/* alignment guides, with the distance */}
      <path className="pa-guide" d="M148 34v102M74 88h136" />
      <rect className="pa-hue" x="152" y="92" width="18" height="10" rx="3" />
      <text className="pa-label" x="161" y="99.5" textAnchor="middle">24</text>
      {/* the curve, its handles and the pen */}
      <g className="pa-float">
        <path className="pa-stroke pa-thick" d="M92 120C104 64 160 56 190 92" />
        <path className="pa-faint pa-handle-line" d="M92 120 104 64M190 92 160 56" />
        <circle className="pa-glass" cx="104" cy="64" r="3.5" />
        <circle className="pa-glass" cx="160" cy="56" r="3.5" />
        <rect className="pa-sheet pa-anchor" x="88" y="116" width="8" height="8" rx="1.5" />
        <rect className="pa-hue" x="186" y="88" width="8" height="8" rx="1.5" />
      </g>
      <g className="pa-float pa-late" transform="translate(196 98) rotate(-28)">
        <path className="pa-deep" d="M0 0l-8 18 8 10 8-10z" />
        <path className="pa-shine" d="M0 3l-5.5 13 5.5 7z" />
        <circle className="pa-sheet" cx="0" cy="15" r="2.2" />
        <rect className="pa-deep" x="-6" y="28" width="12" height="16" rx="3" />
      </g>
    </>
  );
}

/** Delivery: a folder unzipping, with the files it holds (.SVG, .PNG, .PDF) rising out of it. */
function Delivery() {
  return (
    <>
      <ellipse className="pa-shadow" cx="120" cy="142" rx="72" ry="8" />
      {/* the back of the folder, with its tab */}
      <path className="pa-deep" d="M62 136V60a6 6 0 0 1 6-6h28a6 6 0 0 1 4.5 2l6 7H172a6 6 0 0 1 6 6v67z" />
      {/* the files */}
      <g className="pa-float">
        {[[-14, 70, 34, '.SVG'], [0, 100, 22, '.PNG'], [13, 130, 36, '.PDF']].map(([r, x, y, ext]) => (
          <g key={ext as string} transform={`rotate(${r} ${(x as number) + 20} ${(y as number) + 50})`}>
            <path className="pa-sheet" d={`M${x} ${(y as number) + 4}a4 4 0 0 1 4-4h22l10 10v46a4 4 0 0 1-4 4H${(x as number) + 4}a4 4 0 0 1-4-4z`} />
            <path className="pa-tint" d={`M${(x as number) + 26} ${y}v7a3 3 0 0 0 3 3h7z`} />
            <path className="pa-rule" d={`M${(x as number) + 7} ${(y as number) + 16}h16M${(x as number) + 7} ${(y as number) + 22}h22`} />
            <rect className="pa-hue" x={(x as number) + 5} y={(y as number) + 30} width="27" height="11" rx="5.5" />
            <text className="pa-label" x={(x as number) + 18.5} y={(y as number) + 38} textAnchor="middle">{ext}</text>
          </g>
        ))}
      </g>
      {/* the front, tipped open, with the zip along its top */}
      <path className="pa-hue" d="M56 86h128a4 4 0 0 1 4 4.6L182 132a6 6 0 0 1-6 5H64a6 6 0 0 1-6-5L52 90.6A4 4 0 0 1 56 86z" />
      <path className="pa-shine pa-soft" d="M58 89h124l-1 4H59z" />
      <path className="pa-zip" d="M62 96H150" />
      <g transform="translate(150 96)">
        <rect className="pa-sheet" x="-3" y="-4" width="10" height="8" rx="2" />
        <rect className="pa-sheet" x="0" y="3" width="4" height="10" rx="2" />
      </g>
      {/* a little sparkle for the handover */}
      <path className="pa-hue pa-float pa-late" d="M190 34l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM52 40l1.3 3.7L57 45l-3.7 1.3L52 50l-1.3-3.7L47 45l3.7-1.3z" />
    </>
  );
}

const SCENES = [Discovery, Strategy, Execution, Delivery];
